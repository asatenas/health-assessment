import { tool } from 'ai';
import { z } from 'zod';
import { updateCheckpointByChatId } from '@/lib/db/queries';

export const cerebralIschemia = ({ chatId }: { chatId: string }) =>
  tool({
    description: `Use this tool after identifying whether the patient has any cerebral ischemia.
    This tool will update the checkpoint timestamp for cerebralIschemia.`,
    inputSchema: z.object({}),
    execute: async () => {
      console.log('checkpoint cerebralIschemia');
      await updateCheckpointByChatId({ chatId, name: 'cerebralIschemia' });
    },
  });
