'use client';

import { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import type { ChatStatus } from '@/lib/db/chat-status';

type Chat = {
  id: string;
  createdAt: string;
  status: ChatStatus | 'expired';
  form?: {
    age: number;
    weight: number;
    height: number;
    allergies?: string[];
    medicalDevices?: {
      paceMaker?: boolean;
      medicationPump?: boolean;
      others?: string;
    };
    hemoglobin?: number;
    creatinine?: number;
  };
  results?: string;
  medications?: string;
  score_rcri?: number | null;
  score_aub_has2?: number | null;
};

interface ChatListViewProps {
  chats: Chat[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  totalChats: number;
  limit: number;
  statusFilter: string;
  dateFromFilter: string;
  dateToFilter: string;
  onPageChange: (page: number) => void;
  onStatusFilterChange: (status: string) => void;
  onDateFromFilterChange: (date: string) => void;
  onDateToFilterChange: (date: string) => void;
  onClearFilters: () => void;
}

const calculateRiskLevel = (chat: Chat): { level: string; color: string } => {
  const rcri = chat.score_rcri ?? -1;
  const has2 = chat.score_aub_has2 ?? -1;

  if (rcri === -1 || has2 === -1) {
    return {
      level: '-',
      color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    };
  }

  const maxScore = Math.max(rcri, has2);

  if (maxScore === 0) {
    return {
      level: 'Baixo',
      color:
        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    };
  }
  if (maxScore === 1) {
    return {
      level: 'Moderado',
      color:
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    };
  }
  return {
    level: 'Alto',
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };
};

type MedicationDetail = {
  medicationName: string;
  suspensionDays: string;
};

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
}: ChatListViewProps) {
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [chatDetailsModalOpen, setChatDetailsModalOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

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

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'initialized':
        return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'finished':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
      case 'expired':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
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
        return status.replace('_', ' ');
    }
  };

  const openChatDetailsModal = (
    chat: Chat,
    event?: React.MouseEvent<HTMLButtonElement>,
  ) => {
    setSelectedChat(chat);
    setChatDetailsModalOpen(true);
    event?.currentTarget.blur();
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
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

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <colgroup>
              <col style={{ width: '60px' }} />
              <col />
              <col
                className="hidden md:table-column"
                style={{ width: '200px' }}
              />
              <col style={{ width: '140px' }} />
              <col
                className="hidden lg:table-column"
                style={{ width: '120px' }}
              />
            </colgroup>
            <thead className="bg-gray-50 dark:bg-gray-900 border-b">
              <tr>
                <th className="p-3 sm:px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  #
                </th>
                <th className="p-3 sm:px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  ID do chat
                </th>
                <th className="hidden md:table-cell p-3 sm:px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Criado em
                </th>
                <th className="p-3 sm:px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="hidden lg:table-cell p-3 sm:px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Risco
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-background divide-y divide-gray-200 dark:divide-gray-800">
              {isLoading ? (
                <>
                  {Array.from({ length: Math.min(limit, 5) }).map(
                    (_, index) => (
                      // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-8" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-32" />
                        </td>
                        <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-40" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse w-20" />
                        </td>
                        <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20" />
                        </td>
                      </tr>
                    ),
                  )}
                </>
              ) : chats.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="text-gray-400 dark:text-gray-500">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-12"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                          />
                        </svg>
                      </div>
                      <div className="text-gray-700 dark:text-gray-300 font-medium">
                        {hasActiveFilters
                          ? 'Nenhum chat corresponde aos seus filtros'
                          : 'Ainda não há chats'}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {hasActiveFilters ? (
                          <>
                            Tente ajustar seus filtros ou{' '}
                            <button
                              type="button"
                              onClick={onClearFilters}
                              className="text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              limpar todos os filtros
                            </button>
                          </>
                        ) : (
                          'Crie seu primeiro chat para começar'
                        )}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                chats.map((chat, index) => {
                  const rowNumber = (currentPage - 1) * limit + index + 1;
                  return (
                    <tr
                      key={chat.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-900"
                    >
                      <td className="p-3 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        {rowNumber}
                      </td>
                      <td className="p-3 sm:px-6 sm:py-4 whitespace-nowrap">
                        {chat.status === 'finished' ? (
                          <button
                            type="button"
                            onClick={(e) => openChatDetailsModal(chat, e)}
                            className="text-blue-600 dark:text-blue-400 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                          >
                            <code className="text-xs sm:text-sm font-mono">
                              {chat.id}
                            </code>
                          </button>
                        ) : (
                          <code className="text-xs sm:text-sm font-mono text-gray-900 dark:text-gray-100">
                            {chat.id}
                          </code>
                        )}
                        <div className="md:hidden text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {new Date(chat.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="hidden md:table-cell p-3 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {new Date(chat.createdAt).toLocaleString()}
                      </td>
                      <td className="p-3 sm:px-6 sm:py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(
                            chat.status,
                          )}`}
                        >
                          {getStatusLabel(chat.status)}
                        </span>
                      </td>
                      <td className="hidden lg:table-cell p-3 sm:px-6 sm:py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${calculateRiskLevel(chat).color}`}
                        >
                          {calculateRiskLevel(chat).level}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center sm:text-left">
          {isLoading ? (
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-48" />
          ) : (
            <>
              Mostrando {(currentPage - 1) * limit + 1} a{' '}
              {Math.min(currentPage * limit, totalChats)} de {totalChats} chats
            </>
          )}
        </div>
        <div className="flex gap-1 sm:gap-2 flex-wrap justify-center">
          {isLoading ? (
            <>
              <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20" />
              <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-10" />
              <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20" />
            </>
          ) : (
            <>
              <Button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                variant="outline"
                size="sm"
                className="text-xs sm:text-sm"
              >
                Anterior
              </Button>
              <div className="flex items-center gap-1 sm:gap-2">
                {currentPage > 3 && (
                  <>
                    <Button
                      onClick={() => onPageChange(1)}
                      variant={currentPage === 1 ? 'default' : 'outline'}
                      size="sm"
                    >
                      1
                    </Button>
                    {currentPage > 4 && (
                      <span className="text-gray-600 dark:text-gray-400">
                        ...
                      </span>
                    )}
                  </>
                )}

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (page) =>
                      page === currentPage ||
                      page === currentPage - 1 ||
                      page === currentPage + 1 ||
                      page === currentPage - 2 ||
                      page === currentPage + 2,
                  )
                  .map((page) => (
                    <Button
                      key={page}
                      onClick={() => onPageChange(page)}
                      variant={currentPage === page ? 'default' : 'outline'}
                      size="sm"
                    >
                      {page}
                    </Button>
                  ))}

                {currentPage < totalPages - 2 && (
                  <>
                    {currentPage < totalPages - 3 && (
                      <span className="text-gray-600 dark:text-gray-400">
                        ...
                      </span>
                    )}
                    <Button
                      onClick={() => onPageChange(totalPages)}
                      variant={
                        currentPage === totalPages ? 'default' : 'outline'
                      }
                      size="sm"
                    >
                      {totalPages}
                    </Button>
                  </>
                )}
              </div>
              <Button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                variant="outline"
                size="sm"
                className="text-xs sm:text-sm"
              >
                Próximo
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Chat Details Modal */}
      {chatDetailsModalOpen && selectedChat && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            onClick={() => setChatDetailsModalOpen(false)}
            aria-label="Close modal"
          />
          <div
            role="dialog"
            aria-modal="true"
            className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between p-4 sm:p-6 border-b dark:border-gray-800">
              <h2 className="text-xl font-semibold">Detalhes do Chat</h2>
              <button
                type="button"
                onClick={() => setChatDetailsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="size-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto p-4 sm:p-6">
              <div className="space-y-6">
                <div>
                  <div className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    ID do Chat
                  </div>
                  <code className="block p-3 bg-gray-50 dark:bg-gray-800 rounded text-sm font-mono text-gray-900 dark:text-gray-100">
                    {selectedChat.id}
                  </code>
                </div>

                {selectedChat.form && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
                      Informações do Paciente
                    </h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <div className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Idade
                          </div>
                          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded text-sm text-gray-900 dark:text-gray-100">
                            {selectedChat.form.age} anos
                          </div>
                        </div>
                        <div>
                          <div className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Peso
                          </div>
                          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded text-sm text-gray-900 dark:text-gray-100">
                            {selectedChat.form.weight} kg
                          </div>
                        </div>
                        <div>
                          <div className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Altura
                          </div>
                          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded text-sm text-gray-900 dark:text-gray-100">
                            {selectedChat.form.height} cm
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Alergias
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded text-sm text-gray-900 dark:text-gray-100">
                          {selectedChat.form.allergies &&
                          selectedChat.form.allergies.length > 0
                            ? selectedChat.form.allergies.join(', ')
                            : 'Nenhuma'}
                        </div>
                      </div>

                      {selectedChat.form.medicalDevices && (
                        <div>
                          <div className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Dispositivos Médicos
                          </div>
                          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded text-sm text-gray-900 dark:text-gray-100">
                            {(() => {
                              const devices = [];
                              if (selectedChat.form.medicalDevices?.paceMaker) {
                                devices.push('Marcapasso');
                              }
                              if (
                                selectedChat.form.medicalDevices?.medicationPump
                              ) {
                                devices.push('Bomba de medicação');
                              }
                              if (selectedChat.form.medicalDevices?.others) {
                                devices.push(
                                  selectedChat.form.medicalDevices.others,
                                );
                              }
                              return devices.length > 0
                                ? devices.join(', ')
                                : 'Nenhum';
                            })()}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selectedChat.medications && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
                      Medicamentos em uso
                    </h3>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded text-sm text-gray-900 dark:text-gray-100 whitespace-pre-line">
                      {(() => {
                        try {
                          const meds = JSON.parse(selectedChat.medications);
                          if (Array.isArray(meds) && meds.length > 0) {
                            return meds
                              .map(
                                (med: MedicationDetail) =>
                                  `${med.medicationName}: ${med.suspensionDays}`,
                              )
                              .join('\n');
                          }
                          return 'Nenhum medicamento';
                        } catch {
                          return 'Erro ao carregar medicamentos';
                        }
                      })()}
                    </div>
                  </div>
                )}

                {selectedChat.results && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
                      Resultados da Avaliação de Risco
                    </h3>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                      {selectedChat.results}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 sm:p-6 border-t dark:border-gray-800">
              <Button
                onClick={() => setChatDetailsModalOpen(false)}
                variant="outline"
              >
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
