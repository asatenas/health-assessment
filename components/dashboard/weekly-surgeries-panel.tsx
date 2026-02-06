'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SurgeryDetailsModal } from './surgery-details-modal';
import { AssessmentDetailsModal } from './assessment-details-modal';
import { cn } from '@/lib/shared/utils';

interface Surgery {
  assessmentId: string;

  // Display fields for surgery card
  patientAge: number;
  riskLevel: 'Baixo' | 'Moderado' | 'Alto' | 'Desconhecido';
  surgeryDate: string;
  surgeryName?: string;
  surgeryTime?: string;
  rcriScore?: number | null;
  has2Score?: number | null;

  // Surgery details for modal
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

interface WeeklySurgeriesPanelProps {
  surgeries: Surgery[];
  onUpdateStatus: (
    assessmentId: string,
    status: 'completed' | 'rescheduled' | 'cancelled',
  ) => Promise<void>;
}

interface CalendarDay {
  date: Date;
  dayName: string;
  dayNumber: number;
  isPast: boolean;
  isToday: boolean;
  surgeries: Surgery[];
}

export function WeeklySurgeriesPanel({
  surgeries,
  onUpdateStatus,
}: WeeklySurgeriesPanelProps) {
  const [selectedSurgery, setSelectedSurgery] = useState<string | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<
    string | null
  >(null);
  const [assessmentModalOpen, setAssessmentModalOpen] = useState(false);

  const weekDays = useMemo(() => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 6 = Saturday
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - currentDay);
    startOfWeek.setHours(0, 0, 0, 0);

    const days: CalendarDay[] = [];
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);

      const isPast = date.getTime() < new Date().setHours(0, 0, 0, 0);
      const isToday = date.toDateString() === new Date().toDateString();

      // Filter surgeries for this day
      const daySurgeries = surgeries
        .filter((surgery) => {
          const surgeryDate = new Date(surgery.surgeryDate);
          return surgeryDate.toDateString() === date.toDateString();
        })
        .sort((a, b) => {
          // Sort by time if available, otherwise by patient age
          if (a.surgeryTime && b.surgeryTime) {
            return a.surgeryTime.localeCompare(b.surgeryTime);
          }
          return 0;
        });

      days.push({
        date,
        dayName: dayNames[i],
        dayNumber: date.getDate(),
        isPast,
        isToday,
        surgeries: daySurgeries,
      });
    }

    return days;
  }, [surgeries]);

  const handleSurgeryClick = (assessmentId: string) => {
    setSelectedSurgery(assessmentId);
    setDetailModalOpen(true);
  };

  const handleStatusUpdate = async (
    status: 'completed' | 'rescheduled' | 'cancelled',
  ) => {
    if (!selectedSurgery) return;
    await onUpdateStatus(selectedSurgery, status);
    setDetailModalOpen(false);
    setSelectedSurgery(null);
  };

  const handleViewAssessment = () => {
    // Since surgeryId is the same as assessmentId (it's the primary key)
    setSelectedAssessmentId(selectedSurgery);
    setAssessmentModalOpen(true);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Baixo':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Moderado':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Alto':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <>
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Cirurgias da Semana</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto md:overflow-visible">
            <div className="flex md:grid md:grid-cols-7 gap-2">
              {weekDays.map((day, index) => (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                  key={index}
                  className={cn(
                    'border rounded-lg flex flex-col h-[550px] w-[165px] sm:w-auto sm:min-w-0 sm:flex-shrink',
                    day.isToday && 'border-blue-500 border-2',
                    day.isPast && 'bg-gray-50 dark:bg-gray-900',
                  )}
                >
                  {/* Day Header */}
                  <div
                    className={cn(
                      'p-2 border-b flex items-center justify-center gap-1.5',
                      day.isToday && 'bg-blue-50 dark:bg-blue-950',
                    )}
                  >
                    <div className="text-xs font-semibold text-muted-foreground">
                      {day.dayName}
                    </div>
                    <div className="text-lg font-bold">{day.dayNumber}</div>
                    <Badge variant="secondary" className="text-xs">
                      {day.surgeries.length}
                    </Badge>
                  </div>

                  {/* Surgery Cards */}
                  <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                    {day.surgeries.map((surgery) => (
                      <button
                        type="button"
                        key={surgery.assessmentId}
                        onClick={() => handleSurgeryClick(surgery.assessmentId)}
                        className={cn(
                          'w-full p-2 rounded border text-left transition-all',
                          'hover:shadow-md hover:border-blue-300',
                          'focus:outline-none focus:ring-2 focus:ring-blue-500',
                          day.isPast && 'opacity-60',
                        )}
                      >
                        <div className="space-y-1">
                          <Badge
                            className={cn(
                              'text-xs',
                              getRiskColor(surgery.riskLevel),
                            )}
                          >
                            {surgery.riskLevel}
                          </Badge>
                          {surgery.surgeryTime && (
                            <div className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                              {surgery.surgeryTime}
                            </div>
                          )}
                          {/* <div className="text-xs">
                          <span className="text-muted-foreground">Idade:</span>{' '}
                          <span className="font-medium">
                            {surgery.patientAge}
                          </span>
                        </div> */}
                          {surgery.surgeryName && (
                            <div className="text-xs truncate text-muted-foreground">
                              {surgery.surgeryName}
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Surgery Detail Modal */}
      <SurgeryDetailsModal
        assessmentId={selectedSurgery}
        open={detailModalOpen}
        onOpenChange={(open) => {
          setDetailModalOpen(open);
          if (!open) {
            setSelectedSurgery(null);
          }
        }}
        onStatusUpdate={handleStatusUpdate}
        onViewAssessment={handleViewAssessment}
      />

      {/* Assessment Detail Modal */}
      <AssessmentDetailsModal
        assessmentId={selectedAssessmentId}
        open={assessmentModalOpen}
        onOpenChange={(open) => {
          setAssessmentModalOpen(open);
          if (!open) {
            setSelectedAssessmentId(null);
          }
        }}
      />
    </>
  );
}
