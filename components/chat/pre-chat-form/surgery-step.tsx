import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { StepProps } from './types';

export function SurgeryStep({ formData, setFormData, formConfig }: StepProps) {
  const surgeryConfig = formConfig.sections.surgery.fields;

  return (
    <div className="space-y-4">
      {surgeryConfig.nomeCirurgia?.enabled && (
        <div>
          <Label htmlFor="nome-cirurgia">Nome da Cirurgia</Label>
          <Input
            id="nome-cirurgia"
            type="text"
            className="text-sm"
            value={formData.nomeCirurgia}
            onChange={(e) =>
              setFormData({ ...formData, nomeCirurgia: e.target.value })
            }
          />
        </div>
      )}

      {surgeryConfig.dataCirurgia?.enabled && (
        <div>
          <Label htmlFor="data-cirurgia">Data</Label>
          <Input
            id="data-cirurgia"
            type="date"
            className="text-sm"
            value={formData.dataCirurgia}
            onChange={(e) =>
              setFormData({ ...formData, dataCirurgia: e.target.value })
            }
          />
        </div>
      )}

      {surgeryConfig.horaCirurgia?.enabled && (
        <div>
          <Label htmlFor="hora-cirurgia">Hora</Label>
          <Input
            id="hora-cirurgia"
            type="time"
            className="text-sm"
            value={formData.horaCirurgia}
            onChange={(e) =>
              setFormData({ ...formData, horaCirurgia: e.target.value })
            }
          />
        </div>
      )}
    </div>
  );
}
