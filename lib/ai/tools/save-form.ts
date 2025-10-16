import { tool } from 'ai';
import { z } from 'zod';
import { updateChatFormById } from '@/lib/db/queries';

interface SaveFormProps {
  chatId: string;
}

export const saveForm = ({ chatId }: SaveFormProps) =>
  tool({
    description: `Use this tool to save the patient information form data to the db.
Only call this tool once.
This tool should not be used to save the medications list to suspend.`,
    inputSchema: z.object({
      form: z.string(),
    }),
    execute: async ({ form }, messages) => {
      await updateChatFormById({ chatId, form });
    },
  });
