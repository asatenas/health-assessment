import { tool } from 'ai';
import { z } from 'zod/v3';

interface SuspendMedicationsProps {
  chatId: string;
}

export const suspendMedications = ({ chatId }: SuspendMedicationsProps) =>
  tool({
    description: `You are a specialist in perioperative medicine and anesthesiology.
Your task is to analyze the list of medications a patient is currently taking and identify which of them should be suspended before elective surgery.

Follow these strict rules:

### FIXED RULES (do not modify these suspension times)
*GLP-1 analogs*
•  Semaglutida: 21 days
•  Tirzepatida (Monjaro): 14 days
•  Dulaglutida: 15 days
•  Liraglutida: 72 hours
•  Exenatida: 72 hours

*Antiplatelet agents*
•  AAS (aspirin): 7 days
•  Clopidogrel: 5 days
•  Ticagrelor: 5 days
•  Prasugrel: 7 days

*Anticoagulants*
•  Warfarin: 5 days
•  Rivaroxabana: 48 hours
•  Apixabana: 48 hours
•  Dabigatrana: 48-72 hours
•  Heparina não fracionada (profilática): 12 hours
•  Enoxaparina: 24 hours

*Naltrexone*
•  72 hours

*Herbal / natural products*
•  Ginkgo biloba: 7 days

### FLEXIBLE RULES
•  For any other medication not listed above, you may use your medical knowledge to suggest if it needs to be suspended, and for how long.
•  If suspension is not needed, mark as “Não suspender”.

### OUTPUT INSTRUCTIONS
•  Output must be a *table* with 3 columns: *Medicação | Classe | Tempo de suspensão*
•  Do not add explanations, comments or guidelines outside the table.
•  All answers must be in *Brazilian Portuguese*.

Example patient input:
"Uso semaglutida semanal, varfarina, ginkgo biloba, propranolol, e vitamina E."

Expected output:
| Medicação   | Classe                     | Tempo de suspensão |
|-------------|----------------------------|-------------------|
| Semaglutida | Análogo GLP-1              | 21 dias           |
| Varfarina   | Anticoagulante             | 5 dias            |
| Ginkgo biloba| Fitoterápico              | 7 dias            |
| Propranolol | Betabloqueador             | Não suspender     |
| Vitamina E  | Suplemento (não listado)   | 7 dias (risco de sangramento) |
`,
    inputSchema: z.object({
      medications: z.array(z.string()),
    }),
    execute: async ({ medications }, messages) => {
      return medications;
    },
  });
