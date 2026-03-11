'use client';

import { useState, useEffect, useCallback } from 'react';

export type DashboardView = 'analytics' | 'list';

export function useDashboardFilters() {
  const [view, setView] = useState<DashboardView>('analytics');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');
  const [currentPeriod, setCurrentPeriod] = useState('30d');
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, dateFromFilter, dateToFilter]);

  const handleFilterChange = useCallback(
    (period: string, dateFrom?: Date, dateTo?: Date) => {
      setCurrentPeriod(period);
      if (dateFrom) setDateFromFilter(dateFrom.toISOString().split('T')[0]);
      if (dateTo) setDateToFilter(dateTo.toISOString().split('T')[0]);
    },
    [],
  );

  const clearFilters = useCallback(() => {
    setStatusFilter('');
    setDateFromFilter('');
    setDateToFilter('');
    setCurrentPeriod('30d');
  }, []);

  return {
    view,
    setView,
    statusFilter,
    setStatusFilter,
    dateFromFilter,
    setDateFromFilter,
    dateToFilter,
    setDateToFilter,
    currentPeriod,
    currentPage,
    setCurrentPage,
    handleFilterChange,
    clearFilters,
  };
}
