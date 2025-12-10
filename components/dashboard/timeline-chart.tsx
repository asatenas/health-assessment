'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { BarChart3, LineChart as LineChartIcon } from 'lucide-react';

interface TimelineDataPoint {
  date: string;
  assessmentsCreated: number;
  assessmentsCompleted: number;
}

interface TimelineChartProps {
  data: TimelineDataPoint[];
}

export function TimelineChart({ data }: TimelineChartProps) {
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');

  const processedData = useMemo(() => {
    if (chartType === 'line') {
      let cumulativeCreated = 0;
      let cumulativeCompleted = 0;
      return data.map((item) => {
        cumulativeCreated += item.assessmentsCreated || 0;
        cumulativeCompleted += item.assessmentsCompleted || 0;
        return {
          ...item,
          assessmentsCreated: cumulativeCreated,
          assessmentsCompleted: cumulativeCompleted,
        };
      });
    } else {
      return data;
    }
  }, [data, chartType]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-3 shadow-md">
          <p className="mb-2 text-sm font-medium">{label}</p>
          {payload.map((entry: any) => (
            <p
              key={entry.name}
              className="text-sm"
              style={{ color: entry.color }}
            >
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
        <div className="flex items-center justify-between">
          <CardTitle>Linha do Tempo de Avaliações</CardTitle>
          <div className="flex gap-1">
            <Button
              variant={chartType === 'line' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('line')}
              className="h-8 px-3"
            >
              <LineChartIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={chartType === 'bar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('bar')}
              className="h-8 px-3"
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
            Nenhum dado disponível
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={processedData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                className="text-xs"
                tick={{ fill: 'currentColor' }}
              />
              <YAxis className="text-xs" tick={{ fill: 'currentColor' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '14px' }}
                formatter={(value) => {
                  const labels: Record<string, string> = {
                    assessments: 'Avaliações',
                    completed: 'Concluídas',
                  };
                  return labels[value] || value;
                }}
              />
              {chartType === 'line' ? (
                <>
                  <Area
                    type="monotone"
                    dataKey="assessmentsCreated"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.2}
                    name="Avaliações"
                  />
                  <Area
                    type="monotone"
                    dataKey="assessmentsCompleted"
                    stroke="#22c55e"
                    fill="#22c55e"
                    fillOpacity={0.2}
                    name="Finalizados"
                  />
                </>
              ) : (
                <>
                  <Bar
                    dataKey="assessmentsCreated"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                    name="Avaliações"
                  />
                  <Bar
                    dataKey="assessmentsCompleted"
                    fill="#22c55e"
                    radius={[4, 4, 0, 0]}
                    name="Finalizados"
                  />
                </>
              )}
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
