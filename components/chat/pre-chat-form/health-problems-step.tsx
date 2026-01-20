import { Label } from '@/components/ui/label';
import type { StepProps } from './types';

export function HealthProblemsStep({
  formData,
  setFormData,
  formConfig,
}: StepProps) {
  const healthProblemsConfig = formConfig.sections.healthProblems.fields;

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-600">
        Selecione todas as opções que se aplicam a você
      </p>
      {healthProblemsConfig.cardiologicos?.enabled && (
        <>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="problemas-cardiologicos"
              checked={formData.problemasSaude.cardiologicos}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  problemasSaude: {
                    ...formData.problemasSaude,
                    cardiologicos: e.target.checked,
                  },
                })
              }
              className="rounded border-gray-300"
            />
            <Label htmlFor="problemas-cardiologicos" className="font-normal">
              Problemas no coração
            </Label>
          </div>
          <p className="text-xs text-gray-600 ml-6">
            Doenças relacionadas ao coração e circulação sanguínea. Ex:
            insuficiência cardíaca, arritmia, infarto prévio
          </p>
        </>
      )}
      {healthProblemsConfig.respiratorios?.enabled && (
        <>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="problemas-respiratorios"
              checked={formData.problemasSaude.respiratorios}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  problemasSaude: {
                    ...formData.problemasSaude,
                    respiratorios: e.target.checked,
                  },
                })
              }
              className="rounded border-gray-300"
            />
            <Label htmlFor="problemas-respiratorios" className="font-normal">
              Problemas respiratórios
            </Label>
          </div>
          <p className="text-xs text-gray-600 ml-6">
            Dificuldades para respirar ou doenças nos pulmões. Ex: asma,
            bronquite, enfisema
          </p>
        </>
      )}
      {healthProblemsConfig.renais?.enabled && (
        <>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="problemas-renais"
              checked={formData.problemasSaude.renais}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  problemasSaude: {
                    ...formData.problemasSaude,
                    renais: e.target.checked,
                  },
                })
              }
              className="rounded border-gray-300"
            />
            <Label htmlFor="problemas-renais" className="font-normal">
              Problemas renais
            </Label>
          </div>
          <p className="text-xs text-gray-600 ml-6">
            Doenças nos rins que afetam a filtragem do sangue. Ex: insuficiência
            renal, pedras nos rins, diálise
          </p>
        </>
      )}
      {healthProblemsConfig.figado?.enabled && (
        <>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="problemas-figado"
              checked={formData.problemasSaude.figado}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  problemasSaude: {
                    ...formData.problemasSaude,
                    figado: e.target.checked,
                  },
                })
              }
              className="rounded border-gray-300"
            />
            <Label htmlFor="problemas-figado" className="font-normal">
              Problemas no fígado
            </Label>
          </div>
          <p className="text-xs text-gray-600 ml-6">
            Doenças que afetam o funcionamento do fígado. Ex: hepatite, cirrose,
            esteatose hepática (gordura no fígado)
          </p>
        </>
      )}
      {healthProblemsConfig.vasculares?.enabled && (
        <>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="problemas-vasculares"
              checked={formData.problemasSaude.vasculares}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  problemasSaude: {
                    ...formData.problemasSaude,
                    vasculares: e.target.checked,
                  },
                })
              }
              className="rounded border-gray-300"
            />
            <Label htmlFor="problemas-vasculares" className="font-normal">
              Problemas vasculares
            </Label>
          </div>
          <p className="text-xs text-gray-600 ml-6">
            Problemas nas veias e artérias que transportam o sangue. Ex:
            varizes, trombose, pressão alta
          </p>
        </>
      )}
      {healthProblemsConfig.ortopedicos?.enabled && (
        <>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="problemas-ortopedicos"
              checked={formData.problemasSaude.ortopedicos}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  problemasSaude: {
                    ...formData.problemasSaude,
                    ortopedicos: e.target.checked,
                  },
                })
              }
              className="rounded border-gray-300"
            />
            <Label htmlFor="problemas-ortopedicos" className="font-normal">
              Problemas ortopédicos
            </Label>
          </div>
          <p className="text-xs text-gray-600 ml-6">
            Problemas nos ossos, articulações, músculos e ligamentos. Ex:
            artrose, osteoporose, hérnias de disco, problemas na coluna
          </p>
        </>
      )}
      {healthProblemsConfig.digestivos?.enabled && (
        <>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="problemas-digestivos"
              checked={formData.problemasSaude.digestivos}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  problemasSaude: {
                    ...formData.problemasSaude,
                    digestivos: e.target.checked,
                  },
                })
              }
              className="rounded border-gray-300"
            />
            <Label htmlFor="problemas-digestivos" className="font-normal">
              Problemas digestivos
            </Label>
          </div>
          <p className="text-xs text-gray-600 ml-6">
            Problemas no sistema digestivo que afetam a digestão. Ex: refluxo,
            gastrite, úlceras, doença de Crohn, síndrome do intestino irritável
          </p>
        </>
      )}
    </div>
  );
}
