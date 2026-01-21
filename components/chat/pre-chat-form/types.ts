import type { FormConfiguration } from '@/lib/types/clinic-config';

export interface PreChatFormData {
  idade: string;
  peso: string;
  altura: string;
  nomeCirurgia: string;
  dataCirurgia: string;
  horaCirurgia: string;
  problemasSaude: {
    cardiologicos: boolean;
    respiratorios: boolean;
    renais: boolean;
    figado: boolean;
    vasculares: boolean;
    ortopedicos: boolean;
    digestivos: boolean;
  };
  alergiaLatex: boolean;
  alergias: string;
  marcaPasso: boolean;
  cdi: boolean;
  bombaMedicamentos: boolean;
  dispositivosOutros: string;
  itensUso: {
    megaHair: boolean;
    apliques: boolean;
    unhaGel: boolean;
    ciliosPosticos: boolean;
    piercings: boolean;
  };
  itensUsoOutros: string;
  drogasRecreativas: {
    cocaina: boolean;
    maconha: boolean;
    crack: boolean;
    opiaceos: boolean;
    metanfetamina: boolean;
    alcool: boolean;
    tabaco: boolean;
  };
  drogasRecreativasOutros: string;
  exames: {
    hemoglobina: { tipo: 'texto' | 'arquivo'; valor: string; arquivo?: File };
    creatinina: { tipo: 'texto' | 'arquivo'; valor: string; arquivo?: File };
  };
}

export interface PreChatFormProps {
  onComplete: (data: PreChatFormData) => void;
  onShowForm: () => void;
  isReadonly: boolean;
  formConfig: FormConfiguration;
}

export interface StepProps {
  formData: PreChatFormData;
  setFormData: (data: PreChatFormData) => void;
  formConfig: FormConfiguration;
}
