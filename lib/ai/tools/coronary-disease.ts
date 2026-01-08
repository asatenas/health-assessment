import { tool } from 'ai';
import { z } from 'zod/v3';
import { updateCheckpointByChatId } from '@/lib/db/queries';

export const coronaryDisease = ({ chatId }: { chatId: string }) =>
  tool({
    description: `Use this tool after identifying whether the patient has any coronary diseases.
    This tool will update the checkpoint timestamp for coronaryDisease.`,
    inputSchema: z.object({}),
    execute: async () => {
      await updateCheckpointByChatId({ chatId, name: 'coronaryDisease' });
    },
  });
