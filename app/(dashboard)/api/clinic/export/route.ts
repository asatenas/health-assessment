import { validateClinicAccess } from '@/lib/api/clinic-guard';
import type { ChatStatus } from '@/lib/db/chat-status';
import { calculateRiskLevel, getChatsByClinicUserId } from '@/lib/db/queries';
import { ChatSDKError } from '@/lib/shared/errors';

export async function GET(request: Request) {
  try {
    const user = await validateClinicAccess(undefined, {
      permissions: ['org.manage'],
    });

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const statusParam = searchParams.get('status');

    // Get all chats for the clinic with filters
    const { chats } = await getChatsByClinicUserId({
      clinicId: user.clinicId,
      status: statusParam as ChatStatus,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      page: 1,
      limit: 10000, // Export limit
    });

    if (format === 'csv') {
      // Generate CSV
      const headers = [
        'Data de Criação',
        'ID do Chat',
        'Status',
        'Idade do Paciente',
        'Nível de Risco',
        'Pontuação RCRI',
        'Pontuação HAS2',
        'Data da Cirurgia',
        'Cirurgia Realizada',
        'Cirurgia Reagendada',
        'Cirurgia Cancelada',
        'Motivo (Cancelamento/Reagendamento)',
        'Intervenção Médica Necessária',
        'Ajustes Necessários',
        'Prazo de Conclusão (2 dias)',
        'Formulário Concluído em',
      ];

      const rows = chats.map((chat: any) => {
        const form = chat.form as any;
        const createdAt = new Date(chat.createdAt);
        const deadlineDate = new Date(
          createdAt.getTime() + 2 * 24 * 60 * 60 * 1000,
        );

        return [
          createdAt.toLocaleDateString('pt-BR'),
          chat.id,
          getStatusLabel(chat.status),
          form?.age || 'N/A',
          calculateRiskLevel(chat.score_rcri, chat.score_aub_has2),
          chat.score_rcri >= 0 ? chat.score_rcri : 'N/A',
          chat.score_aub_has2 >= 0 ? chat.score_aub_has2 : 'N/A',
          chat.surgeryDate
            ? new Date(chat.surgeryDate).toLocaleDateString('pt-BR')
            : 'N/A',
          chat.surgeryCompleted ? 'Sim' : 'Não',
          chat.surgeryRescheduled ? 'Sim' : 'Não',
          chat.surgeryCancelled ? 'Sim' : 'Não',
          getReasonLabel(chat.surgeryStatusReason),
          chat.medicalInterventionRequired ? 'Sim' : 'Não',
          chat.adjustmentsRequired ? 'Sim' : 'Não',
          deadlineDate.toLocaleDateString('pt-BR'),
          chat.formCompletedAt
            ? new Date(chat.formCompletedAt).toLocaleDateString('pt-BR')
            : 'N/A',
        ];
      });

      // Create CSV content
      const csvContent = [
        headers.join(','),
        ...rows.map((row) =>
          row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','),
        ),
      ].join('\n');

      return new Response(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="pre-anestesicos-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    if (format === 'xlsx') {
      // For Excel format, we'll return CSV for now and note that xlsx library needs to be installed
      // TODO: Implement actual Excel export using xlsx library
      return Response.json(
        { error: 'Excel export not yet implemented. Please use CSV format.' },
        { status: 501 },
      );
    }

    return Response.json({ error: 'Invalid format' }, { status: 400 });
  } catch (error) {
    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }
    console.error('Error exporting data:', error);
    return Response.json({ error: 'Failed to export data' }, { status: 500 });
  }
}

// Get Portuguese status label
function getStatusLabel(status: string): string {
  switch (status) {
    case 'active':
      return 'Ativo';
    case 'initialized':
      return 'Iniciado';
    case 'in_progress':
      return 'Em progresso';
    case 'finished':
      return 'Finalizado';
    case 'expired':
      return 'Expirado';
    default:
      return status;
  }
}

// Get Portuguese reason label
function getReasonLabel(reason?: string | null): string {
  if (!reason) return 'N/A';

  const labels: Record<string, string> = {
    paciente_nao_liberado: 'Paciente não liberado clinicamente',
    exames_pendentes: 'Exames laboratoriais pendentes',
    pedido_paciente: 'Solicitação do paciente',
    risco_alto: 'Risco cirúrgico muito alto',
    intervencao_necessaria: 'Intervenção médica necessária',
    indisponibilidade_sala: 'Indisponibilidade de sala cirúrgica',
    indisponibilidade_equipe: 'Indisponibilidade da equipe médica',
    conflito_agenda: 'Conflito de agenda',
    outros: 'Outros motivos',
  };

  return labels[reason] || reason;
}
