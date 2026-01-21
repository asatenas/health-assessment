'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { TooltipProvider } from '@/components/ui/tooltip';
import type { PreChatFormProps, PreChatFormData } from './pre-chat-form/types';
import { buildInitialFormData } from './pre-chat-form/utils';
import { BasicInfoStep } from './pre-chat-form/basic-info-step';
import { SurgeryStep } from './pre-chat-form/surgery-step';
import { HealthProblemsStep } from './pre-chat-form/health-problems-step';
import { AllergiesStep } from './pre-chat-form/allergies-step';
import { MedicalDevicesStep } from './pre-chat-form/medical-devices-step';
import { AestheticItemsStep } from './pre-chat-form/aesthetic-items-step';
import { HabitsAndVicesStep } from './pre-chat-form/habits-and-vices-step';
import { ExamsStep } from './pre-chat-form/exams-step';

// Re-export formatPacienteInfo for use in other files
export { formatPacienteInfo } from './pre-chat-form/utils';

export function PreChatForm({
  onComplete,
  onShowForm,
  isReadonly,
  formConfig,
}: PreChatFormProps) {
  const [showForm, setShowForm] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Calculate visible steps based on enabled sections
  const visibleSteps = useMemo(() => {
    const steps = [];
    const stepConfig = [
      { key: 'basicInfo', title: 'Informações Básicas', step: 1 },
      { key: 'surgery', title: 'Cirurgia', step: 2 },
      { key: 'healthProblems', title: 'Problemas de Saúde', step: 3 },
      { key: 'allergies', title: 'Alergias', step: 4 },
      { key: 'medicalDevices', title: 'Dispositivos Médicos', step: 5 },
      { key: 'aestheticItems', title: 'Itens Estéticos', step: 6 },
      { key: 'habitsAndVices', title: 'Hábitos e Vícios', step: 7 },
      { key: 'exams', title: 'Exames', step: 8 },
    ];

    for (const config of stepConfig) {
      if (
        formConfig.sections[config.key as keyof typeof formConfig.sections]
          ?.enabled
      ) {
        steps.push(config);
      }
    }

    return steps;
  }, [formConfig]);

  // Build initial form data based on enabled fields
  const [formData, setFormData] = useState<PreChatFormData>(() =>
    buildInitialFormData(formConfig),
  );

  const totalSteps = visibleSteps.length;

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(formData);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const validateStep = () => {
    if (currentStep === 1) {
      return (
        formData.idade !== '' && formData.peso !== '' && formData.altura !== ''
      );
    }
    return true;
  };

  const renderStep = () => {
    // Get the actual step based on visible steps
    const actualStep = visibleSteps[currentStep - 1];
    if (!actualStep) return null;

    const stepProps = {
      formData,
      setFormData,
      formConfig,
    };

    switch (actualStep.step) {
      case 1:
        return <BasicInfoStep {...stepProps} />;
      case 2:
        return <SurgeryStep {...stepProps} />;
      case 3:
        return <HealthProblemsStep {...stepProps} />;
      case 4:
        return <AllergiesStep {...stepProps} />;
      case 5:
        return <MedicalDevicesStep {...stepProps} />;
      case 6:
        return <AestheticItemsStep {...stepProps} />;
      case 7:
        return <HabitsAndVicesStep {...stepProps} />;
      case 8:
        return <ExamsStep {...stepProps} />;
      default:
        return null;
    }
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
    <TooltipProvider>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">
              {visibleSteps[currentStep - 1]?.title || ''}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Passo {currentStep} de {totalSteps}
            </p>
          </div>
          <form onSubmit={handleNext} className="space-y-6">
            {renderStep()}

            <div className="flex justify-between pt-4">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="min-w-[140px]"
                  size="lg"
                >
                  Voltar
                </Button>
              )}
              <Button
                type="submit"
                className="min-w-[140px] ml-auto"
                size="lg"
                disabled={!validateStep()}
              >
                Continuar
              </Button>
            </div>
          </form>
        </div>
      </div>
    </TooltipProvider>
  );
}
