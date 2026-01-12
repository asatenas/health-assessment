'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SurgeryDetailModal } from './surgery-detail-modal';
import { cn } from '@/lib/shared/utils';

interface Surgery {
  chatId: string;
  patientAge: number;
  riskLevel: 'baixo' | 'moderado' | 'alto' | 'unknown';
  surgeryDate: string;
  surgeryName?: string;
  surgeryTime?: string;
  surgeryCompleted: boolean;
  surgeryCancelled: boolean;
  surgeryRescheduled: boolean;
  rcriScore?: number;
  has2Score?: number;
}

interface MonthlySurgeriesPanelProps {
  surgeriesByDay: Record<string, Surgery[]>;
  onUpdateStatus: (
    chatId: string,
    status: 'completed' | 'rescheduled' | 'cancelled',
  ) => Promise<void>;
}

interface CalendarDay {
  date: number;
  fullDate: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  surgeryCount: number;
  surgeries: Surgery[];
}

export function MonthlySurgeriesPanel({
  surgeriesByDay,
  onUpdateStatus,
}: MonthlySurgeriesPanelProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dayModalOpen, setDayModalOpen] = useState(false);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<
    string | null
  >(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Convert surgeriesByDay to an array of surgeries
  const surgeries = useMemo(() => {
    return Object.values(surgeriesByDay).flat();
  }, [surgeriesByDay]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // First day of the month
    const firstDay = new Date(year, month, 1);
    const firstDayOfWeek = firstDay.getDay(); // 0 = Sunday

    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    const lastDate = lastDay.getDate();

    // Days to show from previous month
    const daysFromPrevMonth = firstDayOfWeek;

    // Days to show from next month
    const totalCells = 42; // 6 weeks * 7 days
    const daysFromNextMonth = totalCells - daysFromPrevMonth - lastDate;

    const days: CalendarDay[] = [];

    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
      const date = prevMonthLastDay - i;
      const fullDate = new Date(year, month - 1, date);

      const daySurgeries = surgeries.filter((surgery) => {
        const surgeryDate = new Date(surgery.surgeryDate);
        return surgeryDate.toDateString() === fullDate.toDateString();
      });

      days.push({
        date,
        fullDate,
        isCurrentMonth: false,
        isToday: false,
        surgeryCount: daySurgeries.length,
        surgeries: daySurgeries,
      });
    }

    // Current month days
    const today = new Date();
    for (let date = 1; date <= lastDate; date++) {
      const fullDate = new Date(year, month, date);
      const isToday = fullDate.toDateString() === today.toDateString();

      const daySurgeries = surgeries.filter((surgery) => {
        const surgeryDate = new Date(surgery.surgeryDate);
        return surgeryDate.toDateString() === fullDate.toDateString();
      });

      days.push({
        date,
        fullDate,
        isCurrentMonth: true,
        isToday,
        surgeryCount: daySurgeries.length,
        surgeries: daySurgeries,
      });
    }

    // Next month days
    for (let date = 1; date <= daysFromNextMonth; date++) {
      const fullDate = new Date(year, month + 1, date);

      const daySurgeries = surgeries.filter((surgery) => {
        const surgeryDate = new Date(surgery.surgeryDate);
        return surgeryDate.toDateString() === fullDate.toDateString();
      });

      days.push({
        date,
        fullDate,
        isCurrentMonth: false,
        isToday: false,
        surgeryCount: daySurgeries.length,
        surgeries: daySurgeries,
      });
    }

    return days;
  }, [currentMonth, surgeries]);

  const selectedDaySurgeries = useMemo(() => {
    if (!selectedDate) return [];
    return surgeries.filter((surgery) => {
      const surgeryDate = new Date(surgery.surgeryDate);
      return surgeryDate.toDateString() === selectedDate.toDateString();
    });
  }, [surgeries, selectedDate]);

  const handlePrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1),
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1),
    );
  };

  const handleDayClick = (day: CalendarDay) => {
    if (day.surgeryCount === 0) return;
    setSelectedDate(day.fullDate);
    setDayModalOpen(true);
  };

  const handleSurgeryClick = (chatId: string) => {
    setSelectedAssessmentId(chatId);
    setDetailModalOpen(true);
  };

  const handleStatusUpdate = async (
    status: 'completed' | 'rescheduled' | 'cancelled',
  ) => {
    if (!selectedAssessmentId) return;
    await onUpdateStatus(selectedAssessmentId, status);
    setDetailModalOpen(false);
    setSelectedAssessmentId(null);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'baixo':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'moderado':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'alto':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskLabel = (risk: string) => {
    switch (risk) {
      case 'baixo':
        return 'Baixo Risco';
      case 'moderado':
        return 'Risco Moderado';
      case 'alto':
        return 'Alto Risco';
      default:
        return 'Desconhecido';
    }
  };

  const monthName = (() => {
    const month = currentMonth.toLocaleDateString('pt-BR', { month: 'long' });
    const year = currentMonth.getFullYear();
    return `${month.charAt(0).toUpperCase()}${month.slice(1)} ${year}`;
  })();

  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{monthName}</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevMonth}
                className="size-8 p-0"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextMonth}
                className="size-8 p-0"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Calendar Grid */}
          <div className="space-y-2">
            {/* Day names header */}
            <div className="grid grid-cols-7 gap-1">
              {dayNames.map((dayName) => (
                <div
                  key={dayName}
                  className="text-center font-semibold text-sm p-2 text-muted-foreground"
                >
                  {dayName}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                  key={index}
                  className={cn(
                    'border p-2 min-h-[80px] transition-all duration-200 rounded-md',
                    !day.isCurrentMonth &&
                      'text-gray-400 bg-gray-50 dark:bg-gray-800',
                    day.isToday && 'border-blue-500 border-2',
                    day.surgeryCount > 0 &&
                      'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800',
                  )}
                  onClick={() => handleDayClick(day)}
                >
                  <div className="text-sm font-medium mb-1">{day.date}</div>
                  {day.surgeryCount > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {day.surgeryCount}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Day Surgeries Modal */}
      {dayModalOpen && selectedDate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            onClick={() => {
              setDayModalOpen(false);
              setSelectedDate(null);
            }}
            aria-label="Close modal"
          />
          <div
            role="dialog"
            aria-modal="true"
            className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b dark:border-gray-800">
              <h2 className="text-xl font-semibold">
                {(() => {
                  const dateStr = selectedDate.toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    day: '2-digit',
                    month: 'long',
                  });
                  return dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
                })()}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setDayModalOpen(false);
                  setSelectedDate(null);
                }}
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
              {selectedDaySurgeries.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedDaySurgeries.map((surgery) => (
                    <Card
                      key={surgery.chatId}
                      className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
                      onClick={() => handleSurgeryClick(surgery.chatId)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start gap-2">
                          <Badge className={getRiskColor(surgery.riskLevel)}>
                            {getRiskLabel(surgery.riskLevel)}
                          </Badge>
                          {surgery.surgeryTime && (
                            <span className="text-sm text-muted-foreground">
                              {surgery.surgeryTime}
                            </span>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Idade:</span>{' '}
                          <span className="font-medium">
                            {surgery.patientAge} anos
                          </span>
                        </div>

                        {surgery.surgeryName && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">
                              Cirurgia:
                            </span>{' '}
                            <span className="font-medium">
                              {surgery.surgeryName}
                            </span>
                          </div>
                        )}

                        <div className="flex gap-2 flex-wrap pt-2">
                          {surgery.rcriScore !== undefined &&
                            surgery.rcriScore !== null &&
                            surgery.rcriScore >= 0 && (
                              <Badge variant="secondary" className="text-xs">
                                RCRI: {surgery.rcriScore}
                              </Badge>
                            )}
                          {surgery.has2Score !== undefined &&
                            surgery.has2Score !== null &&
                            surgery.has2Score >= 0 && (
                              <Badge variant="secondary" className="text-xs">
                                HAS2: {surgery.has2Score}
                              </Badge>
                            )}
                        </div>

                        {/* Status Badge */}
                        {(surgery.surgeryCompleted ||
                          surgery.surgeryCancelled ||
                          surgery.surgeryRescheduled) && (
                          <div className="pt-2">
                            {surgery.surgeryCancelled && (
                              <Badge
                                variant="outline"
                                className="bg-red-50 text-red-700 border-red-200"
                              >
                                Cancelada
                              </Badge>
                            )}
                            {surgery.surgeryRescheduled &&
                              !surgery.surgeryCancelled && (
                                <Badge
                                  variant="outline"
                                  className="bg-orange-50 text-orange-700 border-orange-200"
                                >
                                  Reagendada
                                </Badge>
                              )}
                            {surgery.surgeryCompleted &&
                              !surgery.surgeryCancelled && (
                                <Badge
                                  variant="outline"
                                  className="bg-green-50 text-green-700 border-green-200"
                                >
                                  Realizada
                                </Badge>
                              )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  Nenhuma cirurgia agendada para este dia
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end p-4 sm:p-6 border-t dark:border-gray-800">
              <Button
                onClick={() => {
                  setDayModalOpen(false);
                  setSelectedDate(null);
                }}
                variant="outline"
              >
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Surgery Detail Modal */}
      <SurgeryDetailModal
        assessmentId={selectedAssessmentId}
        open={detailModalOpen}
        onOpenChange={(open) => {
          setDetailModalOpen(open);
          if (!open) {
            setSelectedAssessmentId(null);
          }
        }}
        onStatusUpdate={handleStatusUpdate}
      />
    </>
  );
}
