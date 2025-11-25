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
Use this tool even if there are no medications to suspend.`,
    inputSchema: z.object({
      medications: z
        .array(
          z.object({
            medicationName: z.string().describe('Name of the medication'),
            suspensionDays: z
              .string()
              .describe('Number of days to suspend the medication'),
          }),
        )
        .describe('Array of medications with their suspension times'),
    }),
    execute: async ({ medications }) => {
      await updateChatMedicationsById({
        chatId,
        medications: JSON.stringify(medications),
      });
      return 'Medications table saved to database';
    },
  });
