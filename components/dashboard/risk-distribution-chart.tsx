'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';

interface RiskDistributionChartProps {
  low: number;
  medium: number;
  high: number;
  unknown: number;
}

export function RiskDistributionChart({
  low,
  medium,
  high,
  unknown,
}: RiskDistributionChartProps) {
  const data = [
    { name: 'Risco Baixo', value: low, color: '#22c55e' },
    { name: 'Risco Moderado', value: medium, color: '#f59e0b' },
    { name: 'Risco Alto', value: high, color: '#ef4444' },
    // { name: 'Incompleto', value: unknown, color: '#94a3b8' },
  ].filter((item) => item.value > 0); // Only show categories with data

  // const total = baixo + moderado + alto + unknown;
  const total = low + medium + high;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const percentage =
        total > 0 ? ((payload[0].value / total) * 100).toFixed(1) : '0';
      return (
        <div className="rounded-lg border bg-background p-2 shadow-md">
          <p className="text-sm font-medium">{payload[0].name}</p>
          <p className="text-sm text-muted-foreground">
            {payload[0].value} pacientes ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribuição de Risco</CardTitle>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
            Nenhum dado disponível
          </div>
        ) : (
          <div className="h-[320px] sm:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ percent = 0 }) => `${(percent * 100).toFixed(0)}%`}
                  outerRadius="55%"
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value, entry: any) => (
                    <span className="text-sm">
                      {value} ({entry.payload.value})
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
