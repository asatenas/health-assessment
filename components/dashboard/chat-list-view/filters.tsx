import { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';

interface FiltersProps {
  isLoading: boolean;
  statusFilter: string;
  dateFromFilter: string;
  dateToFilter: string;
  onStatusFilterChange: (status: string) => void;
  onDateFromFilterChange: (date: string) => void;
  onDateToFilterChange: (date: string) => void;
  onClearFilters: () => void;
}

export function Filters({
  isLoading,
  statusFilter,
  dateFromFilter,
  dateToFilter,
  onStatusFilterChange,
  onDateFromFilterChange,
  onDateToFilterChange,
  onClearFilters,
}: FiltersProps) {
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  const hasActiveFilters = useMemo(() => {
    return statusFilter !== '' || dateFromFilter !== '' || dateToFilter !== '';
  }, [statusFilter, dateFromFilter, dateToFilter]);

  const setDatePreset = useCallback(
    (preset: string) => {
      let date = new Date();
      const today = new Date();
      const formatDate = (date: Date) => date.toISOString().split('T')[0];

      switch (preset) {
        case 'today':
          onDateFromFilterChange(formatDate(today));
          onDateToFilterChange(formatDate(today));
          break;
        case 'last7days':
          date = new Date(today);
          date.setDate(today.getDate() - 7);
          onDateFromFilterChange(formatDate(date));
          onDateToFilterChange(formatDate(today));
          break;
        case 'last30days':
          date = new Date(today);
          date.setDate(today.getDate() - 30);
          onDateFromFilterChange(formatDate(date));
          onDateToFilterChange(formatDate(today));
          break;
        case 'thisMonth':
          date = new Date(today.getFullYear(), today.getMonth(), 1);
          onDateFromFilterChange(formatDate(date));
          onDateToFilterChange(formatDate(today));
          break;
      }
    },
    [onDateFromFilterChange, onDateToFilterChange],
  );

  return (
    <div className="border rounded-lg bg-gray-50 dark:bg-gray-900">
      <button
        type="button"
        onClick={() => setFiltersExpanded(!filtersExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors rounded-lg"
      >
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Filtros
        </h3>
        <div className="shrink-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`size-5 text-gray-600 dark:text-gray-400 transition-transform ${filtersExpanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>
      {filtersExpanded && (
        <div className="p-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Filtros rápidos:
              </span>
              <Button
                onClick={() => setDatePreset('today')}
                variant="outline"
                size="sm"
                className="text-xs h-8"
                disabled={isLoading}
              >
                Hoje
              </Button>
              <Button
                onClick={() => setDatePreset('last7days')}
                variant="outline"
                size="sm"
                className="text-xs h-8"
                disabled={isLoading}
              >
                Últimos 7 dias
              </Button>
              <Button
                onClick={() => setDatePreset('last30days')}
                variant="outline"
                size="sm"
                className="text-xs h-8"
                disabled={isLoading}
              >
                Últimos 30 dias
              </Button>
              <Button
                onClick={() => setDatePreset('thisMonth')}
                variant="outline"
                size="sm"
                className="text-xs h-8"
                disabled={isLoading}
              >
                Este mês
              </Button>
              <div className="flex-1" />
              <Button
                onClick={onClearFilters}
                variant="ghost"
                size="sm"
                className="text-xs h-8"
                disabled={isLoading || !hasActiveFilters}
              >
                Limpar filtros
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => onStatusFilterChange(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Todos</option>
                  <option value="active">Ativo</option>
                  <option value="initialized">Iniciado</option>
                  <option value="in_progress">Em progresso</option>
                  <option value="finished">Finalizado</option>
                  <option value="incompleto">Incompleto</option>
                  <option value="expired">Expirado</option>
                </select>
              </div>

              <div>
                {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Data de início
                </label>
                <input
                  type="date"
                  value={dateFromFilter}
                  onChange={(e) => onDateFromFilterChange(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Data de fim
                </label>
                <input
                  type="date"
                  value={dateToFilter}
                  onChange={(e) => onDateToFilterChange(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
