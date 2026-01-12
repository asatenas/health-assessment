import type { FormConfiguration } from '@/lib/types/clinic-config';

export const DEFAULT_FORM_CONFIG: FormConfiguration = {
  version: 1,
  sections: {
    basicInfo: {
      enabled: true,
      fields: {
        idade: { enabled: true },
        peso: { enabled: true },
        altura: { enabled: true },
      },
    },
    surgery: {
      enabled: true,
      fields: {
        nomeCirurgia: { enabled: true },
        dataCirurgia: { enabled: true },
        horaCirurgia: { enabled: true },
      },
    },
    healthProblems: {
      enabled: false,
      fields: {
        cardiologicos: { enabled: false },
        respiratorios: { enabled: false },
        renais: { enabled: false },
        figado: { enabled: false },
        vasculares: { enabled: false },
        ortopedicos: { enabled: false },
        digestivos: { enabled: false },
      },
    },
    allergies: {
      enabled: true,
      fields: {
        alergiaLatex: { enabled: true },
        alergias: { enabled: true },
      },
    },
    medicalDevices: {
      enabled: true,
      fields: {
        marcaPasso: { enabled: true },
        cdi: { enabled: true },
        bombaMedicamentos: { enabled: true },
        dispositivosOutros: { enabled: true },
      },
    },
    aestheticItems: {
      enabled: true,
      fields: {
        megaHair: { enabled: true },
        apliques: { enabled: true },
        unhaGel: { enabled: true },
        ciliosPosticos: { enabled: true },
        piercings: { enabled: true },
        lenteContato: { enabled: true },
        itensUsoOutros: { enabled: true },
      },
    },
    habitsAndVices: {
      enabled: true,
      fields: {
        cocaina: { enabled: true },
        maconha: { enabled: true },
        crack: { enabled: true },
        opiaceos: { enabled: true },
        metanfetamina: { enabled: true },
        alcool: { enabled: true },
        tabaco: { enabled: true },
        drogasRecreativasOutros: { enabled: true },
      },
    },
    exams: {
      enabled: true,
      fields: {
        hemoglobina: { enabled: true },
        creatinina: { enabled: true },
      },
    },
  },
};
