'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardFiltersProps {
  onFilterChange: (period: string, dateFrom?: Date, dateTo?: Date) => void;
}

type PresetPeriod = '1d' | '7d' | '30d' | '60d' | '90d' | 'custom';

export function DashboardFilters({ onFilterChange }: DashboardFiltersProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<PresetPeriod>('30d');
  const [showCustomDates, setShowCustomDates] = useState(false);
  const [customDateFrom, setCustomDateFrom] = useState('');
  const [customDateTo, setCustomDateTo] = useState('');

  const presets: { value: PresetPeriod; label: string }[] = [
    { value: '1d', label: '1 dia' },
    { value: '7d', label: '7 dias' },
    { value: '30d', label: '30 dias' },
    { value: '60d', label: '60 dias' },
    { value: '90d', label: '90 dias' },
    { value: 'custom', label: 'Personalizado' },
  ];

  const handlePresetClick = (period: PresetPeriod) => {
    setSelectedPeriod(period);

    if (period === 'custom') {
      setShowCustomDates(true);
      return;
    }

    setShowCustomDates(false);

    // Calculate date range based on period
    const now = new Date();
    const dateFrom = new Date();

    switch (period) {
      case '1d':
        dateFrom.setDate(now.getDate() - 1);
        break;
      case '7d':
        dateFrom.setDate(now.getDate() - 7);
        break;
      case '30d':
        dateFrom.setDate(now.getDate() - 30);
        break;
      case '60d':
        dateFrom.setDate(now.getDate() - 60);
        break;
      case '90d':
        dateFrom.setDate(now.getDate() - 90);
        break;
    }

    onFilterChange(period, dateFrom, now);
  };

  const handleCustomDateApply = () => {
    if (!customDateFrom || !customDateTo) {
      return;
    }

    const dateFrom = new Date(customDateFrom);
    const dateTo = new Date(customDateTo);

    if (dateFrom > dateTo) {
      alert('A data inicial não pode ser posterior à data final');
      return;
    }

    onFilterChange('custom', dateFrom, dateTo);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">
          Período:
        </span>
        {presets.map((preset) => (
          <Button
            key={preset.value}
            variant={selectedPeriod === preset.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => handlePresetClick(preset.value)}
            className={cn(
              'transition-all',
              selectedPeriod === preset.value && 'shadow-md',
            )}
          >
            {preset.value === 'custom' && <Calendar className="mr-2 h-4 w-4" />}
            {preset.label}
          </Button>
        ))}
      </div>

      {showCustomDates && (
        <div className="flex flex-wrap items-end gap-3 rounded-lg border bg-muted/50 p-4">
          <div className="flex-1 space-y-2">
            <label htmlFor="dateFrom" className="text-xs font-medium">
              Data Inicial
            </label>
            <input
              id="dateFrom"
              type="date"
              value={customDateFrom}
              onChange={(e) => setCustomDateFrom(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          <div className="flex-1 space-y-2">
            <label htmlFor="dateTo" className="text-xs font-medium">
              Data Final
            </label>
            <input
              id="dateTo"
              type="date"
              value={customDateTo}
              onChange={(e) => setCustomDateTo(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          <Button
            size="sm"
            onClick={handleCustomDateApply}
            disabled={!customDateFrom || !customDateTo}
          >
            Aplicar
          </Button>
        </div>
      )}
    </div>
  );
}
