import { tool } from 'ai';
import { z } from 'zod';
import { updateChatMedicationsById } from '@/lib/db/queries';

interface SaveMedicationsProps {
  chatId: string;
}

export const saveMedications = ({ chatId }: SaveMedicationsProps) =>
  tool({
    description: `Save the medications suspension table to the database.
Call this tool immediately after generating the medications suspension table from the suspend-medications tool.
Pass the complete markdown table (including headers and all rows) as the medicationsTable parameter.
Use this tool even if there are no medications to suspend.`,
    inputSchema: z.object({
      medicationsTable: z.string(),
    }),
    execute: async ({ medicationsTable }) => {
      await updateChatMedicationsById({
        chatId,
        medications: medicationsTable,
      });
      return 'Medications table saved to database';
    },
  });
