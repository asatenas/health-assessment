import { tool } from 'ai';
import { z } from 'zod/v3';
import {
  updateChatFormById,
  updateChatStatusById,
  updateCheckpointByChatId,
} from '@/lib/db/queries';
import type { FormConfiguration } from '@/lib/types/clinic-config';

// Helper function to get list of enabled fields
function getEnabledFieldsList(formConfig: FormConfiguration): string[] {
  const enabledFields: string[] = [];

  const fieldMapping: Record<string, string[]> = {
    basicInfo: ['age', 'weight', 'height'],
    healthProblems: [
      'healthProblems.cardiac',
      'healthProblems.respiratory',
      'healthProblems.renal',
      'healthProblems.liver',
      'healthProblems.vascular',
    ],
    allergies: ['latexAllergy', 'allergies'],
    medicalDevices: [
      'medicalDevices.paceMaker',
      'medicalDevices.cdi',
      'medicalDevices.medicationPump',
      'medicalDevices.others',
    ],
    aestheticItems: [
      'aestheticItems.megaHair',
      'aestheticItems.hairExtensions',
      'aestheticItems.gelNails',
      'aestheticItems.falseLashes',
      'aestheticItems.piercings',
      'aestheticItems.contactLenses',
      'aestheticItems.others',
    ],
    habitsAndVices: [
      'recreationalDrugs.cocaine',
      'recreationalDrugs.marijuana',
      'recreationalDrugs.crack',
      'recreationalDrugs.opioids',
      'recreationalDrugs.methamphetamine',
      'recreationalDrugs.alcohol',
      'recreationalDrugs.others',
    ],
    exams: ['hemoglobin', 'creatinine'],
  };

  const configKeyMapping: Record<string, Record<string, string>> = {
    basicInfo: { idade: 'age', peso: 'weight', altura: 'height' },
    healthProblems: {
      cardiologicos: 'cardiac',
      respiratorios: 'respiratory',
      renais: 'renal',
      figado: 'liver',
      vasculares: 'vascular',
    },
    allergies: { alergiaLatex: 'latexAllergy', alergias: 'allergies' },
    medicalDevices: {
      marcaPasso: 'paceMaker',
      cdi: 'cdi',
      bombaMedicamentos: 'medicationPump',
      dispositivosOutros: 'others',
    },
    aestheticItems: {
      megaHair: 'megaHair',
      apliques: 'hairExtensions',
      unhaGel: 'gelNails',
      ciliosPosticos: 'falseLashes',
      piercings: 'piercings',
      lenteContato: 'contactLenses',
      itensUsoOutros: 'others',
    },
    habitsAndVices: {
      cocaina: 'cocaine',
      maconha: 'marijuana',
      crack: 'crack',
      opiaceos: 'opioids',
      metanfetamina: 'methamphetamine',
      alcool: 'alcohol',
      drogasRecreativasOutros: 'others',
    },
    exams: { hemoglobina: 'hemoglobin', creatinina: 'creatinine' },
  };

  for (const [sectionKey, section] of Object.entries(formConfig.sections)) {
    if (section.enabled) {
      const mapping = configKeyMapping[sectionKey];
      for (const [fieldKey, field] of Object.entries(section.fields)) {
        if (field.enabled && mapping[fieldKey]) {
          const toolFieldName = mapping[fieldKey];
          if (sectionKey === 'healthProblems') {
            enabledFields.push(`healthProblems.${toolFieldName}`);
          } else if (sectionKey === 'medicalDevices') {
            enabledFields.push(`medicalDevices.${toolFieldName}`);
          } else if (sectionKey === 'aestheticItems') {
            enabledFields.push(`aestheticItems.${toolFieldName}`);
          } else if (sectionKey === 'habitsAndVices') {
            enabledFields.push(`recreationalDrugs.${toolFieldName}`);
          } else {
            enabledFields.push(toolFieldName);
          }
        }
      }
    }
  }

  return enabledFields;
}

interface SaveFormProps {
  chatId: string;
  formConfig: FormConfiguration;
}

export const saveForm = ({ chatId, formConfig }: SaveFormProps) => {
  const enabledFields = getEnabledFieldsList(formConfig);

  return tool({
    description: `Use this tool to save the patient information form data to the db.
Only call this tool once.
This tool should not be used to save the medications list to suspend.

**IMPORTANT:** Only fill in the following enabled fields based on the clinic's configuration:
${enabledFields.join(', ')}

Do not provide values for fields not listed above - leave them undefined or null.`,
    inputSchema: z.object({
      age: z.number().describe('Patient age in years'),
      weight: z.number().describe('Patient weight in kg'),
      height: z.number().describe('Patient height in meters'),
      healthProblems: z
        .object({
          cardiac: z
            .boolean()
            .optional()
            .describe('Has heart/cardiac problems'),
          respiratory: z
            .boolean()
            .optional()
            .describe('Has respiratory problems'),
          renal: z.boolean().optional().describe('Has kidney/renal problems'),
          liver: z.boolean().optional().describe('Has liver problems'),
          vascular: z.boolean().optional().describe('Has vascular problems'),
        })
        .optional()
        .describe('Patient health problems'),
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
};
