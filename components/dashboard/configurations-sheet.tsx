'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import type {
  FormConfiguration,
  FormFieldConfig,
} from '@/lib/types/clinic-config';
import { ChevronDown, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const SECTION_ORDER = [
  'basicInfo',
  'surgery',
  'healthProblems',
  'allergies',
  'medicalDevices',
  'aestheticItems',
  'habitsAndVices',
  'exams',
] as const;

const SECTION_LABELS: Record<string, string> = {
  basicInfo: 'Informações Básicas',
  surgery: 'Cirurgia',
  healthProblems: 'Problemas de Saúde',
  allergies: 'Alergias',
  medicalDevices: 'Dispositivos Médicos',
  aestheticItems: 'Itens Estéticos',
  habitsAndVices: 'Hábitos e Vícios',
  exams: 'Exames',
};

const FIELD_ORDER: Record<string, readonly string[]> = {
  basicInfo: ['idade', 'peso', 'altura'],
  surgery: ['nomeCirurgia', 'dataCirurgia', 'horaCirurgia'],
  healthProblems: [
    'cardiologicos',
    'respiratorios',
    'renais',
    'figado',
    'vasculares',
    'ortopedicos',
    'digestivos',
  ],
  allergies: ['alergiaLatex', 'alergias'],
  medicalDevices: [
    'marcaPasso',
    'cdi',
    'bombaMedicamentos',
    'dispositivosOutros',
  ],
  aestheticItems: [
    'megaHair',
    'apliques',
    'unhaGel',
    'ciliosPosticos',
    'piercings',
    'lenteContato',
    'itensUsoOutros',
  ],
  habitsAndVices: [
    'cocaina',
    'maconha',
    'crack',
    'opiaceos',
    'metanfetamina',
    'alcool',
    'tabaco',
    'drogasRecreativasOutros',
  ],
  exams: ['hemoglobina', 'creatinina'],
};

const FIELD_LABELS: Record<string, string> = {
  // Basic Info
  idade: 'Idade',
  peso: 'Peso',
  altura: 'Altura',
  // Surgery
  nomeCirurgia: 'Nome da Cirurgia',
  dataCirurgia: 'Data',
  horaCirurgia: 'Hora',
  // Health Problems
  cardiologicos: 'Problemas Cardiológicos',
  respiratorios: 'Problemas Respiratórios',
  renais: 'Problemas Renais',
  figado: 'Problemas no Fígado',
  vasculares: 'Problemas Vasculares',
  ortopedicos: 'Problemas Ortopédicos',
  digestivos: 'Problemas Digestivos',
  // Allergies
  alergiaLatex: 'Alergia ao Látex',
  alergias: 'Outras Alergias',
  // Medical Devices
  marcaPasso: 'Marca-passo',
  cdi: 'CDI',
  bombaMedicamentos: 'Bomba de Medicamentos',
  dispositivosOutros: 'Outros Dispositivos',
  // Aesthetic Items
  megaHair: 'Mega Hair',
  apliques: 'Apliques',
  unhaGel: 'Unha de Gel',
  ciliosPosticos: 'Cílios Postiços',
  piercings: 'Piercings',
  lenteContato: 'Lente de Contato',
  itensUsoOutros: 'Outros Itens',
  // Habits and Vices
  cocaina: 'Cocaína',
  maconha: 'Maconha',
  crack: 'Crack',
  opiaceos: 'Opiáceos',
  metanfetamina: 'Metanfetamina',
  alcool: 'Álcool',
  tabaco: 'Tabaco',
  drogasRecreativasOutros: 'Outras Drogas',
  // Exams
  hemoglobina: 'Hemoglobina',
  creatinina: 'Creatinina',
};

// Required sections that cannot be disabled
const REQUIRED_SECTIONS = new Set(['basicInfo']);

// Required fields within sections that cannot be disabled
// Format: { sectionKey: Set of fieldKeys }
const REQUIRED_FIELDS: Record<string, Set<string>> = {
  basicInfo: new Set(['idade', 'peso', 'altura']),
};

interface ConfigurationsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
}

