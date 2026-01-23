'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SurgeryDetailModal } from './surgery-detail-modal';

interface Surgery {
  chatId: string;
  patientAge: number;
  riskLevel: 'Baixo' | 'Moderado' | 'Alto' | 'Desconhecido';
  surgeryDate: string;
  surgeryName?: string;
  surgeryTime?: string;
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
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<
    string | null
  >(null);
  const [modalOpen, setModalOpen] = useState(false);

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

  const handleCardClick = (chatId: string) => {
    setSelectedAssessmentId(chatId);
    setModalOpen(true);
  };

  const handleStatusUpdate = async (
    status: 'completed' | 'rescheduled' | 'cancelled',
  ) => {
    if (!selectedAssessmentId) return;
    await onUpdateStatus(selectedAssessmentId, status);
    // Close modal after status update
    setModalOpen(false);
    setSelectedAssessmentId(null);
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return '';
    return timeString;
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

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Cirurgias de Hoje</CardTitle>
            <Badge variant="outline">{surgeries.length} cirurgias</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[550px] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {surgeries.map((surgery) => (
                <Card
                  key={surgery.chatId}
                  className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
                  onClick={() => handleCardClick(surgery.chatId)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start gap-2">
                      <Badge className={getRiskColor(surgery.riskLevel)}>
                        {surgery.riskLevel}
                      </Badge>
                      {surgery.surgeryTime && (
                        <span className="text-sm text-muted-foreground">
                          {formatTime(surgery.surgeryTime)}
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {/* <div className="text-sm">
                    <span className="text-muted-foreground">Idade:</span>{' '}
                    <span className="font-medium">
                      {surgery.patientAge} anos
                    </span>
                  </div> */}

                    {surgery.surgeryName && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Cirurgia:</span>{' '}
                        <span className="font-medium">
                          {surgery.surgeryName}
                        </span>
                      </div>
                    )}

                    <div className="flex gap-2 flex-wrap pt-2">
                      {surgery.rcriScore !== undefined &&
                        surgery.rcriScore !== null && (
                          <Badge variant="secondary" className="text-xs">
                            RCRI: {surgery.rcriScore}
                          </Badge>
                        )}
                      {surgery.has2Score !== undefined &&
                        surgery.has2Score !== null && (
                          <Badge variant="secondary" className="text-xs">
                            HAS2: {surgery.has2Score}
                          </Badge>
                        )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <SurgeryDetailModal
        assessmentId={selectedAssessmentId}
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) {
            setSelectedAssessmentId(null);
          }
        }}
        onStatusUpdate={handleStatusUpdate}
      />
    </>
  );
}
