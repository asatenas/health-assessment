'use client';

import { useState, useEffect, useRef } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import type {
  FormConfiguration,
  FormFieldConfig,
  DashboardConfiguration,
} from '@/lib/types/clinic-config';
import { ChevronDown, Loader2, Users } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UserSelectionDialog } from '@/components/admin/user-selection-dialog';
import { useSession } from 'next-auth/react';
import { UsersTab } from './configurations-sheet/users-tab';
import {
  AccountTab,
  type AccountTabRef,
} from './configurations-sheet/account-tab';

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

// Dashboard widgets configuration
const DASHBOARD_WIDGETS = [
  {
    key: 'metricsOverview',
    label: 'Visão Geral de Métricas',
    description: 'Cards com estatísticas principais',
  },
  {
    key: 'riskDistribution',
    label: 'Distribuição de Risco',
    description: 'Gráfico de pizza de riscos',
  },
  {
    key: 'timeline',
    label: 'Linha do Tempo',
    description: 'Histórico de avaliações',
  },
  {
    key: 'cancellations',
    label: 'Cancelamentos e Reagendamentos',
    description: 'Gráfico de status de cirurgias',
  },
  {
    key: 'todaysSurgeries',
    label: 'Cirurgias de Hoje',
    description: 'Cartões das cirurgias agendadas para hoje',
  },
  {
    key: 'weeklySurgeries',
    label: 'Cirurgias da Semana',
    description: 'Calendário semanal de cirurgias',
  },
  {
    key: 'monthlySurgeries',
    label: 'Cirurgias do Mês',
    description: 'Calendário mensal de cirurgias',
  },
  {
    key: 'notifications',
    label: 'Notificações',
    description: 'Alertas e lembretes importantes',
  },
] as const;

interface ConfigurationsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
  initialClinicName: string;
}

