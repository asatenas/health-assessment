'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';

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

  const infoBasica = [
    `Idade: ${idade || '—'} anos`,
    `Peso: ${peso || '—'} kg`,
    `Altura: ${altura || '—'} m`,
  ].join(' | ');

  const problemasSaudeLabels: any = {
    cardiologicos: 'Problemas no coração',
    respiratorios: 'Problemas respiratórios',
    renais: 'Problemas renais',
    figado: 'Problemas no fígado',
    vasculares: 'Problemas vasculares',
  };

  const problemasSaudeParts = problemasSaude
    ? Object.entries(problemasSaude).map(
        ([key, value]) =>
          `• ${problemasSaudeLabels[key]}: ${formatBool(value as boolean)}`,
      )
    : [];

  const problemasSaudeTxt =
    problemasSaudeParts.length > 0
      ? `Problemas de saúde: ${problemasSaudeParts.join(' | ')}`
      : '';

  const alergiasTexts = [`Alergia a látex: ${formatBool(alergiaLatex)}`];
  if (alergias) {
    alergiasTexts.push(`Outras: ${alergias}`);
  }
  const alergiasTxt = `Alergias: ${alergiasTexts.join(' | ')}`;

  const dispositivos = [
    `Dispositivos: Marca-passo: ${formatBool(marcaPasso)}`,
    `CDI: ${formatBool(cdi)}`,
    `Bomba de medicamentos: ${formatBool(bombaMedicamentos)}`,
  ];
  if (dispositivosOutros) {
    dispositivos.push(`Outros: ${dispositivosOutros}`);
  }
  const dispositivosTxt = dispositivos.join(' | ');

  const itensLabels: any = {
    megaHair: 'Mega Hair',
    apliques: 'Apliques',
    unhaGel: 'Unha de Gel',
    ciliosPosticos: 'Cílios Postiços',
    piercings: 'Piercings',
    lenteContato: 'Lente de contato',
  };

  const itensUsoParts = itensUso
    ? Object.entries(itensUso).map(
        ([key, value]) =>
          `• ${itensLabels[key]}: ${formatBool(value as boolean)}`,
      )
    : [];

  if (itensUsoOutros) {
    itensUsoParts.push(`• Outros: ${itensUsoOutros}`);
  }

  const itensUsoTxt =
    itensUsoParts.length > 0
      ? `Itens de uso: ${itensUsoParts.join(' | ')}`
      : '';

  const drogasLabels: any = {
    cocaina: 'Cocaína',
    maconha: 'Maconha',
    crack: 'Crack',
    opiaceos: 'Opiáceos',
    metanfetamina: 'Metanfetamina',
    alcool: 'Bebidas Alcoólicas',
  };

  const drogasRecreativasParts = drogasRecreativas
    ? Object.entries(drogasRecreativas).map(
        ([key, value]) =>
          `• ${drogasLabels[key]}: ${formatBool(value as boolean)}`,
      )
    : [];

  if (drogasRecreativasOutros) {
    drogasRecreativasParts.push(`• Outros: ${drogasRecreativasOutros}`);
  }

  const drogasRecreativasTxt =
    drogasRecreativasParts.length > 0
      ? `Hábitos e vícios: ${drogasRecreativasParts.join(' | ')}`
      : '';

  const unidades: Record<string, string> = {
    hemoglobina: 'g/dL',
    creatinina: 'mg/dL',
    ecocardiograma: '',
  };

  const examesTxt = `Exames: ${Object.entries(exames)
    .map(([key, dados]) => {
      const nome = key.charAt(0).toUpperCase() + key.slice(1);
      const dadosTyped = dados as { valor?: string; tipo: string };
      return `${nome}: ${dadosTyped.valor || '—'} ${unidades[key]}`;
    })
    .join(' | ')}`;

  const sections = [infoBasica, alergiasTxt, dispositivosTxt, examesTxt];

  if (problemasSaudeTxt) {
    sections.splice(1, 0, problemasSaudeTxt);
  }

  if (itensUsoTxt) {
    sections.splice(problemasSaudeTxt ? 4 : 3, 0, itensUsoTxt);
  }

  if (drogasRecreativasTxt) {
    sections.splice(
      itensUsoTxt && problemasSaudeTxt
        ? 5
        : itensUsoTxt || problemasSaudeTxt
          ? 4
          : 3,
      0,
      drogasRecreativasTxt,
    );
  }

  return sections.join(' | ');
}

interface PreChatFormProps {
  onComplete: (data: PreChatFormData) => void;
  onShowForm: () => void;
  isReadonly: boolean;
}

