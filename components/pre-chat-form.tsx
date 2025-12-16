'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PreChatFormData {
  idade: string;
  peso: string;
  altura: string;
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
  const [formData, setFormData] = useState<PreChatFormData>({
    idade: '',
    peso: '',
    altura: '',
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
    exames: {
      hemoglobina: { tipo: 'texto', valor: '' },
      creatinina: { tipo: 'texto', valor: '' },
      // ecocardiograma: { tipo: 'texto', valor: '' },
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(formData);
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
        <h2 className="text-2xl font-bold mb-6">Informações do Paciente</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados Básicos */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="idade">Idade (anos) *</Label>
              <Input
                id="idade"
                type="text"
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
                required
                value={formData.altura}
                onChange={(e) => {
                  let value = e.target.value;
                  // Replace period with comma
                  value = value.replace('.', ',');
                  // Allow max 1 digit before comma, then optional comma with max 2 decimal places
                  if (
                    value === '' ||
                    /^\d{1}$/.test(value) ||
                    /^\d{1},\d{0,2}$/.test(value)
                  ) {
                    setFormData({ ...formData, altura: value });
                  }
                }}
                placeholder="Ex: 1,75"
              />
            </div>
          </div>

          {/* Alergias */}
          <div className="space-y-3">
            <Label>Alergias</Label>
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
                value={formData.alergias}
                onChange={(e) =>
                  setFormData({ ...formData, alergias: e.target.value })
                }
                placeholder="Ex: penicilina, outros medicamentos..."
              />
            </div>
          </div>

          {/* Dispositivos Médicos */}
          <div className="space-y-3">
            <Label>Dispositivos Médicos</Label>
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

          {/* Itens de Uso */}
          <div className="space-y-3">
            <Label>Itens estéticos</Label>
            {[
              { key: 'megaHair', label: 'Mega-Hair' },
              { key: 'apliques', label: 'Apliques sintéticos no cabelo' },
              { key: 'unhaGel', label: 'Unha de gel' },
              { key: 'ciliosPosticos', label: 'Cílios postiços' },
              { key: 'piercings', label: 'Piercings' },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`item-${key}`}
                  checked={
                    formData.itensUso[key as keyof typeof formData.itensUso]
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      itensUso: {
                        ...formData.itensUso,
                        [key]: e.target.checked,
                      },
                    })
                  }
                  className="rounded border-gray-300"
                />
                <Label htmlFor={`item-${key}`} className="font-normal">
                  {label}
                </Label>
              </div>
            ))}
          </div>

          {/* Exames */}
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
                    className="flex-1"
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
                    className="flex-1"
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

          <div className="flex justify-end">
            <Button type="submit" className="min-w-[140px]" size="lg">
              Continuar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
