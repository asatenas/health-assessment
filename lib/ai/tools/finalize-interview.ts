import { tool } from 'ai';
import { z } from 'zod';
import {
  makeChatReadOnlyById,
  updateChatFormById,
  updateChatResultsById,
} from '@/lib/db/queries';

interface finalizeInterviewProps {
  chatId: string;
}

export const finalizeInterview = ({ chatId }: finalizeInterviewProps) =>
  tool({
    description: `Use this tool to finalize the interview.
These are the inputs.
Form - the form data the patient filled in previously.
Results - the scores that were calculated according to the responses given by the patient.`,
    inputSchema: z.object({
      form: z.string(),
      results: z.string(),
    }),
    execute: async ({ form, results }, messages) => {
      await makeChatReadOnlyById({ chatId });
      await updateChatFormById({ chatId, form });
      await updateChatResultsById({ chatId, results });
    },
  });
