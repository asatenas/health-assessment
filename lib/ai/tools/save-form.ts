import { tool } from 'ai';
import { z } from 'zod';
import {
  updateChatFormById,
  updateChatStatusById,
  updateCheckpointByChatId,
} from '@/lib/db/queries';

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
      height: z.number().describe('Patient height in meters'),
      latexAllergy: z
        .boolean()
        .optional()
        .describe('Whether patient has latex allergy'),
      allergies: z
        .array(z.string())
        .optional()
        .describe('Other patient allergies'),
      medicalDevices: z
        .object({
          paceMaker: z.boolean().optional().describe('Has pacemaker'),
          cdi: z
            .boolean()
            .optional()
            .describe('Has CDI (implantable cardioverter defibrillator)'),
          medicationPump: z
            .boolean()
            .optional()
            .describe('Has medication pump'),
          others: z
            .array(z.string())
            .optional()
            .describe('Other medical devices'),
        })
        .optional()
        .describe('Medical devices used by patient'),
      aestheticItems: z
        .object({
          megaHair: z.boolean().optional(),
          hairExtensions: z.boolean().optional(),
          gelNails: z.boolean().optional(),
          falseLashes: z.boolean().optional(),
          piercings: z.boolean().optional(),
          contactLenses: z.boolean().optional(),
          others: z
            .array(z.string())
            .optional()
            .describe('Other aesthetic items'),
        })
        .optional()
        .describe('Aesthetic items used by patient'),
      recreationalDrugs: z
        .object({
          cocaine: z.boolean().optional(),
          marijuana: z.boolean().optional(),
          crack: z.boolean().optional(),
          opioids: z.boolean().optional(),
          methamphetamine: z.boolean().optional(),
          alcohol: z.boolean().optional(),
          others: z
            .array(z.string())
            .optional()
            .describe('Other recreational drugs used'),
        })
        .optional()
        .describe('Recreational drugs used by patient'),
      hemoglobin: z.number().optional().describe('Hemoglobin level in g/dL'),
      creatinine: z.number().optional().describe('Creatinine level in mg/dL'),
    }),
    execute: async (form, messages) => {
      await updateChatFormById({ chatId, form: JSON.stringify(form) });
      await updateChatStatusById({ chatId, status: 'in_progress' });
      await updateCheckpointByChatId({ chatId, name: 'formSubmitted' });
    },
  });
