import { tool } from 'ai';
import { z } from 'zod/v3';
import {
  getChatById,
  makeChatReadOnlyById,
  updateChatResultsById,
  updateCheckpointByChatId,
} from '@/lib/db/queries';

interface finalizeInterviewProps {
  chatId: string;
}

export const finalizeInterview = ({ chatId }: finalizeInterviewProps) =>
  tool({
    description: `Use this tool to finalize the interview.
    Save the results - and the scores that were calculated according to the responses given by the patient.
    If the conversation stopped abruptly before completion, mark the chat as incomplete = true and both scores as -1.`,
    inputSchema: z.object({
      results: z.string(),
      score_rcri: z.number(),
      score_aub_has2: z.number(),
      incomplete: z.boolean(),
    }),
    execute: async (
      { results, score_rcri, score_aub_has2, incomplete = false },
      messages,
    ) => {
      await makeChatReadOnlyById({ chatId, incomplete });

      if (incomplete) {
        await updateCheckpointByChatId({ chatId, name: 'interrupted' });
      } else {
        await updateChatResultsById({
          chatId,
          results,
          score_rcri,
          score_aub_has2,
        });
        await updateCheckpointByChatId({ chatId, name: 'completed' });
      }

      // send to external service
      const chat = await getChatById({ id: chatId });

      const webhookUrl = process.env.FINALIZE_INTERVIEW_WEBHOOK_URL;

      if (webhookUrl) {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(chat),
        });

        if (!response.ok) {
          console.error(`HTTP error! status: ${response.status}`);
        }
      }
    },
  });
