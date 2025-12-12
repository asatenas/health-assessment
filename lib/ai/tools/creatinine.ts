import { tool } from 'ai';
import { z } from 'zod';
import { updateCheckpointByChatId } from '@/lib/db/queries';

export const creatinine = ({ chatId }: { chatId: string }) =>
  tool({
    description: `Use this tool after obtaining the creatinine value for the patient's exams, or if they don't have the value.
    This tool will update the checkpoint timestamp for creatinine.`,
    inputSchema: z.object({}),
    execute: async () => {
      console.log('checkpoint creatinine');
      await updateCheckpointByChatId({ chatId, name: 'creatinine' });
    },
  });