export function PreChatForm({
  onComplete,
  onShowForm,
  isReadonly,
}: PreChatFormProps) {
  const [showForm, setShowForm] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<PreChatFormData>({
    idade: '',
    peso: '',
    altura: '',
    problemasSaude: {
      cardiologicos: false,
      respiratorios: false,
      renais: false,
      figado: false,
      vasculares: false,
    },
    alergiaLatex: false,
    alergias: '',
    marcaPasso: false,
    cdi: false,
    bombaMedicamentos: false,
    dispositivosOutros: '',
    itensUso: {
      megaHair: false,
      apliques: false,
      unhaGel: false,
      ciliosPosticos: false,
      piercings: false,
    },
    itensUsoOutros: '',
    drogasRecreativas: {
      cocaina: false,
      maconha: false,
      crack: false,
      opiaceos: false,
      metanfetamina: false,
      alcool: false,
    },
    drogasRecreativasOutros: '',
    exames: {
      hemoglobina: { tipo: 'texto', valor: '' },
      creatinina: { tipo: 'texto', valor: '' },
      // ecocardiograma: { tipo: 'texto', valor: '' },
    },
  });

  const totalSteps = 7;

  const stepTitles = [
    'Informações Básicas',
    'Problemas de Saúde',
    'Alergias',
    'Dispositivos Médicos',
    'Itens Estéticos',
    'Hábitos e Vícios',
    'Exames',
  ];

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
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
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
          </div>
        );

      case 2:
        return (
          <div className="space-y-3">
            <p className="text-xs text-gray-600">
              Selecione todas as opções que se aplicam a você
            </p>
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
              <Label htmlFor="problemas-cardiologicos" className="font-normal">
                Problemas no coração
              </Label>
            </div>
            <p className="text-xs text-gray-600 ml-6">
              Doenças relacionadas ao coração e circulação sanguínea. Ex:
              insuficiência cardíaca, arritmia, infarto prévio
            </p>
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
              <Label htmlFor="problemas-respiratorios" className="font-normal">
                Problemas respiratórios
              </Label>
            </div>
            <p className="text-xs text-gray-600 ml-6">
              Dificuldades para respirar ou doenças nos pulmões. Ex: asma,
              bronquite, enfisema
            </p>
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
          </div>
        );

      case 3:
        return (
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="alergia-latex"
                  checked={formData.alergiaLatex}
                  onChange={(e) =>
                    setFormData({ ...formData, alergiaLatex: e.target.checked })
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
          </div>
        );

      case 4:
        return (
          <div className="space-y-3">
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
          </div>
        );

      case 5:
        return (
          <div className="space-y-3">
            <p className="text-xs text-gray-600">
              Selecione todos os itens abaixo que você utiliza no dia a dia.
              Caso não utilize nenhum, deixe os campos em branco.
            </p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between font-normal"
                  type="button"
                >
                  <span
                    className={`text-sm truncate ${
                      Object.values(formData.itensUso).some((v) => v)
                        ? ''
                        : 'text-gray-500'
                    }`}
                  >
                    {(() => {
                      const selected = Object.entries(formData.itensUso)
                        .filter(([, value]) => value)
                        .map(([key]) => {
                          const items = {
                            megaHair: 'Mega-Hair',
                            apliques: 'Apliques sintéticos no cabelo',
                            unhaGel: 'Unha de gel',
                            ciliosPosticos: 'Cílios postiços',
                            piercings: 'Piercings',
                            lenteContato: 'Lente de contato',
                          };
                          return items[key as keyof typeof items];
                        });
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
                {[
                  { key: 'megaHair', label: 'Mega-Hair' },
                  { key: 'apliques', label: 'Apliques sintéticos no cabelo' },
                  { key: 'unhaGel', label: 'Unha de gel' },
                  { key: 'ciliosPosticos', label: 'Cílios postiços' },
                  { key: 'piercings', label: 'Piercings' },
                  { key: 'lenteContato', label: 'Lente de contato' },
                ].map(({ key, label }) => (
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
          </div>
        );

      case 6:
        return (
          <div className="space-y-3">
            <p className="text-xs text-gray-600">
              Selecione todas os hábitos e vícios que se aplicam a você. Caso
              não tenha nenhum, deixe os campos em branco. Esta informação é
              confidencial e essencial para sua segurança durante a cirurgia.
            </p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between font-normal"
                  type="button"
                >
                  <span
                    className={`text-sm truncate ${
                      Object.values(formData.drogasRecreativas).some((v) => v)
                        ? ''
                        : 'text-gray-500'
                    }`}
                  >
                    {(() => {
                      const selected = Object.entries(
                        formData.drogasRecreativas,
                      )
                        .filter(([, value]) => value)
                        .map(([key]) => {
                          const items = {
                            cocaina: 'Cocaína',
                            maconha: 'Maconha',
                            crack: 'Crack',
                            opiaceos:
                              'Opiáceos (fentanil, morfina, codeína...)',
                            metanfetamina: 'Metanfetamina',
                            alcool: 'Bebidas alcoólicas',
                          };
                          return items[key as keyof typeof items];
                        });
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
                {[
                  { key: 'cocaina', label: 'Cocaína' },
                  { key: 'maconha', label: 'Maconha' },
                  { key: 'crack', label: 'Crack' },
                  {
                    key: 'opiaceos',
                    label: 'Opiáceos (Fentanil, morfina, codeína...)',
                  },
                  { key: 'metanfetamina', label: 'Metanfetamina' },
                  { key: 'alcool', label: 'Bebidas Alcoólicas' },
                ].map(({ key, label }) => (
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
          </div>
        );

      case 7:
        return (
          <div className="space-y-4">
            <div>
              <Label>Exame de hemograma</Label>
              <p className="text-xs text-gray-600 mt-1">
                Procure pelo valor de hemoglobina no seu exame de sangue. Caso
                não tenha disponível, deixe o campo em branco.
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-normal">Hemoglobina (g/dL)</Label>
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
                      handleExameFileChange('hemoglobina', e.target.files?.[0])
                    }
                    className="flex-1"
                  />
                )}
              </div>
            </div>

            <div>
              <Label>Exame de creatinina recente</Label>
              <p className="text-xs text-gray-600 mt-1">
                Procure pelo valor de creatinina no seu exame de sangue. Caso
                não tenha disponível, deixe o campo em branco.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-normal">Creatinina (mg/dL)</Label>
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
                      handleExameFileChange('creatinina', e.target.files?.[0])
                    }
                    className="flex-1"
                  />
                )}
              </div>
            </div>
          </div>
        );

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
    <div className="flex-1 overflow-y-auto p-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">{stepTitles[currentStep - 1]}</h2>
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
  );
}
