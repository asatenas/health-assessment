import { tool } from 'ai';
import { z } from 'zod/v3';
import { updateCheckpointByChatId } from '@/lib/db/queries';

export const insulin = ({ chatId }: { chatId: string }) =>
  tool({
    description: `Use this tool after knowing if the patient uses insulin or not.
    This tool will update the checkpoint timestamp for insulin.`,
    inputSchema: z.object({}),
    execute: async () => {
      await updateCheckpointByChatId({ chatId, name: 'insulin' });
    },
  });
