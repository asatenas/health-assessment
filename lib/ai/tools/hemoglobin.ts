import { tool } from 'ai';
import { z } from 'zod/v3';
import { updateCheckpointByChatId } from '@/lib/db/queries';

export const hemoglobin = ({ chatId }: { chatId: string }) =>
  tool({
    description: `Use this tool after obtaining the hemoglobin value for the patient's exams, or if they don't have the value.
    This tool will update the checkpoint timestamp for hemoglobin.`,
    inputSchema: z.object({}),
    execute: async () => {
      await updateCheckpointByChatId({ chatId, name: 'hemoglobin' });
    },
  });
