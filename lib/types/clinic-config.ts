export type FormFieldConfig = {
  enabled: boolean;
};

// Basic Info Section
export type BasicInfoSectionConfig = {
  enabled: boolean;
  fields: {
    idade: FormFieldConfig;
    peso: FormFieldConfig;
    altura: FormFieldConfig;
  };
};

// Surgery Section
export type SurgerySectionConfig = {
  enabled: boolean;
  fields: {
    nomeCirurgia: FormFieldConfig;
    dataCirurgia: FormFieldConfig;
    horaCirurgia: FormFieldConfig;
  };
};

// Health Problems Section
export type HealthProblemsSectionConfig = {
  enabled: boolean;
  fields: {
    cardiologicos: FormFieldConfig;
    respiratorios: FormFieldConfig;
    renais: FormFieldConfig;
    figado: FormFieldConfig;
    vasculares: FormFieldConfig;
    ortopedicos: FormFieldConfig;
    digestivos: FormFieldConfig;
  };
};

// Allergies Section
export type AllergiesSectionConfig = {
  enabled: boolean;
  fields: {
    alergiaLatex: FormFieldConfig;
    alergias: FormFieldConfig;
  };
};

// Medical Devices Section
export type MedicalDevicesSectionConfig = {
  enabled: boolean;
  fields: {
    marcaPasso: FormFieldConfig;
    cdi: FormFieldConfig;
    bombaMedicamentos: FormFieldConfig;
    dispositivosOutros: FormFieldConfig;
  };
};

// Aesthetic Items Section
export type AestheticItemsSectionConfig = {
  enabled: boolean;
  fields: {
    megaHair: FormFieldConfig;
    apliques: FormFieldConfig;
    unhaGel: FormFieldConfig;
    ciliosPosticos: FormFieldConfig;
    piercings: FormFieldConfig;
    lenteContato: FormFieldConfig;
    itensUsoOutros: FormFieldConfig;
  };
};

// Habits and Vices Section
export type HabitsAndVicesSectionConfig = {
  enabled: boolean;
  fields: {
    cocaina: FormFieldConfig;
    maconha: FormFieldConfig;
    crack: FormFieldConfig;
    opiaceos: FormFieldConfig;
    metanfetamina: FormFieldConfig;
    alcool: FormFieldConfig;
    tabaco: FormFieldConfig;
    drogasRecreativasOutros: FormFieldConfig;
  };
};

// Exams Section
export type ExamsSectionConfig = {
  enabled: boolean;
  fields: {
    hemoglobina: FormFieldConfig;
    creatinina: FormFieldConfig;
  };
};

// Legacy generic type for backward compatibility
export type FormSectionConfig = {
  enabled: boolean;
  fields: Record<string, FormFieldConfig>;
};

export type FormConfiguration = {
  version: number;
  sections: {
    basicInfo: BasicInfoSectionConfig;
    surgery: SurgerySectionConfig;
    healthProblems: HealthProblemsSectionConfig;
    allergies: AllergiesSectionConfig;
    medicalDevices: MedicalDevicesSectionConfig;
    aestheticItems: AestheticItemsSectionConfig;
    habitsAndVices: HabitsAndVicesSectionConfig;
    exams: ExamsSectionConfig;
  };
};
