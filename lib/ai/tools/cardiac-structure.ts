import { tool } from 'ai';
import { z } from 'zod';
import { updateCheckpointByChatId } from '@/lib/db/queries';

export const cardiacStructure = ({ chatId }: { chatId: string }) =>
  tool({
    description: `Use this tool after identifying whether the patient has any cardiac structure (excluding coronary) diseases.
    This tool will update the checkpoint timestamp for cardiacStructure.`,
    inputSchema: z.object({}),
    execute: async () => {
      await updateCheckpointByChatId({ chatId, name: 'cardiacStructure' });
    },
  });
