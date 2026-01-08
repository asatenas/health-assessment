'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { FormConfiguration } from '@/lib/types/clinic-config';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ChevronDown, Info } from 'lucide-react';
import Image from 'next/image';

interface PreChatFormData {
  idade: string;
  peso: string;
  altura: string;
  problemasSaude: {
    cardiologicos: boolean;
    respiratorios: boolean;
    renais: boolean;
    figado: boolean;
    vasculares: boolean;
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
  };
  drogasRecreativasOutros: string;
  exames: {
    hemoglobina: { tipo: 'texto' | 'arquivo'; valor: string; arquivo?: File };
    creatinina: { tipo: 'texto' | 'arquivo'; valor: string; arquivo?: File };
    // ecocardiograma: {
    //   tipo: 'texto' | 'arquivo';
    //   valor: string;
    //   arquivo?: File;
    // };
  };
}

export function formatPacienteInfo(paciente: any) {
  const {
    idade,
    peso,
    altura,
    problemasSaude,
    alergiaLatex,
    alergias,
    marcaPasso,
    cdi,
    bombaMedicamentos,
    dispositivosOutros,
    itensUso,
    itensUsoOutros,
    drogasRecreativas,
    drogasRecreativasOutros,
    exames,
  } = paciente;

  const formatBool = (value: boolean) => (value ? 'Sim' : 'Não');
  const sections: string[] = [];

  // Basic Info
  const basicInfoParts: string[] = [];
  if (idade !== undefined) basicInfoParts.push(`Idade: ${idade || '—'} anos`);
  if (peso !== undefined) basicInfoParts.push(`Peso: ${peso || '—'} kg`);
  if (altura !== undefined) basicInfoParts.push(`Altura: ${altura || '—'} m`);
  if (basicInfoParts.length > 0) {
    sections.push(basicInfoParts.join(' | '));
  }

  // Health Problems
  if (problemasSaude) {
    const problemasSaudeLabels: any = {
      cardiologicos: 'Problemas no coração',
      respiratorios: 'Problemas respiratórios',
      renais: 'Problemas renais',
      figado: 'Problemas no fígado',
      vasculares: 'Problemas vasculares',
    };

    const problemasSaudeParts = Object.entries(problemasSaude)
      .filter(([, value]) => value !== undefined)
      .map(
        ([key, value]) =>
          `• ${problemasSaudeLabels[key]}: ${formatBool(value as boolean)}`,
      );

    if (problemasSaudeParts.length > 0) {
      sections.push(`Problemas de saúde: ${problemasSaudeParts.join(' | ')}`);
    }
  }

  // Allergies
  const alergiasTexts: string[] = [];
  if (alergiaLatex !== undefined) {
    alergiasTexts.push(`Alergia a látex: ${formatBool(alergiaLatex)}`);
  }
  if (alergias !== undefined && alergias) {
    alergiasTexts.push(`Outras: ${alergias}`);
  }
  if (alergiasTexts.length > 0) {
    sections.push(`Alergias: ${alergiasTexts.join(' | ')}`);
  }

  // Medical Devices
  const dispositivos: string[] = [];
  let firstDevice = true;
  if (marcaPasso !== undefined) {
    dispositivos.push(
      `${firstDevice ? 'Dispositivos: ' : ''}Marca-passo: ${formatBool(marcaPasso)}`,
    );
    firstDevice = false;
  }
  if (cdi !== undefined) {
    dispositivos.push(`CDI: ${formatBool(cdi)}`);
    firstDevice = false;
  }
  if (bombaMedicamentos !== undefined) {
    dispositivos.push(
      `Bomba de medicamentos: ${formatBool(bombaMedicamentos)}`,
    );
    firstDevice = false;
  }
  if (dispositivosOutros !== undefined && dispositivosOutros) {
    dispositivos.push(`Outros: ${dispositivosOutros}`);
  }
  if (dispositivos.length > 0) {
    if (firstDevice) {
      dispositivos[0] = `Dispositivos: ${dispositivos[0]}`;
    }
    sections.push(dispositivos.join(' | '));
  }

  // Aesthetic Items
  if (itensUso) {
    const itensLabels: any = {
      megaHair: 'Mega Hair',
      apliques: 'Apliques',
      unhaGel: 'Unha de Gel',
      ciliosPosticos: 'Cílios Postiços',
      piercings: 'Piercings',
      lenteContato: 'Lente de contato',
    };

    const itensUsoParts = Object.entries(itensUso)
      .filter(([, value]) => value !== undefined)
      .map(
        ([key, value]) =>
          `• ${itensLabels[key]}: ${formatBool(value as boolean)}`,
      );

    if (itensUsoOutros !== undefined && itensUsoOutros) {
      itensUsoParts.push(`• Outros: ${itensUsoOutros}`);
    }

    if (itensUsoParts.length > 0) {
      sections.push(`Itens de uso: ${itensUsoParts.join(' | ')}`);
    }
  }

  // Habits and Vices
  if (drogasRecreativas) {
    const drogasLabels: any = {
      cocaina: 'Cocaína',
      maconha: 'Maconha',
      crack: 'Crack',
      opiaceos: 'Opiáceos',
      metanfetamina: 'Metanfetamina',
      alcool: 'Bebidas Alcoólicas',
    };

    const drogasRecreativasParts = Object.entries(drogasRecreativas)
      .filter(([, value]) => value !== undefined)
      .map(
        ([key, value]) =>
          `• ${drogasLabels[key]}: ${formatBool(value as boolean)}`,
      );

    if (drogasRecreativasOutros !== undefined && drogasRecreativasOutros) {
      drogasRecreativasParts.push(`• Outros: ${drogasRecreativasOutros}`);
    }

    if (drogasRecreativasParts.length > 0) {
      sections.push(`Hábitos e vícios: ${drogasRecreativasParts.join(' | ')}`);
    }
  }

  // Exams
  if (exames) {
    const unidades: Record<string, string> = {
      hemoglobina: 'g/dL',
      creatinina: 'mg/dL',
      ecocardiograma: '',
    };

    const examesParts = Object.entries(exames)
      .filter(([, dados]) => dados !== undefined)
      .map(([key, dados]) => {
        const nome = key.charAt(0).toUpperCase() + key.slice(1);
        const dadosTyped = dados as { valor?: string; tipo: string };
        return `${nome}: ${dadosTyped.valor || '—'} ${unidades[key]}`;
      });

    if (examesParts.length > 0) {
      sections.push(`Exames: ${examesParts.join(' | ')}`);
    }
  }

  return sections.join(' | ');
}

