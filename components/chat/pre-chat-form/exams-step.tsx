import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Info } from 'lucide-react';
import Image from 'next/image';
import type { StepProps } from './types';

export function ExamsStep({ formData, setFormData, formConfig }: StepProps) {
  const examsConfig = formConfig.sections.exams.fields;
  const [hemoglobinaModalOpen, setHemoglobinaModalOpen] = useState(false);
  const [creatininaModalOpen, setCreatininaModalOpen] = useState(false);

  const handleExameChange = (
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

  return (
    <div className="space-y-4">
      {examsConfig.hemoglobina?.enabled && (
        <>
          <div>
            <Label>Exame de hemograma</Label>
            <p className="text-xs text-gray-600 mt-1">
              Procure pelo valor de hemoglobina no seu exame de sangue. Caso não
              tenha disponível, deixe o campo em branco.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-normal">Hemoglobina (g/dL)</Label>
              <Dialog
                open={hemoglobinaModalOpen}
                onOpenChange={setHemoglobinaModalOpen}
              >
                <DialogTrigger asChild>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <Info className="size-4" />
                  </button>
                </DialogTrigger>
                <DialogContent className="p-0 max-w-2xl max-h-[90vh] overflow-auto">
                  <DialogTitle className="sr-only">
                    Exemplo de exame de hemoglobina
                  </DialogTitle>
                  <Image
                    src="/images/exams/hemoglobina.jpeg"
                    alt="Exemplo de exame de hemoglobina"
                    width={800}
                    height={600}
                    className="rounded-md w-full h-auto"
                  />
                </DialogContent>
              </Dialog>
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
                    handleExameFileChange('hemoglobina', e.target.files?.[0])
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
              Procure pelo valor de creatinina no seu exame de sangue. Caso não
              tenha disponível, deixe o campo em branco.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-normal">Creatinina (mg/dL)</Label>
              <Dialog
                open={creatininaModalOpen}
                onOpenChange={setCreatininaModalOpen}
              >
                <DialogTrigger asChild>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <Info className="size-4" />
                  </button>
                </DialogTrigger>
                <DialogContent className="p-0 max-w-2xl max-h-[90vh] overflow-auto">
                  <DialogTitle className="sr-only">
                    Exemplo de exame de creatinina
                  </DialogTitle>
                  <Image
                    src="/images/exams/creatinina.jpeg"
                    alt="Exemplo de exame de creatinina"
                    width={800}
                    height={600}
                    className="rounded-md w-full h-auto"
                  />
                </DialogContent>
              </Dialog>
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
                    handleExameFileChange('creatinina', e.target.files?.[0])
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
