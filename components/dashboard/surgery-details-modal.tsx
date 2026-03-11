'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Check } from 'lucide-react';
import { cn } from '@/lib/shared/utils';

// Helper for extracting HH:mm from a date string (if valid)
function extractTime(dateString: string | null) {
  if (!dateString) return '';
  const dateObj = new Date(dateString);
  if (Number.isNaN(dateObj.getTime())) return '';
  return dateObj.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Helper for extracting YYYY-MM-DD from a date string
function extractDate(dateString: string | null) {
  if (!dateString) return '';
  const dateObj = new Date(dateString);
  if (Number.isNaN(dateObj.getTime())) return '';
  return dateObj.toISOString().split('T')[0];
}

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
  notes: string | null;
}

// Editable states
interface EditableState {
  name: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  completed: boolean;
  rescheduled: boolean;
  cancelled: boolean;
  statusReason: string;
  medicalInterventionRequired: boolean;
  interventionNotes: string;
  adjustmentsRequired: boolean;
  adjustmentNotes: string;
  notes: string;
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
  const [notFound, setNotFound] = useState(false);

  const [formState, setFormState] = useState<EditableState>({
    name: '',
    date: '',
    time: '',
    completed: false,
    rescheduled: false,
    cancelled: false,
    statusReason: '',
    medicalInterventionRequired: false,
    interventionNotes: '',
    adjustmentsRequired: false,
    adjustmentNotes: '',
    notes: '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);

  // Fetch surgery details when modal opens
  useEffect(() => {
    if (open && assessmentId) {
      fetchSurgeryDetails();
    } else {
      // Reset state when modal closes
      setSurgeryDetails(null);
      setNotFound(false);
      setHasSaved(false);
    }
  }, [open, assessmentId]);

  // Sync state when details load
  useEffect(() => {
    if (surgeryDetails) {
      setFormState({
        name: surgeryDetails.name ?? '',
        date: extractDate(surgeryDetails.date),
        time: extractTime(surgeryDetails.date),
        completed: surgeryDetails.completed,
        rescheduled: surgeryDetails.rescheduled,
        cancelled: surgeryDetails.cancelled,
        statusReason: surgeryDetails.statusReason ?? '',
        medicalInterventionRequired: surgeryDetails.medicalInterventionRequired,
        interventionNotes: surgeryDetails.interventionNotes ?? '',
        adjustmentsRequired: surgeryDetails.adjustmentsRequired,
        adjustmentNotes: surgeryDetails.adjustmentNotes ?? '',
        notes: surgeryDetails.notes ?? '',
      });
    }
  }, [surgeryDetails]);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      // Don't close if they are typing in an input
      const activeEl = document.activeElement;
      const isInputFocused =
        activeEl?.tagName === 'INPUT' || activeEl?.tagName === 'TEXTAREA';

      if (e.key === 'Escape' && open && !isInputFocused) {
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
    setNotFound(false);
    try {
      const response = await fetch(`/api/clinic/surgeries/${assessmentId}`);

      if (response.status === 404) {
        setNotFound(true);
        setSurgeryDetails(null);
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch surgery details');
      }

      const data = await response.json();
      setSurgeryDetails(data);
      setNotFound(false);
    } catch (error) {
      console.error('Error fetching surgery details:', error);
      setSurgeryDetails(null);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const calculateChangedFields = () => {
    if (!surgeryDetails) return {} as Record<keyof EditableState, boolean>;

    const originalDate = extractDate(surgeryDetails.date);
    const originalTime = extractTime(surgeryDetails.date);

    return {
      name: formState.name !== (surgeryDetails.name ?? ''),
      date: formState.date !== originalDate,
      time: formState.time !== originalTime,
      completed: formState.completed !== surgeryDetails.completed,
      rescheduled: formState.rescheduled !== surgeryDetails.rescheduled,
      cancelled: formState.cancelled !== surgeryDetails.cancelled,
      statusReason: formState.statusReason !== (surgeryDetails.statusReason ?? ''),
      medicalInterventionRequired:
        formState.medicalInterventionRequired !==
        surgeryDetails.medicalInterventionRequired,
      interventionNotes:
        formState.interventionNotes !== (surgeryDetails.interventionNotes ?? ''),
      adjustmentsRequired:
        formState.adjustmentsRequired !== surgeryDetails.adjustmentsRequired,
      adjustmentNotes:
        formState.adjustmentNotes !== (surgeryDetails.adjustmentNotes ?? ''),
      notes: formState.notes !== (surgeryDetails.notes ?? ''),
    };
  };

  const changedFields = calculateChangedFields();
  const hasChanges = Object.values(changedFields).some((changed) => changed);

  const handleSaveAllFields = async () => {
    if (!assessmentId || !hasChanges) return;

    setIsSaving(true);
    setHasSaved(false);

    try {
      let combinedDate: string | undefined = undefined;

      // Only combine if date is provided
      if (formState.date) {
        const timePart = formState.time || '00:00';
        // Keep it local time
        combinedDate = `${formState.date}T${timePart}:00`;
      }

      const response = await fetch(
        `/api/clinic/chats/${assessmentId}/surgery-details`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formState.name,
            surgeryDate: combinedDate,
            surgeryCompleted: formState.completed,
            surgeryRescheduled: formState.rescheduled,
            surgeryCancelled: formState.cancelled,
            surgeryStatusReason: formState.statusReason,
            medicalInterventionRequired: formState.medicalInterventionRequired,
            interventionNotes: formState.interventionNotes,
            adjustmentsRequired: formState.adjustmentsRequired,
            adjustmentNotes: formState.adjustmentNotes,
            notes: formState.notes,
          }),
        },
      );

      if (!response.ok) {
        throw new Error('Failed to save surgery details');
      }

      setHasSaved(true);

      // Update local state directly instead of refetching the entire page
      // This prevents the footer from hiding during the 'isLoadingDetails' phase
      setSurgeryDetails((prev) => 
        prev 
          ? {
              ...prev,
              name: formState.name,
              date: combinedDate ?? prev.date,
              completed: formState.completed,
              rescheduled: formState.rescheduled,
              cancelled: formState.cancelled,
              statusReason: formState.statusReason,
              medicalInterventionRequired: formState.medicalInterventionRequired,
              interventionNotes: formState.interventionNotes,
              adjustmentsRequired: formState.adjustmentsRequired,
              adjustmentNotes: formState.adjustmentNotes,
              notes: formState.notes,
            }
          : prev
      );

      // Trigger standard status update upstream if provided
      if (
        onStatusUpdate &&
        (changedFields.completed ||
          changedFields.cancelled ||
          changedFields.rescheduled)
      ) {
        if (formState.completed) {
          onStatusUpdate('completed');
        } else if (formState.cancelled) {
          onStatusUpdate('cancelled');
        } else if (formState.rescheduled) {
          onStatusUpdate('rescheduled');
        }
      }

      setTimeout(() => setHasSaved(false), 3000);
    } catch (error) {
      console.error('Error saving surgery details:', error);
    } finally {
      setIsSaving(false);
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
        className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between p-4 sm:p-6 border-b dark:border-gray-800">
          <h2 className="text-xl font-semibold">Detalhes da Cirurgia</h2>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 ml-2"
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
        </div>

        {/* Content */}
        <div className="overflow-y-auto overscroll-none p-4 sm:p-6 flex-1">
          {isLoadingDetails && !surgeryDetails ? (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
            </div>
          ) : surgeryDetails ? (
            <div className="space-y-8">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 col-span-1 md:col-span-2">
                  <Label>ID da Avaliação</Label>
                  <code className="block p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm font-mono text-gray-500">
                    {surgeryDetails.assessmentId}
                  </code>
                </div>

                <div className="space-y-2 col-span-1 md:col-span-2">
                  <Label
                    htmlFor="surgery-name"
                    className={cn(
                      changedFields.name && 'text-blue-600 dark:text-blue-400',
                    )}
                  >
                    Nome da Cirurgia {changedFields.name && '*'}
                  </Label>
                  <Input
                    id="surgery-name"
                    value={formState.name}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="Nome da cirurgia..."
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="surgery-date"
                    className={cn(
                      changedFields.date && 'text-blue-600 dark:text-blue-400',
                    )}
                  >
                    Data da Cirurgia {changedFields.date && '*'}
                  </Label>
                  <Input
                    id="surgery-date"
                    type="date"
                    value={formState.date}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        date: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="surgery-time"
                    className={cn(
                      changedFields.time && 'text-blue-600 dark:text-blue-400',
                    )}
                  >
                    Hora da Cirurgia {changedFields.time && '*'}
                  </Label>
                  <Input
                    id="surgery-time"
                    type="time"
                    value={formState.time}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        time: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              {/* Status Section */}
              <div className="p-4 rounded-lg border dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20 space-y-6">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  Status da Cirurgia
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="flex items-center space-x-3">
                    <Switch
                      id="status-completed"
                      checked={formState.completed}
                      onCheckedChange={(checked) =>
                        setFormState((prev) => ({
                          ...prev,
                          completed: checked,
                          // Autotoggle off the others
                          ...(checked && {
                            cancelled: false,
                            rescheduled: false,
                          }),
                        }))
                      }
                    />
                    <Label
                      htmlFor="status-completed"
                      className={cn(
                        'cursor-pointer',
                        changedFields.completed &&
                          'text-blue-600 dark:text-blue-400',
                      )}
                    >
                      Concluída {changedFields.completed && '*'}
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Switch
                      id="status-rescheduled"
                      checked={formState.rescheduled}
                      onCheckedChange={(checked) =>
                        setFormState((prev) => ({
                          ...prev,
                          rescheduled: checked,
                          ...(checked && {
                            completed: false,
                            cancelled: false,
                          }),
                        }))
                      }
                    />
                    <Label
                      htmlFor="status-rescheduled"
                      className={cn(
                        'cursor-pointer',
                        changedFields.rescheduled &&
                          'text-blue-600 dark:text-blue-400',
                      )}
                    >
                      Remarcada {changedFields.rescheduled && '*'}
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Switch
                      id="status-cancelled"
                      checked={formState.cancelled}
                      onCheckedChange={(checked) =>
                        setFormState((prev) => ({
                          ...prev,
                          cancelled: checked,
                          ...(checked && {
                            completed: false,
                            rescheduled: false,
                          }),
                        }))
                      }
                    />
                    <Label
                      htmlFor="status-cancelled"
                      className={cn(
                        'cursor-pointer',
                        changedFields.cancelled &&
                          'text-blue-600 dark:text-blue-400',
                      )}
                    >
                      Cancelada {changedFields.cancelled && '*'}
                    </Label>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <Label
                    htmlFor="status-reason"
                    className={cn(
                      changedFields.statusReason &&
                        'text-blue-600 dark:text-blue-400',
                    )}
                  >
                    Motivo do Status {changedFields.statusReason && '*'}
                  </Label>
                  <Input
                    id="status-reason"
                    value={formState.statusReason}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        statusReason: e.target.value,
                      }))
                    }
                    placeholder="Descreva o motivo (opcional)"
                  />
                </div>
              </div>

              {/* Interventions Section */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Intervenções Médicas
                </h3>
                <div className="flex items-center space-x-3 mb-4">
                  <Switch
                    id="medical-intervention"
                    checked={formState.medicalInterventionRequired}
                    onCheckedChange={(checked) =>
                      setFormState((prev) => ({
                        ...prev,
                        medicalInterventionRequired: checked,
                      }))
                    }
                  />
                  <Label
                    htmlFor="medical-intervention"
                    className={cn(
                      'cursor-pointer',
                      changedFields.medicalInterventionRequired &&
                        'text-blue-600 dark:text-blue-400',
                    )}
                  >
                    Intervenção Médica Necessária{' '}
                    {changedFields.medicalInterventionRequired && '*'}
                  </Label>
                </div>

                {formState.medicalInterventionRequired && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <Label
                      htmlFor="intervention-notes"
                      className={cn(
                        changedFields.interventionNotes &&
                          'text-blue-600 dark:text-blue-400',
                      )}
                    >
                      Notas sobre Intervenção{' '}
                      {changedFields.interventionNotes && '*'}
                    </Label>
                    <Textarea
                      id="intervention-notes"
                      value={formState.interventionNotes}
                      onChange={(e) =>
                        setFormState((prev) => ({
                          ...prev,
                          interventionNotes: e.target.value,
                        }))
                      }
                      placeholder="Detalhes da intervenção..."
                      rows={3}
                    />
                  </div>
                )}
              </div>

              {/* Adjustments Section */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Ajustes Necessários
                </h3>
                <div className="flex items-center space-x-3 mb-4">
                  <Switch
                    id="adjustments-required"
                    checked={formState.adjustmentsRequired}
                    onCheckedChange={(checked) =>
                      setFormState((prev) => ({
                        ...prev,
                        adjustmentsRequired: checked,
                      }))
                    }
                  />
                  <Label
                    htmlFor="adjustments-required"
                    className={cn(
                      'cursor-pointer',
                      changedFields.adjustmentsRequired &&
                        'text-blue-600 dark:text-blue-400',
                    )}
                  >
                    Ajustes Necessários {changedFields.adjustmentsRequired && '*'}
                  </Label>
                </div>

                {formState.adjustmentsRequired && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <Label
                      htmlFor="adjustment-notes"
                      className={cn(
                        changedFields.adjustmentNotes &&
                          'text-blue-600 dark:text-blue-400',
                      )}
                    >
                      Notas sobre Ajustes {changedFields.adjustmentNotes && '*'}
                    </Label>
                    <Textarea
                      id="adjustment-notes"
                      value={formState.adjustmentNotes}
                      onChange={(e) =>
                        setFormState((prev) => ({
                          ...prev,
                          adjustmentNotes: e.target.value,
                        }))
                      }
                      placeholder="Detalhes dos ajustes..."
                      rows={3}
                    />
                  </div>
                )}
              </div>

              {/* Freeform Notes Section */}
              <div className="space-y-2 pt-4 border-t dark:border-gray-800">
                <Label
                  htmlFor="overall-notes"
                  className={cn(
                    'text-lg font-semibold',
                    changedFields.notes && 'text-blue-600 dark:text-blue-400',
                  )}
                >
                  Anotações Gerais {changedFields.notes && '*'}
                </Label>
                <Textarea
                  id="overall-notes"
                  value={formState.notes}
                  onChange={(e) =>
                    setFormState((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  placeholder="Escreva aqui qualquer anotação livre sobre esta cirurgia (preparo, observações importantes, etc)..."
                  rows={5}
                />
              </div>
            </div>
          ) : notFound ? (
            <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
              <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-4">
                <svg
                  className="size-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold">
                Detalhes da Cirurgia Não Disponíveis
              </h3>
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              Erro ao carregar detalhes da cirurgia
            </div>
          )}
        </div>

        {/* Footer */}
        {!isLoadingDetails && surgeryDetails && (
          <div className="flex shrink-0 justify-between items-center gap-2 p-4 sm:p-6 border-t dark:border-gray-800 bg-gray-50 dark:bg-gray-900 mt-auto">
            {onViewAssessment && (
              <Button onClick={onViewAssessment} variant="outline">
                Ver Ficha da Avaliação
              </Button>
            )}
            <div className="flex items-center gap-3 ml-auto">
              {hasSaved && (
                <span className="text-sm text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                  <Check className="size-4" />
                  Salvo!
                </span>
              )}
              <Button onClick={handleSaveAllFields} disabled={isSaving || !hasChanges}>
                {isSaving ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
