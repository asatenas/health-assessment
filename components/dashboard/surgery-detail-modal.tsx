'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

interface SurgeryDetailModalProps {
  assessmentId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusUpdate?: (
    status: 'completed' | 'rescheduled' | 'cancelled',
  ) => Promise<void>;
}

interface AssessmentDetails {
  id: string;
  createdAt: string;
  status: string;
  form?: {
    age: number;
    weight: number;
    height: number;
    surgeryName?: string;
    surgeryDate?: string;
    surgeryTime?: string;
    allergies?: string[];
    latexAllergy?: boolean;
    medicalDevices?: {
      paceMaker?: boolean;
      cdi?: boolean;
      medicationPump?: boolean;
      others?: string[];
    };
    healthProblems?: {
      cardiac?: boolean;
      respiratory?: boolean;
      renal?: boolean;
      liver?: boolean;
      vascular?: boolean;
      ortopedico?: boolean;
      digestivo?: boolean;
    };
    hemoglobin?: number;
    creatinine?: number;
  };
  surgery?: {
    name?: string;
    date?: string;
    completed: boolean;
    rescheduled: boolean;
    cancelled: boolean;
    statusReason?: string;
  };
  results?: string;
  medications?: string;
  score_rcri: number | null;
  score_aub_has2: number | null;
}

interface MedicationDetail {
  medicationName: string;
  suspensionDays: string;
}

interface ConversationMessage {
  role: 'user' | 'assistant';
  text: string;
}

