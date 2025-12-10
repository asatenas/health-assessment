'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Surgery {
  chatId: string;
  patientAge: number;
  riskLevel: 'Baixo' | 'Moderado' | 'Alto' | 'Desconhecido';
  surgeryDate: string;
  rcriScore?: number;
  has2Score?: number;
}

interface TodaysSurgeriesPanelProps {
  surgeries: Surgery[];
  onUpdateStatus: (
    chatId: string,
    status: 'completed' | 'rescheduled' | 'cancelled',
  ) => Promise<void>;
}

export function TodaysSurgeriesPanel({
  surgeries,
  onUpdateStatus,
}: TodaysSurgeriesPanelProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  const currentSurgery = surgeries[currentIndex];

  const handleStatusUpdate = async (
    status: 'completed' | 'rescheduled' | 'cancelled',
  ) => {
    if (!currentSurgery) return;

    setIsUpdating(true);
    try {
      await onUpdateStatus(currentSurgery.chatId, status);

      // Move to next surgery
      if (currentIndex < surgeries.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    } catch (error) {
      console.error('Failed to update surgery status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Baixo':
        return 'bg-green-100 text-green-800';
      case 'Moderado':
        return 'bg-orange-100 text-orange-800';
      case 'Alto':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (surgeries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cirurgias de Hoje</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
            Nenhuma cirurgia agendada para hoje
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentSurgery) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cirurgias de Hoje</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[200px] flex-col items-center justify-center gap-4">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
            <p className="text-sm font-medium">
              Todas as cirurgias de hoje foram processadas!
            </p>
            <Button variant="outline" onClick={() => setCurrentIndex(0)}>
              Revisar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Cirurgias de Hoje</CardTitle>
        <Badge variant="outline">
          {currentIndex + 1} de {surgeries.length}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Surgery Card */}
          <div className="rounded-lg border-2 border-dashed border-muted p-4">
            <div className="mb-3 flex items-center justify-between">
              <Badge className={getRiskColor(currentSurgery.riskLevel)}>
                {currentSurgery.riskLevel} Risco
              </Badge>
              <span className="text-sm text-muted-foreground">
                Idade: {currentSurgery.patientAge} anos
              </span>
            </div>

            <div className="mb-4 space-y-2">
              {currentSurgery.rcriScore !== undefined && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">RCRI:</span>
                  <span className="font-medium">
                    {currentSurgery.rcriScore} pontos
                  </span>
                </div>
              )}
              {currentSurgery.has2Score !== undefined && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">HAS2:</span>
                  <span className="font-medium">
                    {currentSurgery.has2Score} pontos
                  </span>
                </div>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => router.push(`/chat/${currentSurgery.chatId}`)}
            >
              Ver detalhes completos
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              className="flex flex-col items-center gap-1 h-auto py-3 border-green-200 hover:bg-green-50 hover:border-green-300"
              onClick={() => handleStatusUpdate('completed')}
              disabled={isUpdating}
            >
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span className="text-xs">Realizada</span>
            </Button>

            <Button
              variant="outline"
              className="flex flex-col items-center gap-1 h-auto py-3 border-orange-200 hover:bg-orange-50 hover:border-orange-300"
              onClick={() => handleStatusUpdate('rescheduled')}
              disabled={isUpdating}
            >
              <Calendar className="h-5 w-5 text-orange-600" />
              <span className="text-xs">Reagendada</span>
            </Button>

            <Button
              variant="outline"
              className="flex flex-col items-center gap-1 h-auto py-3 border-red-200 hover:bg-red-50 hover:border-red-300"
              onClick={() => handleStatusUpdate('cancelled')}
              disabled={isUpdating}
            >
              <XCircle className="h-5 w-5 text-red-600" />
              <span className="text-xs">Cancelada</span>
            </Button>
          </div>

          {/* Navigation */}
          {surgeries.length > 1 && (
            <div className="flex items-center justify-between pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                disabled={currentIndex === 0}
              >
                Anterior
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setCurrentIndex(
                    Math.min(surgeries.length - 1, currentIndex + 1),
                  )
                }
                disabled={currentIndex === surgeries.length - 1}
              >
                Próxima
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
