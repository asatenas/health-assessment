'use client';

import { useState, useMemo } from 'react';
import { SurgeryDetailModal } from './surgery-detail-modal';

import type { Chat, ChatListViewProps } from './chat-list-view/types';
import { RiskLegend } from './chat-list-view/risk-legend';
import { Filters } from './chat-list-view/filters';
import { DesktopTable } from './chat-list-view/desktop-table';
import { MobileCards } from './chat-list-view/mobile-cards';
import { Pagination } from './chat-list-view/pagination';
import { PermissionGate } from '@/components/auth/permission-gate';

// Re-export types and utils for backward compatibility
export type { Chat };
export { calculateRiskLevel } from './chat-list-view/utils';

export function ChatListView({
  chats,
  isLoading,
  currentPage,
  totalPages,
  totalChats,
  limit,
  statusFilter,
  dateFromFilter,
  dateToFilter,
  onPageChange,
  onStatusFilterChange,
  onDateFromFilterChange,
  onDateToFilterChange,
  onClearFilters,
  userRole,
}: ChatListViewProps) {
  const [chatDetailsModalOpen, setChatDetailsModalOpen] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

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

  return (
    <div className="space-y-6">
      <PermissionGate permission="assessments.read">
        <RiskLegend />
      </PermissionGate>

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
        limit={limit}
        currentPage={currentPage}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={onClearFilters}
        onChatClick={openChatDetailsModal}
        userRole={userRole}
      />

      <MobileCards
        chats={chats}
        isLoading={isLoading}
        limit={limit}
        currentPage={currentPage}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={onClearFilters}
        onChatClick={openChatDetailsModal}
        userRole={userRole}
      />

      <Pagination
        isLoading={isLoading}
        currentPage={currentPage}
        totalPages={totalPages}
        totalChats={totalChats}
        limit={limit}
        onPageChange={onPageChange}
      />

      <SurgeryDetailModal
        assessmentId={selectedChatId}
        open={chatDetailsModalOpen}
        onOpenChange={(open) => {
          setChatDetailsModalOpen(open);
          if (!open) {
            setSelectedChatId(null);
          }
        }}
      />
    </div>
  );
}
