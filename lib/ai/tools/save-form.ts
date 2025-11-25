import { tool } from 'ai';
import { z } from 'zod';
import { updateChatFormById, updateChatStatusById } from '@/lib/db/queries';

interface SaveFormProps {
  chatId: string;
}

export const saveForm = ({ chatId }: SaveFormProps) =>
  tool({
    description: `Use this tool to save the patient information form data to the db.
Only call this tool once.
This tool should not be used to save the medications list to suspend.`,
    inputSchema: z.object({
      age: z.number().describe('Patient age in years'),
      weight: z.number().describe('Patient weight in kg'),
      height: z.number().describe('Patient height in cm'),
      allergies: z
        .array(z.string())
        .optional()
        .describe('List of patient allergies'),
      medicalDevices: z
        .object({
          paceMaker: z.boolean().optional(),
          medicationPump: z.boolean().optional(),
        })
        .optional()
        .describe('Medical devices used by patient'),
      hemoglobin: z.number().optional().describe('Hemoglobin level in g/dL'),
      creatinine: z.number().optional().describe('Creatinine level in mg/dL'),
    }),
    execute: async (form, messages) => {
      await updateChatFormById({ chatId, form: JSON.stringify(form) });
      await updateChatStatusById({ chatId, status: 'in_progress' });
    },
  });
