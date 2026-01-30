import type { Chat } from './types';
import {
  getRiskLevel,
  getDaysUntilSurgery,
  getStatusBadgeColor,
  getStatusLabel,
} from './utils';

interface DesktopTableProps {
  chats: Chat[];
  isLoading: boolean;
  limit: number;
  currentPage: number;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  onChatClick: (
    chat: Chat,
    event?: React.MouseEvent<HTMLButtonElement>,
  ) => void;
  canReadFull: boolean;
}

export function DesktopTable({
  chats,
  isLoading,
  limit,
  currentPage,
  hasActiveFilters,
  onClearFilters,
  onChatClick,
  canReadFull,
}: DesktopTableProps) {
  return (
    <div className="hidden sm:block border rounded-lg overflow-hidden">
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
              style={{ width: '130px' }}
            />
            {canReadFull && (
              <>
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
              </>
            )}
          </colgroup>
          <thead className="bg-gray-50 dark:bg-gray-900 border-b">
            <tr>
              <th className="p-3 sm:px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                #
              </th>
              <th className="p-3 sm:px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                ID da avaliação
              </th>
              <th className="hidden md:table-cell p-3 sm:px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Criada em
              </th>
              <th className="p-3 sm:px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="hidden lg:table-cell p-3 sm:px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Dias até cirurgia
              </th>
              {canReadFull && (
                <>
                  <th className="hidden lg:table-cell p-3 sm:px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Risco
                  </th>
                  <th className="hidden xl:table-cell p-3 sm:px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    RCRI
                  </th>
                  <th className="hidden xl:table-cell p-3 sm:px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    AUB-HAS2
                  </th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-background divide-y divide-gray-200 dark:divide-gray-800">
            {isLoading ? (
              <>
                {Array.from({ length: Math.min(limit, 5) }).map((_, index) => (
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
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-16" />
                    </td>
                    {canReadFull && (
                      <>
                        <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20" />
                        </td>
                        <td className="hidden xl:table-cell px-6 py-4 whitespace-nowrap">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-12" />
                        </td>
                        <td className="hidden xl:table-cell px-6 py-4 whitespace-nowrap">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-12" />
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </>
            ) : chats.length === 0 ? (
              <tr>
                <td
                  colSpan={canReadFull ? 8 : 5}
                  className="px-6 py-8 text-center"
                >
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
                        ? 'Nenhuma avaliação corresponde aos seus filtros'
                        : 'Ainda não há avaliações'}
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
                        'Crie sua primeira avaliação para começar'
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
                      {chat.status !== 'expired' && canReadFull ? (
                        <button
                          type="button"
                          onClick={(e) => onChatClick(chat, e)}
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
                    <td className="hidden lg:table-cell p-3 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {getDaysUntilSurgery(chat.surgeryDate)}
                    </td>
                    {canReadFull && (
                      <>
                        <td className="hidden lg:table-cell p-3 sm:px-6 sm:py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRiskLevel(chat).color}`}
                          >
                            {getRiskLevel(chat).level}
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
                      </>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
