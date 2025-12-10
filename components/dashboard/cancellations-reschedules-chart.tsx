'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface CancellationReschedulingData {
  reason: string;
  cancellations: number;
  reschedulings: number;
}

interface CancellationsAndReschedulesChartProps {
  data: CancellationReschedulingData[];
}

const REASON_LABELS: Record<string, string> = {
  paciente_nao_liberado: 'Paciente não liberado',
  exames_pendentes: 'Exames pendentes',
  pedido_paciente: 'Pedido do paciente',
  risco_alto: 'Risco muito alto',
  intervencao_necessaria: 'Intervenção necessária',
  indisponibilidade_sala: 'Sala indisponível',
  indisponibilidade_equipe: 'Equipe indisponível',
  conflito_agenda: 'Conflito de agenda',
  outros: 'Outros',
};

export function CancellationsAndReschedulesChart({
  data,
}: CancellationsAndReschedulesChartProps) {
  // Transform data to use Portuguese labels
  const formattedData = data.map((item) => ({
    ...item,
    reason: REASON_LABELS[item.reason] || item.reason,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-3 shadow-md">
          <p className="mb-2 text-sm font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cancelamentos e Reagendamentos</CardTitle>
      </CardHeader>
      <CardContent>
        {formattedData.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
            Nenhum dado disponível
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={formattedData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                type="number"
                className="text-xs"
                tick={{ fill: 'currentColor' }}
              />
              <YAxis
                dataKey="reason"
                type="category"
                width={150}
                className="text-xs"
                tick={{ fill: 'currentColor' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '14px' }}
                formatter={(value) => {
                  const labels: Record<string, string> = {
                    cancellations: 'Cancelamentos',
                    reschedulings: 'Reagendamentos',
                  };
                  return labels[value] || value;
                }}
              />
              <Bar
                dataKey="cancellations"
                fill="#ef4444"
                radius={[0, 4, 4, 0]}
                name="cancellations"
              />
              <Bar
                dataKey="reschedulings"
                fill="#f59e0b"
                radius={[0, 4, 4, 0]}
                name="reschedulings"
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
