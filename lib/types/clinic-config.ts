export type FormFieldConfig = {
  enabled: boolean;
};

export type FormSectionConfig = {
  enabled: boolean;
  fields: Record<string, FormFieldConfig>;
};

export type FormConfiguration = {
  version: number;
  sections: {
    basicInfo: FormSectionConfig;
    healthProblems: FormSectionConfig;
    allergies: FormSectionConfig;
    medicalDevices: FormSectionConfig;
    aestheticItems: FormSectionConfig;
    habitsAndVices: FormSectionConfig;
    exams: FormSectionConfig;
  };
};
