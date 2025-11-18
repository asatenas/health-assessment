'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PreChatFormData {
  idade: string;
  peso: string;
  altura: string;
  alergias: string;
  marcaPasso: boolean;
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
    alergias: '',
    marcaPasso: false,
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
            Continuar
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
              <Label htmlFor="idade">Idade (anos)</Label>
              <Input
                id="idade"
                type="number"
                required
                value={formData.idade}
                onChange={(e) =>
                  setFormData({ ...formData, idade: e.target.value })
                }
                placeholder="Ex: 45"
                onWheel={(e) => e.currentTarget.blur()}
              />
            </div>

            <div>
              <Label htmlFor="peso">Peso (kg)</Label>
              <Input
                id="peso"
                type="number"
                required
                value={formData.peso}
                onChange={(e) =>
                  setFormData({ ...formData, peso: e.target.value })
                }
                placeholder="Ex: 70.5"
                onWheel={(e) => e.currentTarget.blur()}
              />
            </div>

            <div>
              <Label htmlFor="altura">Altura (cm)</Label>
              <Input
                id="altura"
                type="number"
                required
                value={formData.altura}
                onChange={(e) =>
                  setFormData({ ...formData, altura: e.target.value })
                }
                placeholder="Ex: 175"
                onWheel={(e) => e.currentTarget.blur()}
              />
            </div>
          </div>

          {/* Alergias */}
          <div className="space-y-3">
            <Label htmlFor="alergias">Alergias</Label>
            <Input
              id="alergias"
              type="text"
              value={formData.alergias}
              onChange={(e) =>
                setFormData({ ...formData, alergias: e.target.value })
              }
              placeholder="Ex: látex, penicilina, outros medicamentos..."
            />
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
                Marca-passos ou dispositivo para arritmia
              </Label>
            </div>
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
            <div>
              <Label htmlFor="dispositivos-outros" className="text-sm">
                Outros
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
                placeholder="Ex: implante coclear, prótese..."
              />
            </div>
          </div>

          {/* Itens de Uso */}
          {/* <div className="space-y-3">
            <Label>Usa algum dos itens abaixo?</Label>
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
          </div> */}

          {/* Exames */}
          <div className="space-y-4">
            <Label>Exames (valor em um exame realizado recentemente)</Label>
            {[
              { key: 'hemoglobina', label: 'Hemoglobina (g/dL)' },
              { key: 'creatinina', label: 'Creatinina (mg/dL)' },
              // { key: 'ecocardiograma', label: 'Ecocardiograma' },
            ].map(({ key, label }) => (
              <div key={key} className="space-y-2">
                <Label className="text-sm font-normal">{label}</Label>
                <div className="flex gap-2">
                  {/* <select
                    value={
                      formData.exames[key as keyof typeof formData.exames].tipo
                    }
                    onChange={(e) =>
                      handleExameChange(
                        key as keyof typeof formData.exames,
                        'tipo',
                        e.target.value,
                      )
                    }
                    className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="texto">Valor</option>
                    <option value="arquivo">Arquivo</option>
                  </select> */}
                  {formData.exames[key as keyof typeof formData.exames].tipo ===
                  'texto' ? (
                    <Input
                      value={
                        formData.exames[key as keyof typeof formData.exames]
                          .valor
                      }
                      onChange={(e) =>
                        handleExameChange(
                          key as keyof typeof formData.exames,
                          'valor',
                          e.target.value,
                        )
                      }
                      placeholder={`Ex: valor de ${label.toLowerCase()}`}
                      className="flex-1"
                    />
                  ) : (
                    <Input
                      type="file"
                      onChange={(e) =>
                        handleExameFileChange(
                          key as keyof typeof formData.exames,
                          e.target.files?.[0],
                        )
                      }
                      className="flex-1"
                    />
                  )}
                </div>
              </div>
            ))}
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
