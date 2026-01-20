import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { StepProps } from './types';

export function BasicInfoStep({
  formData,
  setFormData,
  formConfig,
}: StepProps) {
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