interface PreChatFormProps {
  onComplete: (data: PreChatFormData) => void;
  onShowForm: () => void;
  isReadonly: boolean;
  formConfig: FormConfiguration;
}

// Helper to build initial form data based on enabled fields
function buildInitialFormData(config: FormConfiguration): any {
  const data: any = {};

  // Basic Info
  if (config.sections.basicInfo?.enabled) {
    if (config.sections.basicInfo.fields.idade?.enabled) data.idade = '';
    if (config.sections.basicInfo.fields.peso?.enabled) data.peso = '';
    if (config.sections.basicInfo.fields.altura?.enabled) data.altura = '';
  }

  // Health Problems
  if (config.sections.healthProblems?.enabled) {
    const problemasSaude: any = {};
    if (config.sections.healthProblems.fields.cardiologicos?.enabled)
      problemasSaude.cardiologicos = false;
    if (config.sections.healthProblems.fields.respiratorios?.enabled)
      problemasSaude.respiratorios = false;
    if (config.sections.healthProblems.fields.renais?.enabled)
      problemasSaude.renais = false;
    if (config.sections.healthProblems.fields.figado?.enabled)
      problemasSaude.figado = false;
    if (config.sections.healthProblems.fields.vasculares?.enabled)
      problemasSaude.vasculares = false;
    if (Object.keys(problemasSaude).length > 0) {
      data.problemasSaude = problemasSaude;
    }
  }

  // Allergies
  if (config.sections.allergies?.enabled) {
    if (config.sections.allergies.fields.alergiaLatex?.enabled)
      data.alergiaLatex = false;
    if (config.sections.allergies.fields.alergias?.enabled) data.alergias = '';
  }

  // Medical Devices
  if (config.sections.medicalDevices?.enabled) {
    if (config.sections.medicalDevices.fields.marcaPasso?.enabled)
      data.marcaPasso = false;
    if (config.sections.medicalDevices.fields.cdi?.enabled) data.cdi = false;
    if (config.sections.medicalDevices.fields.bombaMedicamentos?.enabled)
      data.bombaMedicamentos = false;
    if (config.sections.medicalDevices.fields.dispositivosOutros?.enabled)
      data.dispositivosOutros = '';
  }

  // Aesthetic Items
  if (config.sections.aestheticItems?.enabled) {
    const itensUso: any = {};
    if (config.sections.aestheticItems.fields.megaHair?.enabled)
      itensUso.megaHair = false;
    if (config.sections.aestheticItems.fields.apliques?.enabled)
      itensUso.apliques = false;
    if (config.sections.aestheticItems.fields.unhaGel?.enabled)
      itensUso.unhaGel = false;
    if (config.sections.aestheticItems.fields.ciliosPosticos?.enabled)
      itensUso.ciliosPosticos = false;
    if (config.sections.aestheticItems.fields.piercings?.enabled)
      itensUso.piercings = false;
    if (config.sections.aestheticItems.fields.lenteContato?.enabled)
      itensUso.lenteContato = false;
    if (Object.keys(itensUso).length > 0) {
      data.itensUso = itensUso;
    }
    if (config.sections.aestheticItems.fields.itensUsoOutros?.enabled)
      data.itensUsoOutros = '';
  }

  // Habits and Vices
  if (config.sections.habitsAndVices?.enabled) {
    const drogasRecreativas: any = {};
    if (config.sections.habitsAndVices.fields.cocaina?.enabled)
      drogasRecreativas.cocaina = false;
    if (config.sections.habitsAndVices.fields.maconha?.enabled)
      drogasRecreativas.maconha = false;
    if (config.sections.habitsAndVices.fields.crack?.enabled)
      drogasRecreativas.crack = false;
    if (config.sections.habitsAndVices.fields.opiaceos?.enabled)
      drogasRecreativas.opiaceos = false;
    if (config.sections.habitsAndVices.fields.metanfetamina?.enabled)
      drogasRecreativas.metanfetamina = false;
    if (config.sections.habitsAndVices.fields.alcool?.enabled)
      drogasRecreativas.alcool = false;
    if (Object.keys(drogasRecreativas).length > 0) {
      data.drogasRecreativas = drogasRecreativas;
    }
    if (config.sections.habitsAndVices.fields.drogasRecreativasOutros?.enabled)
      data.drogasRecreativasOutros = '';
  }

  // Exams
  if (config.sections.exams?.enabled) {
    const exames: any = {};
    if (config.sections.exams.fields.hemoglobina?.enabled)
      exames.hemoglobina = { tipo: 'texto', valor: '' };
    if (config.sections.exams.fields.creatinina?.enabled)
      exames.creatinina = { tipo: 'texto', valor: '' };
    if (Object.keys(exames).length > 0) {
      data.exames = exames;
    }
  }

  return data;
}

