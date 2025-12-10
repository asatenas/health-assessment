'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface MetricsOverviewProps {
  totalAssessments: number;
  completionRate: number;
  highRiskPatients: number;
  latexAllergies: number;
  isLoading?: boolean;
}

export function MetricsOverview({
  totalAssessments,
  completionRate,
  highRiskPatients,
  latexAllergies,
  isLoading = false,
}: MetricsOverviewProps) {
  const metrics = [
    {
      title: 'Total de Pré-anestésicos',
      value: totalAssessments,
      icon: Activity,
      description: 'Avaliações registradas',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Taxa de Conclusão',
      value: `${completionRate.toFixed(1)}%`,
      icon: CheckCircle2,
      description: 'Formulários completos',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Pacientes de Alto Risco',
      value: highRiskPatients,
      icon: AlertTriangle,
      description: 'Requerem atenção especial',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Alergias à Látex',
      value: latexAllergies,
      icon: AlertTriangle,
      description: 'Requerem atenção especial',
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <Card key={metric.title} className="transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <div className={`rounded-full p-2 ${metric.bgColor}`}>
                <Icon className={`size-4 ${metric.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20 mb-1" />
              ) : (
                <div className="text-2xl font-bold">{metric.value}</div>
              )}
              <p className="text-xs text-muted-foreground">
                {metric.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
