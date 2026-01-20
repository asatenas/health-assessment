import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { StepProps } from './types';

export function MedicalDevicesStep({
  formData,
  setFormData,
  formConfig,
}: StepProps) {
  const medicalDevicesConfig = formConfig.sections.medicalDevices.fields;

  return (
    <div className="space-y-3">
      {medicalDevicesConfig.marcaPasso?.enabled && (
        <>
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
        </>
      )}
      {medicalDevicesConfig.cdi?.enabled && (
        <>
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
            Deixe selecionado caso você tenha um CDI (cardioversor desfibrilador
            implantável)
          </p>
        </>
      )}
      {medicalDevicesConfig.bombaMedicamentos?.enabled && (
        <>
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
        </>
      )}
      {medicalDevicesConfig.dispositivosOutros?.enabled && (
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
      )}
    </div>
  );
}