export function SurgeryDetailModal({
  assessmentId,
  open,
  onOpenChange,
  onStatusUpdate,
}: SurgeryDetailModalProps) {
  const [assessmentDetails, setAssessmentDetails] =
    useState<AssessmentDetails | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [conversationMessages, setConversationMessages] = useState<
    ConversationMessage[]
  >([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [hasLoadedMessages, setHasLoadedMessages] = useState(false);

  // Fetch assessment details when modal opens
  useEffect(() => {
    if (open && assessmentId) {
      fetchAssessmentDetails();
    } else {
      // Reset state when modal closes
      setAssessmentDetails(null);
      setConversationMessages([]);
      setHasLoadedMessages(false);
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

  const fetchAssessmentDetails = async () => {
    if (!assessmentId) return;

    setIsLoadingDetails(true);
    try {
      const response = await fetch(`/api/clinic/chats/${assessmentId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch assessment details');
      }

      const data = await response.json();
      setAssessmentDetails(data);
    } catch (error) {
      console.error('Error fetching assessment details:', error);
      setAssessmentDetails(null);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const loadConversation = async () => {
    if (!assessmentId) return;

    setIsLoadingMessages(true);
    try {
      const response = await fetch(
        `/api/clinic/chats/${assessmentId}/messages`,
      );

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data = await response.json();
      setConversationMessages(data.messages || []);
      setHasLoadedMessages(true);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setConversationMessages([]);
    } finally {
      setIsLoadingMessages(false);
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
          <h2 className="text-xl font-semibold">Detalhes da Avaliação</h2>
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
          ) : assessmentDetails ? (
            <div className="space-y-6">
              {/* Assessment ID */}
              <div>
                <div className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  ID da Avaliação
                </div>
                <code className="block p-3 bg-gray-50 dark:bg-gray-800 rounded text-sm font-mono text-gray-900 dark:text-gray-100">
                  {assessmentDetails.id}
                </code>
              </div>

              {/* Patient Information */}
              {assessmentDetails.form && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
                    Informações do Paciente
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <div className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Idade
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded text-sm text-gray-900 dark:text-gray-100">
                          {assessmentDetails.form.age} anos
                        </div>
                      </div>
                      <div>
                        <div className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Peso
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded text-sm text-gray-900 dark:text-gray-100">
                          {assessmentDetails.form.weight} kg
                        </div>
                      </div>
                      <div>
                        <div className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Altura
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded text-sm text-gray-900 dark:text-gray-100">
                          {assessmentDetails.form.height} m
                        </div>
                      </div>
                    </div>

                    {/* Health Problems */}
                    {assessmentDetails.form.healthProblems && (
                      <div>
                        <div className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Problemas de Saúde
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded text-sm text-gray-900 dark:text-gray-100">
                          {(() => {
                            const problems = [];
                            const hp = assessmentDetails.form?.healthProblems;
                            if (hp?.cardiac) problems.push('Cardíacos');
                            if (hp?.respiratory) problems.push('Respiratórios');
                            if (hp?.renal) problems.push('Renais');
                            if (hp?.liver) problems.push('Hepáticos');
                            if (hp?.vascular) problems.push('Vasculares');
                            if (hp?.ortopedico) problems.push('Ortopédicos');
                            if (hp?.digestivo) problems.push('Digestivos');
                            return problems.length > 0
                              ? problems.join(', ')
                              : 'Nenhum';
                          })()}
                        </div>
                      </div>
                    )}

                    {/* Allergies */}
                    <div>
                      <div className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Alergias
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded text-sm text-gray-900 dark:text-gray-100">
                        {(() => {
                          const allergies = [];
                          if (assessmentDetails.form?.latexAllergy) {
                            allergies.push('Látex');
                          }
                          if (
                            assessmentDetails.form?.allergies &&
                            assessmentDetails.form.allergies.length > 0
                          ) {
                            allergies.push(...assessmentDetails.form.allergies);
                          }
                          return allergies.length > 0
                            ? allergies.join(', ')
                            : 'Nenhuma';
                        })()}
                      </div>
                    </div>

                    {/* Medical Devices */}
                    {assessmentDetails.form.medicalDevices && (
                      <div>
                        <div className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Dispositivos Médicos
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded text-sm text-gray-900 dark:text-gray-100">
                          {(() => {
                            const devices = [];
                            const md = assessmentDetails.form?.medicalDevices;
                            if (md?.paceMaker) {
                              devices.push('Marcapasso');
                            }
                            if (md?.cdi) {
                              devices.push('CDI');
                            }
                            if (md?.medicationPump) {
                              devices.push('Bomba de medicação');
                            }
                            if (md?.others && md.others.length > 0) {
                              devices.push(...md.others);
                            }
                            return devices.length > 0
                              ? devices.join(', ')
                              : 'Nenhum';
                          })()}
                        </div>
                      </div>
                    )}

                    {/* Lab Results */}
                    {(assessmentDetails.form.hemoglobin ||
                      assessmentDetails.form.creatinine) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {assessmentDetails.form.hemoglobin && (
                          <div>
                            <div className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Hemoglobina
                            </div>
                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded text-sm text-gray-900 dark:text-gray-100">
                              {assessmentDetails.form.hemoglobin} g/dL
                            </div>
                          </div>
                        )}
                        {assessmentDetails.form.creatinine && (
                          <div>
                            <div className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Creatinina
                            </div>
                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded text-sm text-gray-900 dark:text-gray-100">
                              {assessmentDetails.form.creatinine} mg/dL
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Medications */}
              {assessmentDetails.medications && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
                    Medicamentos em uso
                  </h3>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded text-sm text-gray-900 dark:text-gray-100 whitespace-pre-line">
                    {(() => {
                      try {
                        const meds = JSON.parse(assessmentDetails.medications);
                        if (Array.isArray(meds) && meds.length > 0) {
                          return meds
                            .map(
                              (med: MedicationDetail) =>
                                `${med.medicationName}: ${med.suspensionDays}`,
                            )
                            .join('\n');
                        }
                        return 'Nenhum medicamento';
                      } catch {
                        return 'Erro ao carregar medicamentos';
                      }
                    })()}
                  </div>
                </div>
              )}

              {/* Risk Scores */}
              {(assessmentDetails.score_rcri !== null &&
                assessmentDetails.score_rcri !== undefined) ||
              (assessmentDetails.score_aub_has2 !== null &&
                assessmentDetails.score_aub_has2 !== undefined) ? (
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
                    Pontuações de Risco
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        RCRI
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded text-sm text-gray-900 dark:text-gray-100">
                        {assessmentDetails.score_rcri !== null &&
                        assessmentDetails.score_rcri !== undefined
                          ? assessmentDetails.score_rcri
                          : '-'}
                      </div>
                    </div>
                    <div>
                      <div className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        AUB-HAS2
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded text-sm text-gray-900 dark:text-gray-100">
                        {assessmentDetails.score_aub_has2 !== null &&
                        assessmentDetails.score_aub_has2 !== undefined
                          ? assessmentDetails.score_aub_has2
                          : '-'}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Results */}
              {assessmentDetails.results && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
                    Resultados da Avaliação de Risco
                  </h3>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                    {assessmentDetails.results}
                  </div>
                </div>
              )}

              {/* Conversation Messages */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Conversa
                  </h3>
                  {!hasLoadedMessages && !isLoadingMessages && (
                    <Button
                      onClick={loadConversation}
                      variant="outline"
                      size="sm"
                    >
                      Carregar Conversa
                    </Button>
                  )}
                </div>
                {!hasLoadedMessages && !isLoadingMessages ? (
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded text-sm text-gray-500 dark:text-gray-400 text-center">
                    Clique em Carregar Conversa para ver as mensagens
                  </div>
                ) : isLoadingMessages ? (
                  <div className="space-y-3">
                    <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  </div>
                ) : conversationMessages.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {conversationMessages.map((msg, index) => (
                      <div
                        // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                        key={index}
                        className={`p-3 rounded-lg ${
                          msg.role === 'user'
                            ? 'bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900'
                            : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={`text-xs font-semibold ${
                              msg.role === 'user'
                                ? 'text-blue-700 dark:text-blue-300'
                                : 'text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            {msg.role === 'user' ? 'Paciente' : 'Assistente'}
                          </span>
                        </div>
                        <div className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                          {msg.text}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded text-sm text-gray-500 dark:text-gray-400 text-center">
                    Nenhuma mensagem disponível
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              Erro ao carregar detalhes da avaliação
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-4 sm:p-6 border-t dark:border-gray-800">
          <Button onClick={() => onOpenChange(false)} variant="outline">
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
}
