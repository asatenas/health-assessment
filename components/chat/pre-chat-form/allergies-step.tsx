import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { StepProps } from './types';

export function AllergiesStep({
  formData,
  setFormData,
  formConfig,
}: StepProps) {
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
            <Label htmlFor="alergia-latex" className="font-bold text-red-600">
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