export function ConfigurationsSheet({
  open,
  onOpenChange,
  onSaved,
}: ConfigurationsSheetProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clinicName, setClinicName] = useState('');
  const [formConfig, setFormConfig] = useState<FormConfiguration | null>(null);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      fetchConfig();
    }
  }, [open]);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/clinic/config');
      if (!response.ok) throw new Error('Failed to fetch config');

      const data = await response.json();
      setClinicName(data.clinicName || '');
      setFormConfig(data.formConfig);
      setError(null);
    } catch (error) {
      console.error('Error loading config:', error);
      setError('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch('/api/clinic/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clinicName, formConfig }),
      });

      if (!response.ok) throw new Error('Failed to save');

      onOpenChange(false);
      onSaved?.();
    } catch (error) {
      console.error('Error saving config:', error);
      setError('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const toggleSection = (sectionKey: string) => {
    if (!formConfig) return;

    setFormConfig({
      ...formConfig,
      sections: {
        ...formConfig.sections,
        [sectionKey]: {
          ...formConfig.sections[
            sectionKey as keyof typeof formConfig.sections
          ],
          enabled:
            !formConfig.sections[sectionKey as keyof typeof formConfig.sections]
              .enabled,
        },
      },
    });
  };

  const toggleField = (sectionKey: string, fieldKey: string) => {
    if (!formConfig) return;

    const section =
      formConfig.sections[sectionKey as keyof typeof formConfig.sections];
    const fields = section.fields as Record<string, FormFieldConfig>;
    setFormConfig({
      ...formConfig,
      sections: {
        ...formConfig.sections,
        [sectionKey]: {
          ...section,
          fields: {
            ...fields,
            [fieldKey]: {
              ...fields[fieldKey],
              enabled: !fields[fieldKey].enabled,
            },
          },
        },
      },
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl p-0 flex flex-col"
      >
        <SheetHeader className="px-6 pt-6 pb-4">
          <SheetTitle>Configurações da Clínica</SheetTitle>
          <SheetDescription>
            Configure o nome da clínica e os campos do formulário de avaliação
          </SheetDescription>
        </SheetHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 px-6">
              <div className="space-y-6 pb-6">
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
                    {error}
                  </div>
                )}

                {formConfig ? (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">
                          Informações Gerais
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <Label htmlFor="clinicName">Nome da Clínica</Label>
                          <Input
                            id="clinicName"
                            value={clinicName}
                            onChange={(e) => setClinicName(e.target.value)}
                            placeholder="Ex: Clínica Santa Maria"
                          />
                          <p className="text-xs text-muted-foreground">
                            Este nome será exibido no painel da clínica
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">
                          Configuração do Formulário
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-2">
                          Marque as seções e campos que deseja habilitar no
                          formulário de avaliação. Campos desmarcados não
                          aparecerão para o paciente.
                        </p>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {SECTION_ORDER.map((sectionKey) => {
                            const section =
                              formConfig.sections[
                                sectionKey as keyof typeof formConfig.sections
                              ];
                            return (
                              <Collapsible
                                key={sectionKey}
                                open={openSections[sectionKey]}
                                onOpenChange={(open) =>
                                  setOpenSections({
                                    ...openSections,
                                    [sectionKey]: open,
                                  })
                                }
                              >
                                <div className="border rounded-lg">
                                  <div className="flex items-center justify-between p-3">
                                    <div className="flex items-center gap-3">
                                      <Checkbox
                                        checked={section.enabled}
                                        disabled={REQUIRED_SECTIONS.has(
                                          sectionKey,
                                        )}
                                        onCheckedChange={() =>
                                          toggleSection(sectionKey)
                                        }
                                      />
                                      <span className="font-medium text-sm">
                                        {SECTION_LABELS[sectionKey]}
                                        {REQUIRED_SECTIONS.has(sectionKey) && (
                                          <span className="ml-2 text-xs text-muted-foreground">
                                            (Obrigatório)
                                          </span>
                                        )}
                                      </span>
                                    </div>
                                    <CollapsibleTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <ChevronDown
                                          className={`size-4 transition-transform ${
                                            openSections[sectionKey]
                                              ? 'rotate-180'
                                              : ''
                                          }`}
                                        />
                                      </Button>
                                    </CollapsibleTrigger>
                                  </div>
                                  <CollapsibleContent>
                                    <div className="border-t p-3 space-y-2 bg-muted/50">
                                      {FIELD_ORDER[sectionKey].map(
                                        (fieldKey) => {
                                          const fields =
                                            section.fields as Record<
                                              string,
                                              FormFieldConfig
                                            >;
                                          const field = fields[fieldKey];
                                          return (
                                            <div
                                              key={fieldKey}
                                              className="flex items-center justify-between py-2"
                                            >
                                              <Label
                                                htmlFor={`${sectionKey}-${fieldKey}`}
                                                className={
                                                  !section.enabled
                                                    ? 'text-muted-foreground text-sm'
                                                    : 'text-sm'
                                                }
                                              >
                                                {FIELD_LABELS[fieldKey] ||
                                                  fieldKey}
                                              </Label>
                                              <Checkbox
                                                id={`${sectionKey}-${fieldKey}`}
                                                checked={field.enabled}
                                                disabled={
                                                  !section.enabled ||
                                                  REQUIRED_SECTIONS.has(
                                                    sectionKey,
                                                  ) ||
                                                  REQUIRED_FIELDS[
                                                    sectionKey
                                                  ]?.has(fieldKey)
                                                }
                                                onCheckedChange={() =>
                                                  toggleField(
                                                    sectionKey,
                                                    fieldKey,
                                                  )
                                                }
                                              />
                                            </div>
                                          );
                                        },
                                      )}
                                    </div>
                                  </CollapsibleContent>
                                </div>
                              </Collapsible>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <div className="p-4 text-center text-red-500">
                    Erro ao carregar configurações
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="border-t px-6 py-4 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={saving || !formConfig}>
                {saving ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar'
                )}
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
