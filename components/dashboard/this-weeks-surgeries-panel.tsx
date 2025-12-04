'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, User, Activity } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Surgery {
  chatId: string;
  patientAge: number;
  riskLevel: 'baixo' | 'moderado' | 'alto' | 'unknown';
  surgeryDate: string;
  surgeryCompleted: boolean;
  surgeryCancelled: boolean;
  surgeryRescheduled: boolean;
  rcriScore?: number;
  has2Score?: number;
}

interface ThisWeeksSurgeriesPanelProps {
  surgeriesByDay: Record<string, Surgery[]>;
}

export function ThisWeeksSurgeriesPanel({
  surgeriesByDay,
}: ThisWeeksSurgeriesPanelProps) {
  const router = useRouter();

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

  const getStatusBadge = (surgery: Surgery) => {
    if (surgery.surgeryCancelled) {
      return (
        <Badge
          variant="outline"
          className="bg-red-50 text-red-700 border-red-200"
        >
          Cancelada
        </Badge>
      );
    }
    if (surgery.surgeryRescheduled) {
      return (
        <Badge
          variant="outline"
          className="bg-orange-50 text-orange-700 border-orange-200"
        >
          Reagendada
        </Badge>
      );
    }
    if (surgery.surgeryCompleted) {
      return (
        <Badge
          variant="outline"
          className="bg-green-50 text-green-700 border-green-200"
        >
          Realizada
        </Badge>
      );
    }
    return (
      <Badge
        variant="outline"
        className="bg-blue-50 text-blue-700 border-blue-200"
      >
        Agendada
      </Badge>
    );
  };

  const totalSurgeries = Object.values(surgeriesByDay).reduce(
    (sum, surgeries) => sum + surgeries.length,
    0,
  );

  if (totalSurgeries === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Cirurgias da Semana
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] flex-col items-center justify-center gap-2 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground" />
            <p className="text-sm font-medium">Nenhuma cirurgia agendada</p>
            <p className="text-xs text-muted-foreground">
              Não há cirurgias programadas até sábado
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Cirurgias da Semana
        </CardTitle>
        <Badge
          variant="outline"
          className="bg-blue-50 text-blue-700 border-blue-200"
        >
          {totalSurgeries} {totalSurgeries === 1 ? 'cirurgia' : 'cirurgias'}
        </Badge>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-6">
            {Object.entries(surgeriesByDay).map(([day, surgeries]) => (
              <div key={day} className="space-y-3">
                {/* Day Header */}
                <div className="flex items-center gap-2 border-b pb-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <h3 className="text-sm font-semibold capitalize">{day}</h3>
                  <Badge variant="outline" className="ml-auto">
                    {surgeries.length}
                  </Badge>
                </div>

                {/* Surgeries for this day */}
                <div className="space-y-2">
                  {surgeries.map((surgery) => (
                    <div
                      key={surgery.chatId}
                      className="rounded-lg border bg-card p-3 transition-all hover:shadow-md cursor-pointer"
                      onClick={() => router.push(`/chat/${surgery.chatId}`)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 space-y-2">
                          {/* Patient Info */}
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">
                              {surgery.patientAge} anos
                            </span>
                            <Badge
                              variant="outline"
                              className={getRiskColor(surgery.riskLevel)}
                            >
                              {surgery.riskLevel === 'baixo' && 'Baixo Risco'}
                              {surgery.riskLevel === 'moderado' &&
                                'Risco Moderado'}
                              {surgery.riskLevel === 'alto' && 'Alto Risco'}
                              {surgery.riskLevel === 'unknown' &&
                                'Desconhecido'}
                            </Badge>
                          </div>

                          {/* Scores */}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            {surgery.rcriScore !== undefined &&
                              surgery.rcriScore >= 0 && (
                                <div className="flex items-center gap-1">
                                  <Activity className="h-3 w-3" />
                                  <span>RCRI: {surgery.rcriScore}</span>
                                </div>
                              )}
                            {surgery.has2Score !== undefined &&
                              surgery.has2Score >= 0 && (
                                <div className="flex items-center gap-1">
                                  <Activity className="h-3 w-3" />
                                  <span>HAS2: {surgery.has2Score}</span>
                                </div>
                              )}
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div>{getStatusBadge(surgery)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
