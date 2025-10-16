import { tool } from 'ai';
import { z } from 'zod';
import { makeChatReadOnlyById, updateChatResultsById } from '@/lib/db/queries';

interface finalizeInterviewProps {
  chatId: string;
}

export const finalizeInterview = ({ chatId }: finalizeInterviewProps) =>
  tool({
    description: `Use this tool to finalize the interview. Save the results - the scores that were calculated according to the responses given by the patient.`,
    inputSchema: z.object({
      results: z.string(),
    }),
    execute: async ({ results }, messages) => {
      await makeChatReadOnlyById({ chatId });
      await updateChatResultsById({ chatId, results });
    },
  });
