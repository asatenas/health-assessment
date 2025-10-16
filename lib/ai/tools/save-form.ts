import { tool } from 'ai';
import { z } from 'zod';
import { updateChatFormById } from '@/lib/db/queries';

interface SaveFormProps {
  chatId: string;
}

export const saveForm = ({ chatId }: SaveFormProps) =>
  tool({
    description: `Save the form data to the database`,
    inputSchema: z.object({
      form: z.string(),
    }),
    execute: async ({ form }, messages) => {
      await updateChatFormById({ chatId, form });
    },
  });
