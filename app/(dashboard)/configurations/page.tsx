'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import type { FormConfiguration } from '@/lib/types/clinic-config';
import { ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';

const SECTION_LABELS: Record<string, string> = {
  basicInfo: 'Informações Básicas',
  healthProblems: 'Problemas de Saúde',
  allergies: 'Alergias',
  medicalDevices: 'Dispositivos Médicos',
  aestheticItems: 'Itens Estéticos',
  habitsAndVices: 'Hábitos e Vícios',
  exams: 'Exames',
};

const FIELD_LABELS: Record<string, string> = {
  // Basic Info
  idade: 'Idade',
  peso: 'Peso',
  altura: 'Altura',
  // Health Problems
  cardiologicos: 'Problemas Cardiológicos',
  respiratorios: 'Problemas Respiratórios',
  renais: 'Problemas Renais',
  figado: 'Problemas no Fígado',
  vasculares: 'Problemas Vasculares',
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
  drogasRecreativasOutros: 'Outras Drogas',
  // Exams
  hemoglobina: 'Hemoglobina',
  creatinina: 'Creatinina',
};

export default function ConfiguracoesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clinicName, setClinicName] = useState('');
  const [formConfig, setFormConfig] = useState<FormConfiguration | null>(null);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
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

      alert('Configurações salvas com sucesso!');
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
    setFormConfig({
      ...formConfig,
      sections: {
        ...formConfig.sections,
        [sectionKey]: {
          ...section,
          fields: {
            ...section.fields,
            [fieldKey]: {
              ...section.fields[fieldKey],
              enabled: !section.fields[fieldKey].enabled,
            },
          },
        },
      },
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <p>Carregando...</p>
      </div>
    );
  }

  if (!formConfig) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <p className="text-red-500">Erro ao carregar configurações</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Configurações da Clínica</h1>
        <Button variant="outline" onClick={() => router.back()}>
          Voltar
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-600">
          {error}
        </div>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Informações Gerais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="clinicName">Nome da Clínica</Label>
              <Input
                id="clinicName"
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                placeholder="Ex: Clínica Santa Maria"
              />
              <p className="text-sm text-gray-500 mt-1">
                Este nome será exibido no painel da clínica
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configuração do Formulário</CardTitle>
          <p className="text-sm text-gray-600">
            Ative ou desative seções e campos do formulário. As alterações
            afetarão apenas novas avaliações.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(formConfig.sections).map(
              ([sectionKey, section]) => (
                <Collapsible
                  key={sectionKey}
                  open={openSections[sectionKey]}
                  onOpenChange={(open) =>
                    setOpenSections({ ...openSections, [sectionKey]: open })
                  }
                >
                  <div className="border rounded-lg">
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={section.enabled}
                          onCheckedChange={() => toggleSection(sectionKey)}
                        />
                        <span className="font-medium">
                          {SECTION_LABELS[sectionKey]}
                        </span>
                      </div>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <ChevronDown
                            className={`size-4 transition-transform ${
                              openSections[sectionKey] ? 'rotate-180' : ''
                            }`}
                          />
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                    <CollapsibleContent>
                      <div className="border-t p-4 space-y-2 bg-gray-50">
                        {Object.entries(section.fields).map(
                          ([fieldKey, field]) => (
                            <div
                              key={fieldKey}
                              className="flex items-center justify-between py-2"
                            >
                              <Label
                                htmlFor={`${sectionKey}-${fieldKey}`}
                                className={
                                  !section.enabled ? 'text-gray-400' : ''
                                }
                              >
                                {FIELD_LABELS[fieldKey] || fieldKey}
                              </Label>
                              <Checkbox
                                id={`${sectionKey}-${fieldKey}`}
                                checked={field.enabled}
                                disabled={!section.enabled}
                                onCheckedChange={() =>
                                  toggleField(sectionKey, fieldKey)
                                }
                              />
                            </div>
                          ),
                        )}
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              ),
            )}
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 flex justify-end gap-3">
        <Button variant="outline" onClick={fetchConfig}>
          Cancelar
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>
    </div>
  );
}
