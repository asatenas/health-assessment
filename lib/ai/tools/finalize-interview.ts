import { tool } from 'ai';
import { z } from 'zod';
import {
  getChatById,
  makeChatReadOnlyById,
  updateChatResultsById,
} from '@/lib/db/queries';

interface finalizeInterviewProps {
  chatId: string;
}

export const finalizeInterview = ({ chatId }: finalizeInterviewProps) =>
  tool({
    description: `Use this tool to finalize the interview. Save the results - and the scores that were calculated according to the responses given by the patient.`,
    inputSchema: z.object({
      results: z.string(),
      score_rcri: z.number(),
      score_aub_has2: z.number(),
    }),
    execute: async ({ results, score_rcri, score_aub_has2 }, messages) => {
      await makeChatReadOnlyById({ chatId });
      await updateChatResultsById({
        chatId,
        results,
        score_rcri,
        score_aub_has2,
      });

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