export function ConfigurationsSheet({
  open,
  onOpenChange,
  onSaved,
  initialClinicName,
}: ConfigurationsSheetProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clinicName, setClinicName] = useState(initialClinicName);
  const [formConfig, setFormConfig] = useState<FormConfiguration | null>(null);
  const [dashboardConfig, setDashboardConfig] =
    useState<DashboardConfiguration | null>(null);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [showImpersonationDialog, setShowImpersonationDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('account');
  const { data: session } = useSession();
  const accountTabRef = useRef<AccountTabRef>(null);

  // Check if user is secretary or clinician (only see Account tab)
  const isBasicUser =
    session?.user?.role === 'secretary' || session?.user?.role === 'clinician';

  // Basic users don't have access to form/dashboard configs
  const hasAdvancedConfigs = !isBasicUser && formConfig && dashboardConfig;

  useEffect(() => {
    if (open) {
      fetchConfig();
    }
  }, [open]);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/clinic/config');
      if (!response.ok) {
        throw new Error('Failed to fetch config');
      }
      setError(null);

      const data = await response.json();
      setClinicName(data.clinicName);
      // For basic users, formConfig and dashboardConfig will be undefined
      setFormConfig(data.formConfig || null);
      setDashboardConfig(data.dashboardConfig || null);

      // Set default tab based on user role
      if (isBasicUser) {
        setActiveTab('account');
      } else if (data.formConfig && data.dashboardConfig) {
        setActiveTab('form');
      } else {
        setActiveTab('account');
      }
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
      // If on account tab, save profile
      if (activeTab === 'account') {
        await accountTabRef.current?.saveProfile();
        onOpenChange(false);
        onSaved?.();
        return;
      }

      // Otherwise, save clinic configs (admin users only)
      if (isBasicUser) {
        return;
      }

      const payload: {
        clinicName: string;
        formConfig?: FormConfiguration | null;
        dashboardConfig?: DashboardConfiguration | null;
      } = { clinicName };

      // Only include configs if they exist (non-basic users)
      if (formConfig) {
        payload.formConfig = formConfig;
      }
      if (dashboardConfig) {
        payload.dashboardConfig = dashboardConfig;
      }

      const response = await fetch('/api/clinic/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to save');
      }

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
    if (!formConfig) {
      return;
    }
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
    if (!formConfig) {
      return;
    }
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

  const toggleWidget = (widgetKey: string) => {
    if (!dashboardConfig) {
      return;
    }
    setDashboardConfig({
      ...dashboardConfig,
      widgets: {
        ...dashboardConfig.widgets,
        [widgetKey]: {
          ...dashboardConfig.widgets[
            widgetKey as keyof typeof dashboardConfig.widgets
          ],
          enabled:
            !dashboardConfig.widgets[
              widgetKey as keyof typeof dashboardConfig.widgets
            ].enabled,
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
            {isBasicUser
              ? 'Gerencie suas configurações de conta'
              : 'Configure o nome da clínica, os campos do formulário e os widgets do dashboard'}
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

                {
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
                            disabled={!hasAdvancedConfigs}
                            readOnly={!hasAdvancedConfigs}
                            className={
                              !hasAdvancedConfigs
                                ? 'bg-muted cursor-not-allowed'
                                : ''
                            }
                          />
                          <p className="text-xs text-muted-foreground">
                            {hasAdvancedConfigs &&
                              'Este nome será exibido no painel da clínica'}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    {session?.user?.platformAdmin &&
                      !session?.impersonation && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">
                              Administração de Plataforma
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <Button
                                variant="outline"
                                className="w-full justify-start"
                                onClick={() => setShowImpersonationDialog(true)}
                              >
                                <Users className="size-4 mr-2" />
                                Personificar Usuário
                              </Button>
                              <p className="text-xs text-muted-foreground">
                                Visualize o sistema como qualquer usuário ativo
                                para fins de suporte e teste
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                    <Tabs
                      defaultValue={hasAdvancedConfigs ? 'form' : 'account'}
                      value={activeTab}
                      onValueChange={setActiveTab}
                      className="w-full"
                    >
                      {hasAdvancedConfigs ? (
                        <TabsList className="grid w-full grid-cols-4">
                          <TabsTrigger value="form">Formulário</TabsTrigger>
                          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                          <TabsTrigger value="users">Usuários</TabsTrigger>
                          <TabsTrigger value="account">Conta</TabsTrigger>
                        </TabsList>
                      ) : (
                        <TabsList className="grid w-full grid-cols-1">
                          <TabsTrigger value="account">Conta</TabsTrigger>
                        </TabsList>
                      )}

                      {hasAdvancedConfigs && (
                        <TabsContent value="form" className="mt-4">
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-base">
                                Configuração do Formulário
                              </CardTitle>
                              <p className="text-xs text-muted-foreground mt-2">
                                Marque as seções e campos que deseja habilitar
                                no formulário de avaliação. Campos desmarcados
                                não aparecerão para o paciente.
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
                                              {REQUIRED_SECTIONS.has(
                                                sectionKey,
                                              ) && (
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
                        </TabsContent>
                      )}

                      {hasAdvancedConfigs && (
                        <TabsContent value="dashboard" className="mt-4">
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-base">
                                Widgets do Dashboard
                              </CardTitle>
                              <p className="text-xs text-muted-foreground mt-2">
                                Configure quais widgets serão exibidos no
                                dashboard. Widgets desabilitados não aparecerão
                                na visualização de análise.
                              </p>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                {DASHBOARD_WIDGETS.map((widget) => (
                                  <div
                                    key={widget.key}
                                    className="flex items-start justify-between p-3 border rounded-lg"
                                  >
                                    <div className="flex-1 space-y-1">
                                      <div className="font-medium text-sm">
                                        {widget.label}
                                      </div>
                                      <p className="text-xs text-muted-foreground">
                                        {widget.description}
                                      </p>
                                    </div>
                                    <Switch
                                      checked={
                                        dashboardConfig.widgets[
                                          widget.key as keyof typeof dashboardConfig.widgets
                                        ].enabled
                                      }
                                      onCheckedChange={() =>
                                        toggleWidget(widget.key)
                                      }
                                    />
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>
                      )}

                      {hasAdvancedConfigs && (
                        <TabsContent value="users" className="mt-4">
                          <UsersTab />
                        </TabsContent>
                      )}

                      <TabsContent value="account" className="mt-4">
                        <AccountTab ref={accountTabRef} />
                      </TabsContent>
                    </Tabs>
                  </>
                }
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
              <Button onClick={handleSave} disabled={saving}>
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
      <UserSelectionDialog
        open={showImpersonationDialog}
        onOpenChange={setShowImpersonationDialog}
      />
    </Sheet>
  );
}