export function PreChatForm({
  onComplete,
  onShowForm,
  isReadonly,
  formConfig,
}: PreChatFormProps) {
  const [showForm, setShowForm] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [hemoglobinaTooltipOpen, setHemoglobinaTooltipOpen] = useState(false);
  const [creatininaTooltipOpen, setCreatininaTooltipOpen] = useState(false);

  // Calculate visible steps based on enabled sections
  const visibleSteps = useMemo(() => {
    const steps = [];
    const stepConfig = [
      { key: 'basicInfo', title: 'Informações Básicas', step: 1 },
      { key: 'healthProblems', title: 'Problemas de Saúde', step: 2 },
      { key: 'allergies', title: 'Alergias', step: 3 },
      { key: 'medicalDevices', title: 'Dispositivos Médicos', step: 4 },
      { key: 'aestheticItems', title: 'Itens Estéticos', step: 5 },
      { key: 'habitsAndVices', title: 'Hábitos e Vícios', step: 6 },
      { key: 'exams', title: 'Exames', step: 7 },
    ];

    for (const config of stepConfig) {
      if (
        formConfig.sections[config.key as keyof typeof formConfig.sections]
          ?.enabled
      ) {
        steps.push(config);
      }
    }

    return steps;
  }, [formConfig]);

  // Build initial form data based on enabled fields
  const [formData, setFormData] = useState<PreChatFormData>(() =>
    buildInitialFormData(formConfig),
  );

  const totalSteps = visibleSteps.length;

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(formData);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const validateStep = () => {
    if (currentStep === 1) {
      return (
        formData.idade !== '' && formData.peso !== '' && formData.altura !== ''
      );
    }
    return true;
  };

  const handleExameChange = (
    // exame: 'hemoglobina' | 'creatinina' | 'ecocardiograma',
    exame: 'hemoglobina' | 'creatinina',
    field: 'tipo' | 'valor',
    value: string,
  ) => {
    setFormData({
      ...formData,
      exames: {
        ...formData.exames,
        [exame]: {
          ...formData.exames[exame],
          [field]: value,
        },
      },
    });
  };

  const handleExameFileChange = (
    // exame: 'hemoglobina' | 'creatinina' | 'ecocardiograma',
    exame: 'hemoglobina' | 'creatinina',
    file: File | undefined,
  ) => {
    setFormData({
      ...formData,
      exames: {
        ...formData.exames,
        [exame]: {
          ...formData.exames[exame],
          arquivo: file,
        },
      },
    });
  };

  const renderStep = () => {
    // Get the actual step based on visible steps
    const actualStep = visibleSteps[currentStep - 1];
    if (!actualStep) return null;

    switch (actualStep.step) {
      case 1: {
        const basicInfoConfig = formConfig.sections.basicInfo.fields;
        return (
          <div className="space-y-4">
            {basicInfoConfig.idade?.enabled && (
              <div>
                <Label htmlFor="idade">Idade (anos) *</Label>
                <Input
                  id="idade"
                  type="text"
                  className="text-sm"
                  required
                  value={formData.idade}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Allow only integers with max 2 digits (no decimals)
                    if (value === '' || /^\d{1,2}$/.test(value)) {
                      setFormData({ ...formData, idade: value });
                    }
                  }}
                  placeholder="Ex: 45"
                />
              </div>
            )}

            {basicInfoConfig.peso?.enabled && (
              <div>
                <Label htmlFor="peso">Peso (kg) *</Label>
                <Input
                  id="peso"
                  type="text"
                  className="text-sm"
                  required
                  value={formData.peso}
                  onChange={(e) => {
                    let value = e.target.value;
                    // Replace period with comma
                    value = value.replace('.', ',');
                    // Allow max 3 digits before comma, then optional comma with max 1 decimal place
                    if (
                      value === '' ||
                      /^\d{1,3}$/.test(value) ||
                      /^\d{1,3},\d{0,1}$/.test(value)
                    ) {
                      setFormData({ ...formData, peso: value });
                    }
                  }}
                  placeholder="Ex: 70,5"
                />
              </div>
            )}

            {basicInfoConfig.altura?.enabled && (
              <div>
                <Label htmlFor="altura">Altura (metros) *</Label>
                <Input
                  id="altura"
                  type="text"
                  className="text-sm"
                  required
                  value={formData.altura}
                  onChange={(e) => {
                    let value = e.target.value;
                    // Replace period with comma
                    value = value.replace('.', ',');

                    // Auto-insert comma after first digit if typing 3+ digits without comma
                    if (/^\d{3,}$/.test(value)) {
                      value = `${value[0]},${value.slice(1)}`;
                    }

                    // Allow max 1-2 digits (intermediate) or 1 digit, comma, max 2 decimals
                    if (
                      value === '' ||
                      /^\d{1,2}$/.test(value) ||
                      /^\d{1},\d{0,2}$/.test(value)
                    ) {
                      setFormData({ ...formData, altura: value });
                    }
                  }}
                  placeholder="Ex: 1,75"
                />
              </div>
            )}
          </div>
        );
      }

      case 2: {
        const healthProblemsConfig = formConfig.sections.healthProblems.fields;
        return (
          <div className="space-y-3">
            <p className="text-xs text-gray-600">
              Selecione todas as opções que se aplicam a você
            </p>
            {healthProblemsConfig.cardiologicos?.enabled && (
              <>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="problemas-cardiologicos"
                    checked={formData.problemasSaude.cardiologicos}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        problemasSaude: {
                          ...formData.problemasSaude,
                          cardiologicos: e.target.checked,
                        },
                      })
                    }
                    className="rounded border-gray-300"
                  />
                  <Label
                    htmlFor="problemas-cardiologicos"
                    className="font-normal"
                  >
                    Problemas no coração
                  </Label>
                </div>
                <p className="text-xs text-gray-600 ml-6">
                  Doenças relacionadas ao coração e circulação sanguínea. Ex:
                  insuficiência cardíaca, arritmia, infarto prévio
                </p>
              </>
            )}
            {healthProblemsConfig.respiratorios?.enabled && (
              <>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="problemas-respiratorios"
                    checked={formData.problemasSaude.respiratorios}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        problemasSaude: {
                          ...formData.problemasSaude,
                          respiratorios: e.target.checked,
                        },
                      })
                    }
                    className="rounded border-gray-300"
                  />
                  <Label
                    htmlFor="problemas-respiratorios"
                    className="font-normal"
                  >
                    Problemas respiratórios
                  </Label>
                </div>
                <p className="text-xs text-gray-600 ml-6">
                  Dificuldades para respirar ou doenças nos pulmões. Ex: asma,
                  bronquite, enfisema
                </p>
              </>
            )}
            {healthProblemsConfig.renais?.enabled && (
              <>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="problemas-renais"
                    checked={formData.problemasSaude.renais}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        problemasSaude: {
                          ...formData.problemasSaude,
                          renais: e.target.checked,
                        },
                      })
                    }
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="problemas-renais" className="font-normal">
                    Problemas renais
                  </Label>
                </div>
                <p className="text-xs text-gray-600 ml-6">
                  Doenças nos rins que afetam a filtragem do sangue. Ex:
                  insuficiência renal, pedras nos rins, diálise
                </p>
              </>
            )}
            {healthProblemsConfig.figado?.enabled && (
              <>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="problemas-figado"
                    checked={formData.problemasSaude.figado}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        problemasSaude: {
                          ...formData.problemasSaude,
                          figado: e.target.checked,
                        },
                      })
                    }
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="problemas-figado" className="font-normal">
                    Problemas no fígado
                  </Label>
                </div>
                <p className="text-xs text-gray-600 ml-6">
                  Doenças que afetam o funcionamento do fígado. Ex: hepatite,
                  cirrose, esteatose hepática (gordura no fígado)
                </p>
              </>
            )}
            {healthProblemsConfig.vasculares?.enabled && (
              <>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="problemas-vasculares"
                    checked={formData.problemasSaude.vasculares}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        problemasSaude: {
                          ...formData.problemasSaude,
                          vasculares: e.target.checked,
                        },
                      })
                    }
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="problemas-vasculares" className="font-normal">
                    Problemas vasculares
                  </Label>
                </div>
                <p className="text-xs text-gray-600 ml-6">
                  Problemas nas veias e artérias que transportam o sangue. Ex:
                  varizes, trombose, pressão alta
                </p>
              </>
            )}
          </div>
        );
      }

      case 3: {
        const allergiesConfig = formConfig.sections.allergies.fields;
        return (
          <div className="space-y-3">
            {allergiesConfig.alergiaLatex?.enabled && (
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="alergia-latex"
                    checked={formData.alergiaLatex}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        alergiaLatex: e.target.checked,
                      })
                    }
                    className="rounded border-gray-300"
                  />
                  <Label
                    htmlFor="alergia-latex"
                    className="font-bold text-red-600"
                  >
                    Alergia a látex
                  </Label>
                </div>
                <p className="text-xs text-gray-600 ml-6">
                  Deixe selecionado caso você tenha alergia a látex
                </p>
              </div>
            )}
            {allergiesConfig.alergias?.enabled && (
              <div>
                <Label htmlFor="alergias" className="text-sm">
                  Outras alergias
                </Label>
                <Input
                  id="alergias"
                  type="text"
                  className="text-sm"
                  value={formData.alergias}
                  onChange={(e) =>
                    setFormData({ ...formData, alergias: e.target.value })
                  }
                  placeholder="Ex: penicilina, outros medicamentos..."
                />
              </div>
            )}
          </div>
        );
      }

      case 4: {
        const medicalDevicesConfig = formConfig.sections.medicalDevices.fields;
        return (
          <div className="space-y-3">
            {medicalDevicesConfig.marcaPasso?.enabled && (
              <>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="marca-passo"
                    checked={formData.marcaPasso}
                    onChange={(e) =>
                      setFormData({ ...formData, marcaPasso: e.target.checked })
                    }
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="marca-passo" className="font-normal">
                    Marca-passos
                  </Label>
                </div>
                <p className="text-xs text-gray-600 ml-6">
                  Deixe selecionado caso você tenha um marca passo
                </p>
              </>
            )}
            {medicalDevicesConfig.cdi?.enabled && (
              <>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="cdi"
                    checked={formData.cdi}
                    onChange={(e) =>
                      setFormData({ ...formData, cdi: e.target.checked })
                    }
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="cdi" className="font-normal">
                    CDI
                  </Label>
                </div>
                <p className="text-xs text-gray-600 ml-6">
                  Deixe selecionado caso você tenha um CDI (cardioversor
                  desfibrilador implantável)
                </p>
              </>
            )}
            {medicalDevicesConfig.bombaMedicamentos?.enabled && (
              <>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="bomba-medicamentos"
                    checked={formData.bombaMedicamentos}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bombaMedicamentos: e.target.checked,
                      })
                    }
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="bomba-medicamentos" className="font-normal">
                    Bomba de medicamentos implantada
                  </Label>
                </div>
                <p className="text-xs text-gray-600 ml-6">
                  Deixe selecionado caso você tenha uma bomba de medicamentos
                  implantada
                </p>
              </>
            )}
            {medicalDevicesConfig.dispositivosOutros?.enabled && (
              <div>
                <Label htmlFor="dispositivos-outros" className="text-sm">
                  Outros dispositivos médicos
                </Label>
                <Input
                  id="dispositivos-outros"
                  type="text"
                  className="text-sm"
                  value={formData.dispositivosOutros}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      dispositivosOutros: e.target.value,
                    })
                  }
                  placeholder="Ex: implante coclear, próteses..."
                />
              </div>
            )}
          </div>
        );
      }

      case 5: {
        const aestheticItemsConfig = formConfig.sections.aestheticItems.fields;
        const aestheticItemsOptions = [
          { key: 'megaHair', label: 'Mega-Hair' },
          { key: 'apliques', label: 'Apliques sintéticos no cabelo' },
          { key: 'unhaGel', label: 'Unha de gel' },
          { key: 'ciliosPosticos', label: 'Cílios postiços' },
          { key: 'piercings', label: 'Piercings' },
          { key: 'lenteContato', label: 'Lente de contato' },
        ].filter(
          ({ key }) =>
            aestheticItemsConfig[key as keyof typeof aestheticItemsConfig]
              ?.enabled,
        );

        const aestheticItemsLabels = {
          megaHair: 'Mega-Hair',
          apliques: 'Apliques sintéticos no cabelo',
          unhaGel: 'Unha de gel',
          ciliosPosticos: 'Cílios postiços',
          piercings: 'Piercings',
          lenteContato: 'Lente de contato',
        };

        return (
          <div className="space-y-3">
            <p className="text-xs text-gray-600">
              Selecione todos os itens abaixo que você utiliza no dia a dia.
              Caso não utilize nenhum, deixe os campos em branco.
            </p>
            {aestheticItemsOptions.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between font-normal"
                    type="button"
                  >
                    <span
                      className={`text-sm truncate ${
                        Object.entries(formData.itensUso)
                          .filter(
                            ([key]) =>
                              aestheticItemsConfig[
                                key as keyof typeof aestheticItemsConfig
                              ]?.enabled,
                          )
                          .some(([, value]) => value)
                          ? ''
                          : 'text-gray-500'
                      }`}
                    >
                      {(() => {
                        const selected = Object.entries(formData.itensUso)
                          .filter(
                            ([key]) =>
                              aestheticItemsConfig[
                                key as keyof typeof aestheticItemsConfig
                              ]?.enabled,
                          )
                          .filter(([, value]) => value)
                          .map(
                            ([key]) =>
                              aestheticItemsLabels[
                                key as keyof typeof aestheticItemsLabels
                              ],
                          );
                        if (selected.length === 0) {
                          return 'Selecione os itens aqui...';
                        } else if (selected.length === 1) {
                          return `${selected.length} item selecionado`;
                        } else {
                          return `${selected.length} itens selecionados`;
                        }
                      })()}
                    </span>
                    <ChevronDown className="size-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
                  {aestheticItemsOptions.map(({ key, label }) => (
                    <DropdownMenuCheckboxItem
                      key={key}
                      checked={
                        formData.itensUso[key as keyof typeof formData.itensUso]
                      }
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          itensUso: {
                            ...formData.itensUso,
                            [key]: checked,
                          },
                        })
                      }
                      onSelect={(e) => e.preventDefault()}
                    >
                      {label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {aestheticItemsConfig.itensUsoOutros?.enabled && (
              <div>
                <Label htmlFor="itens-uso-outros" className="text-sm">
                  Outros itens estéticos
                </Label>
                <Input
                  id="itens-uso-outros"
                  type="text"
                  className="text-sm"
                  value={formData.itensUsoOutros}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      itensUsoOutros: e.target.value,
                    })
                  }
                  placeholder="Ex: extensões de cabelo, procedimentos estéticos..."
                />
              </div>
            )}
          </div>
        );
      }

      case 6: {
        const habitsAndVicesConfig = formConfig.sections.habitsAndVices.fields;
        const habitsAndVicesOptions = [
          { key: 'cocaina', label: 'Cocaína' },
          { key: 'maconha', label: 'Maconha' },
          { key: 'crack', label: 'Crack' },
          {
            key: 'opiaceos',
            label: 'Opiáceos (Fentanil, morfina, codeína...)',
          },
          { key: 'metanfetamina', label: 'Metanfetamina' },
          { key: 'alcool', label: 'Bebidas Alcoólicas' },
        ].filter(
          ({ key }) =>
            habitsAndVicesConfig[key as keyof typeof habitsAndVicesConfig]
              ?.enabled,
        );

        const habitsAndVicesLabels = {
          cocaina: 'Cocaína',
          maconha: 'Maconha',
          crack: 'Crack',
          opiaceos: 'Opiáceos (fentanil, morfina, codeína...)',
          metanfetamina: 'Metanfetamina',
          alcool: 'Bebidas alcoólicas',
        };

        return (
          <div className="space-y-3">
            <p className="text-xs text-gray-600">
              Selecione todas os hábitos e vícios que se aplicam a você. Caso
              não tenha nenhum, deixe os campos em branco. Esta informação é
              confidencial e essencial para sua segurança durante a cirurgia.
            </p>
            {habitsAndVicesOptions.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between font-normal"
                    type="button"
                  >
                    <span
                      className={`text-sm truncate ${
                        Object.entries(formData.drogasRecreativas)
                          .filter(
                            ([key]) =>
                              habitsAndVicesConfig[
                                key as keyof typeof habitsAndVicesConfig
                              ]?.enabled,
                          )
                          .some(([, value]) => value)
                          ? ''
                          : 'text-gray-500'
                      }`}
                    >
                      {(() => {
                        const selected = Object.entries(
                          formData.drogasRecreativas,
                        )
                          .filter(
                            ([key]) =>
                              habitsAndVicesConfig[
                                key as keyof typeof habitsAndVicesConfig
                              ]?.enabled,
                          )
                          .filter(([, value]) => value)
                          .map(
                            ([key]) =>
                              habitsAndVicesLabels[
                                key as keyof typeof habitsAndVicesLabels
                              ],
                          );
                        if (selected.length === 0) {
                          return 'Selecione os itens aqui...';
                        } else if (selected.length === 1) {
                          return `${selected.length} item selecionado`;
                        } else {
                          return `${selected.length} itens selecionados`;
                        }
                      })()}
                    </span>
                    <ChevronDown className="size-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
                  {habitsAndVicesOptions.map(({ key, label }) => (
                    <DropdownMenuCheckboxItem
                      key={key}
                      checked={
                        formData.drogasRecreativas[
                          key as keyof typeof formData.drogasRecreativas
                        ]
                      }
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          drogasRecreativas: {
                            ...formData.drogasRecreativas,
                            [key]: checked,
                          },
                        })
                      }
                      onSelect={(e) => e.preventDefault()}
                    >
                      {label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {habitsAndVicesConfig.drogasRecreativasOutros?.enabled && (
              <div>
                <Label htmlFor="drogas-recreativas-outros" className="text-sm">
                  Outras drogas recreativas
                </Label>
                <Input
                  id="drogas-recreativas-outros"
                  type="text"
                  className="text-sm"
                  value={formData.drogasRecreativasOutros}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      drogasRecreativasOutros: e.target.value,
                    })
                  }
                  placeholder="Ex: LSD, ecstasy, outras substâncias..."
                />
              </div>
            )}
          </div>
        );
      }

      case 7: {
        const examsConfig = formConfig.sections.exams.fields;
        return (
          <div className="space-y-4">
            {examsConfig.hemoglobina?.enabled && (
              <>
                <div>
                  <Label>Exame de hemograma</Label>
                  <p className="text-xs text-gray-600 mt-1">
                    Procure pelo valor de hemoglobina no seu exame de sangue.
                    Caso não tenha disponível, deixe o campo em branco.
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm font-normal">
                      Hemoglobina (g/dL)
                    </Label>
                    <Tooltip open={hemoglobinaTooltipOpen}>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={() =>
                            setHemoglobinaTooltipOpen(!hemoglobinaTooltipOpen)
                          }
                          onPointerEnter={(e) => e.preventDefault()}
                          onPointerLeave={(e) => e.preventDefault()}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          <Info className="size-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent
                        className="p-0 max-w-xs sm:max-w-md"
                        onPointerDownOutside={() =>
                          setHemoglobinaTooltipOpen(false)
                        }
                        onEscapeKeyDown={() => setHemoglobinaTooltipOpen(false)}
                      >
                        <Image
                          src="/images/exams/hemoglobina.jpeg"
                          alt="Exemplo de exame de hemoglobina"
                          width={400}
                          height={300}
                          className="rounded-md"
                        />
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="flex gap-2">
                    {formData.exames.hemoglobina.tipo === 'texto' ? (
                      <Input
                        type="text"
                        className="flex-1 text-sm"
                        value={formData.exames.hemoglobina.valor}
                        onChange={(e) => {
                          let value = e.target.value;
                          // Replace period with comma
                          value = value.replace('.', ',');
                          // Allow max 2 digits before comma, then optional comma with max 1 decimal place
                          if (
                            value === '' ||
                            /^\d{1,2}$/.test(value) ||
                            /^\d{1,2},\d{0,1}$/.test(value)
                          ) {
                            handleExameChange('hemoglobina', 'valor', value);
                          }
                        }}
                        placeholder="Ex: 13,2"
                      />
                    ) : (
                      <Input
                        type="file"
                        onChange={(e) =>
                          handleExameFileChange(
                            'hemoglobina',
                            e.target.files?.[0],
                          )
                        }
                        className="flex-1"
                      />
                    )}
                  </div>
                </div>
              </>
            )}

            {examsConfig.creatinina?.enabled && (
              <>
                <div>
                  <Label>Exame de creatinina recente</Label>
                  <p className="text-xs text-gray-600 mt-1">
                    Procure pelo valor de creatinina no seu exame de sangue.
                    Caso não tenha disponível, deixe o campo em branco.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm font-normal">
                      Creatinina (mg/dL)
                    </Label>
                    <Tooltip open={creatininaTooltipOpen}>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={() =>
                            setCreatininaTooltipOpen(!creatininaTooltipOpen)
                          }
                          onPointerEnter={(e) => e.preventDefault()}
                          onPointerLeave={(e) => e.preventDefault()}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          <Info className="size-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent
                        className="p-0 max-w-xs sm:max-w-md"
                        onPointerDownOutside={() =>
                          setCreatininaTooltipOpen(false)
                        }
                        onEscapeKeyDown={() => setCreatininaTooltipOpen(false)}
                      >
                        <Image
                          src="/images/exams/creatinina.jpeg"
                          alt="Exemplo de exame de creatinina"
                          width={400}
                          height={300}
                          className="rounded-md"
                        />
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="flex gap-2">
                    {formData.exames.creatinina.tipo === 'texto' ? (
                      <Input
                        type="text"
                        className="flex-1 text-sm"
                        value={formData.exames.creatinina.valor}
                        onChange={(e) => {
                          let value = e.target.value;
                          // Replace period with comma
                          value = value.replace('.', ',');
                          // Allow max 1 digit before comma, then optional comma with max 1 decimal place
                          if (
                            value === '' ||
                            /^\d{1}$/.test(value) ||
                            /^\d{1},\d{0,1}$/.test(value)
                          ) {
                            handleExameChange('creatinina', 'valor', value);
                          }
                        }}
                        placeholder="Ex: 1,1"
                      />
                    ) : (
                      <Input
                        type="file"
                        onChange={(e) =>
                          handleExameFileChange(
                            'creatinina',
                            e.target.files?.[0],
                          )
                        }
                        className="flex-1"
                      />
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        );
      }

      default:
        return null;
    }
  };

  if (isReadonly) {
    return;
  }

  if (!showForm) {
    return (
      <div className="justify-end py-4">
        <div className="max-w-4xl mx-auto flex justify-end pr-6">
          <Button
            onClick={() => {
              setShowForm(true);
              onShowForm();
            }}
            size="lg"
            className="min-w-[140px]"
          >
            Começar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">
              {visibleSteps[currentStep - 1]?.title || ''}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Passo {currentStep} de {totalSteps}
            </p>
          </div>
          <form onSubmit={handleNext} className="space-y-6">
            {renderStep()}

            <div className="flex justify-between pt-4">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="min-w-[140px]"
                  size="lg"
                >
                  Voltar
                </Button>
              )}
              <Button
                type="submit"
                className="min-w-[140px] ml-auto"
                size="lg"
                disabled={!validateStep()}
              >
                Continuar
              </Button>
            </div>
          </form>
        </div>
      </div>
    </TooltipProvider>
  );
}
