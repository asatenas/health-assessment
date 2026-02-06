'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

interface SurgeryDetailsModalProps {
  assessmentId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusUpdate?: (
    status: 'completed' | 'rescheduled' | 'cancelled',
  ) => Promise<void>;
  onViewAssessment?: () => void;
}

interface SurgeryDetails {
  assessmentId: string;
  name: string | null;
  date: string | null;
  completed: boolean;
  rescheduled: boolean;
  cancelled: boolean;
  statusReason: string | null;
  medicalInterventionRequired: boolean;
  interventionNotes: string | null;
  adjustmentsRequired: boolean;
  adjustmentNotes: string | null;
}

export function SurgeryDetailsModal({
  assessmentId,
  open,
  onOpenChange,
  onStatusUpdate,
  onViewAssessment,
}: SurgeryDetailsModalProps) {
  const [surgeryDetails, setSurgeryDetails] = useState<SurgeryDetails | null>(
    null,
  );
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Fetch surgery details when modal opens
  useEffect(() => {
    if (open && assessmentId) {
      fetchSurgeryDetails();
    } else {
      // Reset state when modal closes
      setSurgeryDetails(null);
    }
  }, [open, assessmentId]);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [open, onOpenChange]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const fetchSurgeryDetails = async () => {
    if (!assessmentId) return;

    setIsLoadingDetails(true);
    try {
      const response = await fetch(`/api/clinic/surgeries/${assessmentId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch surgery details');
      }

      const data = await response.json();
      setSurgeryDetails(data);
    } catch (error) {
      console.error('Error fetching surgery details:', error);
      setSurgeryDetails(null);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        onClick={() => onOpenChange(false)}
        aria-label="Close modal"
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b dark:border-gray-800">
          <h2 className="text-xl font-semibold">Detalhes da Cirurgia</h2>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="size-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-4 sm:p-6">
          {isLoadingDetails ? (
            <div className="space-y-4">
              <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          ) : surgeryDetails ? (
            <div className="space-y-6">
              {/* Surgery Basic Information */}
              <div className="space-y-4">
                {/* Assessment ID */}
                <div>
                  <div className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    ID da Avaliação
                  </div>
                  <code className="block p-3 bg-gray-50 dark:bg-gray-800 rounded text-sm font-mono text-gray-900 dark:text-gray-100">
                    {surgeryDetails.assessmentId}
                  </code>
                </div>

                {/* Surgery Name */}
                <div>
                  <div className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nome da Cirurgia
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded text-sm text-gray-900 dark:text-gray-100">
                    {surgeryDetails.name || 'Não especificado'}
                  </div>
                </div>

                {/* Surgery Date */}
                <div>
                  <div className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Data da Cirurgia
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded text-sm text-gray-900 dark:text-gray-100">
                    {surgeryDetails.date
                      ? new Date(surgeryDetails.date).toLocaleDateString(
                          'pt-BR',
                          {
                            dateStyle: 'long',
                          },
                        )
                      : 'Não especificada'}
                  </div>
                </div>

                {/* Surgery Time */}
                <div>
                  <div className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Hora da Cirurgia
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded text-sm text-gray-900 dark:text-gray-100">
                    {surgeryDetails.date
                      ? new Date(surgeryDetails.date).toLocaleTimeString(
                          'pt-BR',
                          {
                            timeStyle: 'short',
                          },
                        )
                      : 'Não especificada'}
                  </div>
                </div>
              </div>

              {/* Surgery Status */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
                  Status da Cirurgia
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <div className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Concluída
                      </div>
                      <div
                        className={`p-3 rounded text-sm font-medium ${
                          surgeryDetails.completed
                            ? 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300'
                            : 'bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                        }`}
                      >
                        {surgeryDetails.completed ? 'Sim' : 'Não'}
                      </div>
                    </div>

                    <div>
                      <div className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Remarcada
                      </div>
                      <div
                        className={`p-3 rounded text-sm font-medium ${
                          surgeryDetails.rescheduled
                            ? 'bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-300'
                            : 'bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                        }`}
                      >
                        {surgeryDetails.rescheduled ? 'Sim' : 'Não'}
                      </div>
                    </div>

                    <div>
                      <div className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Cancelada
                      </div>
                      <div
                        className={`p-3 rounded text-sm font-medium ${
                          surgeryDetails.cancelled
                            ? 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300'
                            : 'bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                        }`}
                      >
                        {surgeryDetails.cancelled ? 'Sim' : 'Não'}
                      </div>
                    </div>
                  </div>

                  {surgeryDetails.statusReason && (
                    <div>
                      <div className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Motivo do Status
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded text-sm text-gray-900 dark:text-gray-100">
                        {surgeryDetails.statusReason}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Medical Interventions */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
                  Intervenções Médicas
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Intervenção Médica Necessária
                    </div>
                    <div
                      className={`p-3 rounded text-sm font-medium ${
                        surgeryDetails.medicalInterventionRequired
                          ? 'bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300'
                          : 'bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                      }`}
                    >
                      {surgeryDetails.medicalInterventionRequired
                        ? 'Sim'
                        : 'Não'}
                    </div>
                  </div>

                  {surgeryDetails.interventionNotes && (
                    <div>
                      <div className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Notas sobre Intervenção
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                        {surgeryDetails.interventionNotes}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Adjustments */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
                  Ajustes Necessários
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Ajustes Necessários
                    </div>
                    <div
                      className={`p-3 rounded text-sm font-medium ${
                        surgeryDetails.adjustmentsRequired
                          ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300'
                          : 'bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                      }`}
                    >
                      {surgeryDetails.adjustmentsRequired ? 'Sim' : 'Não'}
                    </div>
                  </div>

                  {surgeryDetails.adjustmentNotes && (
                    <div>
                      <div className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Notas sobre Ajustes
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                        {surgeryDetails.adjustmentNotes}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              Erro ao carregar detalhes da cirurgia
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center gap-2 p-4 sm:p-6 border-t dark:border-gray-800">
          {onViewAssessment && (
            <Button onClick={onViewAssessment} variant="outline">
              Ver Detalhes da Avaliação
            </Button>
          )}
          <div className="flex gap-2 ml-auto">
            <Button onClick={() => onOpenChange(false)} variant="outline">
              Fechar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
