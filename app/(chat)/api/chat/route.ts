import {
  convertToModelMessages,
  createUIMessageStream,
  JsonToSseTransformStream,
  smoothStream,
  stepCountIs,
  streamText,
} from 'ai';
import {
  initialMessage,
  type RequestHints,
  systemPrompt,
} from '@/lib/ai/prompts';
import {
  createStreamId,
  deleteChatById,
  getClinicFormConfigByClinicId,
  getMessagesByChatId,
  saveMessages,
} from '@/lib/db/queries';
import { validateChatAccess } from '@/lib/api/chat-guard';
import { convertToUIMessages, generateUUID } from '@/lib/shared/utils';
import { saveForm } from '@/lib/ai/tools/save-form';
import { saveMedications } from '@/lib/ai/tools/save-medications';
import { finalizeInterview } from '@/lib/ai/tools/finalize-interview';
import { isProductionEnvironment } from '@/lib/shared/constants';
import { myProvider } from '@/lib/ai/providers';
// import { entitlementsByUserType } from '@/lib/ai/entitlements';
import { postRequestBodySchema, type PostRequestBody } from './schema';
import { geolocation } from '@vercel/functions';
import {
  createResumableStreamContext,
  type ResumableStreamContext,
} from 'resumable-stream';
import { after } from 'next/server';
import { ChatSDKError } from '@/lib/shared/errors';
import type { ChatMessage } from '@/lib/shared/types';
import type { ChatModel } from '@/lib/ai/models';
import type { VisibilityType } from '@/components/shared/visibility-selector';
import { surgeryType } from '@/lib/ai/tools/surgery-type';
import { insulin } from '@/lib/ai/tools/insulin';
import { creatinine } from '@/lib/ai/tools/creatinine';
import { hemoglobin } from '@/lib/ai/tools/hemoglobin';
import { cerebralIschemia } from '@/lib/ai/tools/cerebral-ischemia';
import { coronaryDisease } from '@/lib/ai/tools/coronary-disease';
import { cardiacStructure } from '@/lib/ai/tools/cardiac-structure';

export const maxDuration = 60;

let globalStreamContext: ResumableStreamContext | null = null;

export function getStreamContext() {
  if (!globalStreamContext) {
    try {
      globalStreamContext = createResumableStreamContext({
        waitUntil: after,
      });
    } catch (error: any) {
      if (error.message.includes('REDIS_URL')) {
        console.log(
          ' > Resumable streams are disabled due to missing REDIS_URL',
        );
      } else {
        console.error(error);
      }
    }
  }

  return globalStreamContext;
}

export async function POST(request: Request) {
  let requestBody: PostRequestBody;

  try {
    const json = await request.json();
    requestBody = postRequestBodySchema.parse(json);
  } catch (_) {
    return new ChatSDKError('bad_request:api').toResponse();
  }

  try {
    const {
      id,
      message,
      messages,
      selectedChatModel,
      // selectedVisibilityType,
    }: {
      id: string;
      message: ChatMessage;
      messages?: ChatMessage[];
      selectedChatModel: ChatModel['id'];
      selectedVisibilityType: VisibilityType;
    } = requestBody;

    const chat = await validateChatAccess(id);

    const messagesFromDb = await getMessagesByChatId({ id });
    const uiMessages = messages
      ? messages
      : [...convertToUIMessages(messagesFromDb), message];

    if (!messages) {
      uiMessages.unshift({
        id: generateUUID(),
        role: 'assistant',
        parts: [
          {
            type: 'text',
            text: initialMessage,
          },
        ],
        metadata: {
          createdAt: new Date(0).toISOString(),
        },
      });
    }

    // Filter out sequential assistant messages, keeping only the last one in each sequence
    const deduplicatedMessages = uiMessages.reduce<typeof uiMessages>(
      (acc, message, index) => {
        // If it's an assistant message, check if the next message is also from assistant
        if (message.role === 'assistant') {
          // Look ahead to see if next message is also from assistant
          const nextMessage = uiMessages[index + 1];
          if (nextMessage && nextMessage.role === 'assistant') {
            // Skip this message, as there's another assistant message coming
            return acc;
          }
        }
        // Keep this message
        acc.push(message);
        return acc;
      },
      [],
    );

    const { longitude, latitude, city, country } = geolocation(request);

    const requestHints: RequestHints = {
      longitude,
      latitude,
      city,
      country,
    };

    await saveMessages({
      messages: [
        {
          chatId: id,
          id: message.id,
          role: 'user',
          parts: message.parts,
          attachments: [],
          createdAt: new Date(),
        },
      ],
    });

    const formConfig = await getClinicFormConfigByClinicId({
      clinicId: chat.userId,
    });

    const streamId = generateUUID();
    await createStreamId({ streamId, chatId: id });

    const stream = createUIMessageStream({
      execute: async ({ writer: dataStream }) => {
        const result = streamText({
          model: myProvider.languageModel(selectedChatModel),
          system: systemPrompt({
            requestHints,
            useGeolocation: false,
            formConfig,
          }),
          messages: await convertToModelMessages(deduplicatedMessages),
          stopWhen: stepCountIs(5),
          experimental_transform: smoothStream({ chunking: 'word' }),
          tools: {
            saveForm: saveForm({ chatId: id, formConfig }),
            saveMedications: saveMedications({ chatId: id }),
            surgeryType: surgeryType({ chatId: id }),
            insulin: insulin({ chatId: id }),
            creatinine: creatinine({ chatId: id }),
            hemoglobin: hemoglobin({ chatId: id }),
            cerebralIschemia: cerebralIschemia({ chatId: id }),
            coronaryDisease: coronaryDisease({ chatId: id }),
            cardiacStructure: cardiacStructure({ chatId: id }),
            finalizeInterview: finalizeInterview({ chatId: id }),
          },
          experimental_telemetry: {
            isEnabled: isProductionEnvironment,
            functionId: 'stream-text',
          },
        });

        result.consumeStream();

        dataStream.merge(
          result.toUIMessageStream({
            sendReasoning: true,
          }),
        );
      },
      generateId: generateUUID,
      onFinish: async ({ messages }) => {
        await saveMessages({
          messages: messages.map((message) => ({
            id: message.id,
            role: message.role,
            parts: message.parts,
            createdAt: new Date(),
            attachments: [],
            chatId: id,
          })),
        });
      },
      onError: () => {
        return 'Oops, an error occurred!';
      },
    });

    const streamContext = getStreamContext();

    if (streamContext) {
      return new Response(
        await streamContext.resumableStream(streamId, () =>
          stream.pipeThrough(new JsonToSseTransformStream()),
        ),
      );
    } else {
      return new Response(stream.pipeThrough(new JsonToSseTransformStream()));
    }
  } catch (error) {
    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }

    console.error('Unhandled error in chat API:', error);
    return new ChatSDKError('offline:chat').toResponse();
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const chatId = searchParams.get('id') ?? '';

  await validateChatAccess(chatId);

  const deletedChat = await deleteChatById({ id: chatId });

  return Response.json(deletedChat, { status: 200 });
}
