'use client';

import { useMemo, useState } from 'react';
import { AssessmentDetailsModal } from './assessment-details-modal';
import { SurgeryDetailsModal } from './surgery-details-modal';

import type { Chat, ChatListViewProps } from './chat-list-view/types';
import { RiskLegend } from './chat-list-view/risk-legend';
import { StatusLegend } from './chat-list-view/status-legend';
import { Filters } from './chat-list-view/filters';
import { DesktopTable } from './chat-list-view/desktop-table';
import { MobileCards } from './chat-list-view/mobile-cards';
import { Pagination } from './chat-list-view/pagination';
import { PermissionGate } from '@/components/auth/permission-gate';
import { useChats } from '@/hooks/swr';

// Re-export types and utils for backward compatibility
export type { Chat };
export { calculateRiskLevel } from './chat-list-view/utils';

const LIMIT = 20;

export function ChatListView({
  currentPage,
  statusFilter,
  dateFromFilter,
  dateToFilter,
  onPageChange,
  onStatusFilterChange,
  onDateFromFilterChange,
  onDateToFilterChange,
  onClearFilters,
  canReadFull,
}: ChatListViewProps) {
  const [chatDetailsModalOpen, setChatDetailsModalOpen] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [surgeryDetailsModalOpen, setSurgeryDetailsModalOpen] = useState(false);
  const [selectedSurgeryId, setSelectedSurgeryId] = useState<string | null>(null);

  const { chats, totalPages, totalChats, isLoading } = useChats({
    page: currentPage,
    limit: LIMIT,
    status: statusFilter || undefined,
    dateFrom: dateFromFilter || undefined,
    dateTo: dateToFilter || undefined,
  });

  const hasActiveFilters = useMemo(() => {
    return statusFilter !== '' || dateFromFilter !== '' || dateToFilter !== '';
  }, [statusFilter, dateFromFilter, dateToFilter]);

  const openChatDetailsModal = (
    chat: Chat,
    event?: React.MouseEvent<HTMLButtonElement>,
  ) => {
    setSelectedChatId(chat.id);
    setChatDetailsModalOpen(true);
    event?.currentTarget.blur();
  };

  const handleViewSurgery = () => {
    setChatDetailsModalOpen(false);
    setSelectedSurgeryId(selectedChatId);
    setSurgeryDetailsModalOpen(true);
  };

  const handleViewAssessment = () => {
    setSurgeryDetailsModalOpen(false);
    setSelectedChatId(selectedSurgeryId);
    setChatDetailsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <PermissionGate permission="assessments.read">
        <RiskLegend />
      </PermissionGate>

      <StatusLegend />

      <Filters
        isLoading={isLoading}
        statusFilter={statusFilter}
        dateFromFilter={dateFromFilter}
        dateToFilter={dateToFilter}
        onStatusFilterChange={onStatusFilterChange}
        onDateFromFilterChange={onDateFromFilterChange}
        onDateToFilterChange={onDateToFilterChange}
        onClearFilters={onClearFilters}
      />

      <DesktopTable
        chats={chats}
        isLoading={isLoading}
        limit={LIMIT}
        currentPage={currentPage}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={onClearFilters}
        onChatClick={openChatDetailsModal}
        canReadFull={canReadFull}
      />

      <MobileCards
        chats={chats}
        isLoading={isLoading}
        limit={LIMIT}
        currentPage={currentPage}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={onClearFilters}
        onChatClick={openChatDetailsModal}
        canReadFull={canReadFull}
      />

      <Pagination
        isLoading={isLoading}
        currentPage={currentPage}
        totalPages={totalPages}
        totalChats={totalChats}
        limit={LIMIT}
        onPageChange={onPageChange}
      />

      <AssessmentDetailsModal
        assessmentId={selectedChatId}
        open={chatDetailsModalOpen}
        onOpenChange={(open) => {
          setChatDetailsModalOpen(open);
          if (!open) setSelectedChatId(null);
        }}
        onViewSurgery={handleViewSurgery}
      />

      <SurgeryDetailsModal
        assessmentId={selectedSurgeryId}
        open={surgeryDetailsModalOpen}
        onOpenChange={(open) => {
          setSurgeryDetailsModalOpen(open);
          if (!open) setSelectedSurgeryId(null);
        }}
        onViewAssessment={handleViewAssessment}
      />
    </div>
  );
}
