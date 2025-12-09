'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from '@/components/toast';
import { Button } from '@/components/ui/button';
import { signOut } from 'next-auth/react';
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

type CreateChatResponse = {
  chatId: string;
  token: string;
  url: string;
};

const calculateRiskLevel = (chat: Chat): { level: string; color: string } => {
  const rcri = chat.score_rcri;
  const has2 = chat.score_aub_has2;

  if (
    rcri == null ||
    has2 == null ||
    rcri === -1 ||
    has2 === -1 ||
    chat.status === 'incomplete'
  ) {
    return {
      level: '-',
      color:
        'hidden xl:table-cell p-3 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100',
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

export default function ClinicDashboard() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [newChatData, setNewChatData] = useState<CreateChatResponse | null>(
    null,
  );
  const [legendExpanded, setLegendExpanded] = useState(true);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [chatDetailsModalOpen, setChatDetailsModalOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateFromFilter, setDateFromFilter] = useState<string>('');
  const [dateToFilter, setDateToFilter] = useState<string>('');

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (chatDetailsModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [chatDetailsModalOpen]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalChats, setTotalChats] = useState(0);
  const limit = 20;

  const fetchChats = useCallback(async () => {
    setIsLoading(true);
    setChats([]);

    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (dateFromFilter) params.append('dateFrom', dateFromFilter);
      if (dateToFilter) params.append('dateTo', dateToFilter);
      params.append('page', currentPage.toString());
      params.append('limit', limit.toString());

      const url = `/api/clinic/chats${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch chats');
      }

      const data = await response.json();
      setChats(data.chats);
      setTotalPages(data.pagination.totalPages);
      setTotalChats(data.pagination.total);
    } catch (error) {
      toast({
        type: 'error',
        // English: 'Failed to load chats'
        description: 'Falha ao carregar chats',
      });
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, dateFromFilter, dateToFilter, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, dateFromFilter, dateToFilter]);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  const createNewChat = async () => {
    setIsCreating(true);
    try {
      const response = await fetch('/api/clinic/create-chat', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to create chat');
      }

      const data: CreateChatResponse = await response.json();
      setNewChatData(data);

      toast({
        type: 'success',
        // English: 'Chat created successfully!'
        description: 'Chat criado com sucesso!',
      });

      // Refresh the chats list
      fetchChats();
    } catch (error) {
      toast({
        type: 'error',
        // English: 'Failed to create chat'
        description: 'Falha ao criar chat',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setNewChatData(null);
    try {
      await fetchChats();
      toast({
        type: 'success',
        // English: 'Chats refreshed successfully!'
        description: 'Chats atualizados com sucesso!',
      });
    } catch (error) {
      toast({
        type: 'error',
        // English: 'Failed to refresh chats'
        description: 'Falha ao atualizar chats',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const clearFilters = useCallback(() => {
    setStatusFilter('');
    setDateFromFilter('');
    setDateToFilter('');
  }, []);

  const setDatePreset = useCallback((preset: string) => {
    let date = new Date();
    const today = new Date();
    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    switch (preset) {
      case 'today':
        setDateFromFilter(formatDate(today));
        setDateToFilter(formatDate(today));
        break;
      case 'last7days':
        date = new Date(today);
        date.setDate(today.getDate() - 7);
        setDateFromFilter(formatDate(date));
        setDateToFilter(formatDate(today));
        break;
      case 'last30days':
        date = new Date(today);
        date.setDate(today.getDate() - 30);
        setDateFromFilter(formatDate(date));
        setDateToFilter(formatDate(today));
        break;
      case 'thisMonth':
        date = new Date(today.getFullYear(), today.getMonth(), 1);
        setDateFromFilter(formatDate(date));
        setDateToFilter(formatDate(today));
        break;
    }
  }, []);

  // Check if filters are active
  const hasActiveFilters = useMemo(() => {
    return statusFilter !== '' || dateFromFilter !== '' || dateToFilter !== '';
  }, [statusFilter, dateFromFilter, dateToFilter]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        type: 'success',
        // English: 'Copied to clipboard!'
        description: 'Copiado para a área de transferência!',
      });
    } catch (error) {
      toast({
        type: 'error',
        // English: 'Failed to copy to clipboard. Please check your browser permissions.'
        description:
          'Falha ao copiar para a área de transferência. Verifique as permissões do navegador.',
      });
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'initialized':
        return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'finished':
      case 'imcomplete':
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
        // English: 'Active'
        return 'Ativo';
      case 'initialized':
        // English: 'Initialized'
        return 'Iniciado';
      case 'in_progress':
        // English: 'In Progress'
        return 'Em progresso';
      case 'finished':
        // English: 'Finished'
        return 'Finalizado';
      case 'incomplete':
        // English: 'Incomplete'
        return 'Incompleto';
      case 'expired':
        // English: 'Expired'
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
    // Remove focus from the button to prevent pointer cursor state
    event?.currentTarget.blur();
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-background">
      <div className="flex-1 flex flex-col max-w-6xl w-full mx-auto p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              {/* English: 'Clinic Dashboard' */}
              Painel da Clínica
            </h1>
            <p className="text-gray-600 dark:text-zinc-400 mt-1 sm:mt-2 text-sm sm:text-base">
              {/* English: 'Generate patient chat sessions and monitor their status' */}
              Crie novos chats de pacientes e monitore seus status
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={createNewChat}
              disabled={isCreating}
              size="sm"
              className="flex-1 sm:flex-none"
            >
              {isCreating
                ? // English: 'Creating...'
                  'Criando...'
                : // English: 'Generate New Chat'
                  'Criar novo chat'}
            </Button>
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              variant="outline"
              size="sm"
            >
              {isRefreshing
                ? // English: 'Refreshing...'
                  'Atualizando...'
                : // English: 'Refresh'
                  'Atualizar'}
            </Button>
            <Button
              onClick={() => signOut({ redirectTo: '/login' })}
              variant="secondary"
              size="sm"
            >
              {/* English: 'Sign Out' */}
              Sair
            </Button>
          </div>
        </div>

        <div className="mb-6 border rounded-lg bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900">
          <button
            type="button"
            onClick={() => setLegendExpanded(!legendExpanded)}
            className="w-full p-4 flex items-start gap-3 hover:bg-blue-100 dark:hover:bg-blue-950/50 transition-colors rounded-lg"
          >
            <div className="shrink-0 mt-0.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="size-5 text-blue-600 dark:text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                {/* English: 'Risk Level Calculation' */} Cálculo do Nível de
                Risco
              </h3>
            </div>
            <div className="shrink-0 mt-0.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`size-5 text-blue-600 dark:text-blue-400 transition-transform ${legendExpanded ? 'rotate-180' : ''}`}
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
          {legendExpanded && (
            <div className="p-4">
              <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                {/* English: 'The risk level is determined by the higher score between two cardiac risk assessments (RCRI and HAS2):' */}
                O nível de risco é determinado pela maior pontuação entre duas
                avaliações de risco cardíaco (RCRI e HAS2):
              </p>
              <ul className="space-y-1.5 text-sm text-blue-800 dark:text-blue-200">
                <li className="flex items-start gap-2">
                  <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    Baixo
                  </span>
                  <span className="mt-1">
                    {/* English: 'Both scores are 0' */}
                    Ambas as pontuações são 0
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                    Moderado
                  </span>
                  <span className="mt-1">
                    {/* English: 'The highest score between the two is 1' */}A
                    maior pontuação entre as duas é 1
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                    Alto
                  </span>
                  <span className="mt-1">
                    {/* English: 'The highest score between the two is 2 or more' */}
                    A maior pontuação entre as duas é 2 ou mais
                  </span>
                </li>
              </ul>
            </div>
          )}
        </div>

        <div className="mb-6 border rounded-lg bg-gray-50 dark:bg-gray-900">
          <button
            type="button"
            onClick={() => setFiltersExpanded(!filtersExpanded)}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors rounded-lg"
          >
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {/* English: 'Filters' */} Filtros
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
                {/* Date Presets */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {/* English: 'Quick filters:' */} Filtros rápidos:
                  </span>
                  <Button
                    onClick={() => setDatePreset('today')}
                    variant="outline"
                    size="sm"
                    className="text-xs h-8"
                    disabled={isLoading}
                  >
                    {/* English: 'Today' */} Hoje
                  </Button>
                  <Button
                    onClick={() => setDatePreset('last7days')}
                    variant="outline"
                    size="sm"
                    className="text-xs h-8"
                    disabled={isLoading}
                  >
                    {/* English: 'Last 7 Days' */} Últimos 7 dias
                  </Button>
                  <Button
                    onClick={() => setDatePreset('last30days')}
                    variant="outline"
                    size="sm"
                    className="text-xs h-8"
                    disabled={isLoading}
                  >
                    {/* English: 'Last 30 Days' */} Últimos 30 dias
                  </Button>
                  <Button
                    onClick={() => setDatePreset('thisMonth')}
                    variant="outline"
                    size="sm"
                    className="text-xs h-8"
                    disabled={isLoading}
                  >
                    {/* English: 'This Month' */} Este mês
                  </Button>
                  <div className="flex-1" />
                  <Button
                    onClick={clearFilters}
                    variant="ghost"
                    size="sm"
                    className="text-xs h-8"
                    disabled={isLoading || !hasActiveFilters}
                  >
                    {/* English: 'Clear All' */} Limpar filtros
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {/* English: 'Status' */} Status
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      disabled={isLoading}
                      className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {/* English: 'All Statuses' */} Todos
                      </option>
                      <option value="active">
                        {/* English: 'Active' */} Ativo
                      </option>
                      <option value="initialized">
                        {/* English: 'Initialized' */} Iniciado
                      </option>
                      <option value="in_progress">
                        {/* English: 'In Progress' */} Em progresso
                      </option>
                      <option value="finished">
                        {/* English: 'Finished' */} Finalizado
                      </option>
                      <option value="incompleto">
                        {/* English: 'Incomplete' */} Incompleto
                      </option>
                      <option value="expired">
                        {/* English: 'Expired' */} Expirado
                      </option>
                    </select>
                  </div>

                  <div>
                    {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {/* English: 'From Date' */} Data de início
                    </label>
                    <input
                      type="date"
                      value={dateFromFilter}
                      onChange={(e) => setDateFromFilter(e.target.value)}
                      disabled={isLoading}
                      className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {/* English: 'To Date' */} Data de fim
                    </label>
                    <input
                      type="date"
                      value={dateToFilter}
                      onChange={(e) => setDateToFilter(e.target.value)}
                      disabled={isLoading}
                      className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {newChatData && (
          <div className="mb-8 p-6 border rounded-lg bg-blue-50 dark:bg-blue-950">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                {/* English: 'New Chat Created' */} Novo chat criado
              </h2>
              <button
                type="button"
                onClick={() => setNewChatData(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                aria-label="Fechar"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="size-5"
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
            <div className="space-y-3">
              <div>
                {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {/* English: 'Chat ID' */} ID do chat
                </label>
                <div className="flex gap-2 mt-1">
                  <code className="flex-1 p-2 bg-white dark:bg-gray-900 rounded border text-sm">
                    {newChatData.chatId}
                  </code>
                  <Button
                    onClick={() => copyToClipboard(newChatData.chatId)}
                    variant="outline"
                    size="sm"
                  >
                    {/* English: 'Copy' */} Copiar
                  </Button>
                </div>
              </div>
              <div>
                {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {/* English: 'Token' */} Token
                </label>
                <div className="flex gap-2 mt-1">
                  <code className="flex-1 p-2 bg-white dark:bg-gray-900 rounded border text-sm">
                    {newChatData.token}
                  </code>
                  <Button
                    onClick={() => copyToClipboard(newChatData.token)}
                    variant="outline"
                    size="sm"
                  >
                    {/* English: 'Copy' */} Copiar
                  </Button>
                </div>
              </div>
              <div>
                {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {/* English: 'Patient URL' */} URL do paciente
                </label>
                <div className="flex gap-2 mt-1">
                  <code className="flex-1 p-2 bg-white dark:bg-gray-900 rounded border text-sm">
                    {newChatData.url}
                  </code>
                  <Button
                    onClick={() => copyToClipboard(newChatData.url)}
                    variant="outline"
                    size="sm"
                  >
                    {/* English: 'Copy' */} Copiar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

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
                <col
                  className="hidden xl:table-column"
                  style={{ width: '100px' }}
                />
                <col
                  className="hidden xl:table-column"
                  style={{ width: '130px' }}
                />
              </colgroup>
              <thead className="bg-gray-50 dark:bg-gray-900 border-b">
                <tr>
                  <th className="p-3 sm:px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    #
                  </th>
                  <th className="p-3 sm:px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {/* English: 'Chat ID' */} ID do chat
                  </th>
                  <th className="hidden md:table-cell p-3 sm:px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {/* English: 'Created At' */} Criado em
                  </th>
                  <th className="p-3 sm:px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {/* English: 'Status' */} Status
                  </th>
                  <th className="hidden lg:table-cell p-3 sm:px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {/* English: 'Risk' */} Risco
                  </th>
                  <th className="hidden xl:table-cell p-3 sm:px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {/* English: 'RCRI' */} RCRI
                  </th>
                  <th className="hidden xl:table-cell p-3 sm:px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {/* English: 'AUB-HAS2' */} AUB-HAS2
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-background divide-y divide-gray-200 dark:divide-gray-800">
                {isLoading ? (
                  <>
                    {Array.from({ length: Math.min(limit, 5) }).map(
                      (_, index) => (
                        // biome-ignore lint/suspicious/noArrayIndexKey: skeleton rows are temporary and don't need stable keys
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
                          <td className="hidden xl:table-cell px-6 py-4 whitespace-nowrap">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-12" />
                          </td>
                          <td className="hidden xl:table-cell px-6 py-4 whitespace-nowrap">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-12" />
                          </td>
                        </tr>
                      ),
                    )}
                  </>
                ) : chats.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center">
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
                            ? /* English: 'No chats match your filters' */ 'Nenhum chat corresponde aos seus filtros'
                            : /* English: 'No chats yet' */ 'Ainda não há chats'}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {hasActiveFilters ? (
                            <>
                              {/* English: 'Try adjusting your filters or ' */}{' '}
                              Tente ajustar seus filtros ou{' '}
                              <button
                                type="button"
                                onClick={clearFilters}
                                className="text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                {/* English: 'clear all filters' */} limpar
                                todos os filtros
                              </button>
                            </>
                          ) : (
                            /* English: 'Create your first chat to get started' */ 'Crie seu primeiro chat para começar'
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
                          {chat.status !== 'expired' ? (
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
                        <td className="hidden xl:table-cell p-3 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {chat.score_rcri !== null &&
                          chat.score_rcri !== undefined
                            ? chat.score_rcri
                            : '-'}
                        </td>
                        <td className="hidden xl:table-cell p-3 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {chat.score_aub_has2 !== null &&
                          chat.score_aub_has2 !== undefined
                            ? chat.score_aub_has2
                            : '-'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center sm:text-left">
            {isLoading ? (
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-48" />
            ) : (
              <>
                {/* English: 'Showing' */}Mostrando{' '}
                {(currentPage - 1) * limit + 1} a{' '}
                {Math.min(currentPage * limit, totalChats)} de {totalChats}{' '}
                chats
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
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  variant="outline"
                  size="sm"
                  className="text-xs sm:text-sm"
                >
                  <span className="hidden sm:inline">
                    {' '}
                    {/* English: 'Previous' */}Anterior
                  </span>
                  <span className="sm:hidden">Anterior</span>
                </Button>
                <div className="flex items-center gap-1 sm:gap-2">
                  {/* First page */}
                  {currentPage > 3 && (
                    <>
                      <Button
                        onClick={() => setCurrentPage(1)}
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
                        onClick={() => setCurrentPage(page)}
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
                        onClick={() => setCurrentPage(totalPages)}
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
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  size="sm"
                  className="text-xs sm:text-sm"
                >
                  {/* English: 'Next' */}Próximo
                </Button>
              </>
            )}
          </div>
        </div>

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
                <h2 className="text-xl font-semibold">
                  {/* English: 'Chat Details' */} Detalhes do Chat
                </h2>
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
                  {/* Chat ID */}
                  <div>
                    <div className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {/* English: 'Chat ID' */} ID do Chat
                    </div>
                    <code className="block p-3 bg-gray-50 dark:bg-gray-800 rounded text-sm font-mono text-gray-900 dark:text-gray-100">
                      {selectedChat.id}
                    </code>
                  </div>

                  {/* Patient Info */}
                  {selectedChat.form && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
                        {/* English: 'Patient Information' */} Informações do
                        Paciente
                      </h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <div className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              {/* English: 'Age' */} Idade
                            </div>
                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded text-sm text-gray-900 dark:text-gray-100">
                              {selectedChat.form.age} anos
                            </div>
                          </div>
                          <div>
                            <div className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              {/* English: 'Weight' */} Peso
                            </div>
                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded text-sm text-gray-900 dark:text-gray-100">
                              {selectedChat.form.weight} kg
                            </div>
                          </div>
                          <div>
                            <div className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              {/* English: 'Height' */} Altura
                            </div>
                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded text-sm text-gray-900 dark:text-gray-100">
                              {selectedChat.form.height} cm
                            </div>
                          </div>
                        </div>

                        {/* Allergies */}
                        <div>
                          <div className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {/* English: 'Allergies' */} Alergias
                          </div>
                          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded text-sm text-gray-900 dark:text-gray-100">
                            {selectedChat.form.allergies &&
                            selectedChat.form.allergies.length > 0
                              ? selectedChat.form.allergies.join(', ')
                              : 'Nenhuma'}
                          </div>
                        </div>

                        {/* Medical Devices */}
                        {selectedChat.form.medicalDevices && (
                          <div>
                            <div className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              {/* English: 'Medical Devices' */} Dispositivos
                              Médicos
                            </div>
                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded text-sm text-gray-900 dark:text-gray-100">
                              {(() => {
                                const devices = [];
                                if (
                                  selectedChat.form.medicalDevices?.paceMaker
                                ) {
                                  devices.push('Marcapasso');
                                }
                                if (
                                  selectedChat.form.medicalDevices
                                    ?.medicationPump
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

                  {/* Medications */}
                  {selectedChat.medications && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
                        {/* English: 'Medications in use' */} Medicamentos em
                        uso
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

                  {/* Risk Scores */}
                  {(selectedChat.score_rcri !== null &&
                    selectedChat.score_rcri !== undefined) ||
                  (selectedChat.score_aub_has2 !== null &&
                    selectedChat.score_aub_has2 !== undefined) ? (
                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
                        {/* English: 'Risk Scores' */} Pontuações de Risco
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <div className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            RCRI
                          </div>
                          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded text-sm text-gray-900 dark:text-gray-100">
                            {selectedChat.score_rcri !== null &&
                            selectedChat.score_rcri !== undefined
                              ? selectedChat.score_rcri
                              : '-'}
                          </div>
                        </div>
                        <div>
                          <div className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            AUB-HAS2
                          </div>
                          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded text-sm text-gray-900 dark:text-gray-100">
                            {selectedChat.score_aub_has2 !== null &&
                            selectedChat.score_aub_has2 !== undefined
                              ? selectedChat.score_aub_has2
                              : '-'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {/* Results */}
                  {selectedChat.results && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
                        {/* English: 'Risk Assessment Results' */} Resultados da
                        Avaliação de Risco
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
                  {/* English: 'Close' */} Fechar
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
