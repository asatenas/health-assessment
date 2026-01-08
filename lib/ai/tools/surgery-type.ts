import { tool } from 'ai';
import { z } from 'zod/v3';
import { updateCheckpointByChatId } from '@/lib/db/queries';

export const surgeryType = ({ chatId }: { chatId: string }) =>
  tool({
    description: `Use this tool after knowing the surgery type the patient will undergo.
    This tool will update the checkpoint timestamp for surgeryType.`,
    inputSchema: z.object({}),
    execute: async () => {
      await updateCheckpointByChatId({ chatId, name: 'surgeryType' });
    },
  });
