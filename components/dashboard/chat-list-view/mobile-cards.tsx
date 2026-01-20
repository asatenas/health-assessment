import type { Chat } from './types';
import { getRiskLevel, getStatusBadgeColor, getStatusLabel } from './utils';

interface MobileCardsProps {
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
}

export function MobileCards({
  chats,
  isLoading,
  limit,
  currentPage,
  hasActiveFilters,
  onClearFilters,
  onChatClick,
}: MobileCardsProps) {
  return (
    <div className="sm:hidden space-y-3">
      {isLoading ? (
        <>
          {Array.from({ length: Math.min(limit, 5) }).map((_, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            <div key={index} className="border rounded-lg p-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-32 mb-3" />
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20 mb-3" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-full mb-2" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
            </div>
          ))}
        </>
      ) : chats.length === 0 ? (
        <div className="border rounded-lg p-8 text-center">
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
        </div>
      ) : (
        chats.map((chat, index) => {
          const rowNumber = (currentPage - 1) * limit + index + 1;
          const riskLevel = getRiskLevel(chat);
          return (
            <div
              key={chat.id}
              className="border rounded-lg p-4 bg-white dark:bg-background"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    #{rowNumber}
                  </span>
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(
                      chat.status,
                    )}`}
                  >
                    {getStatusLabel(chat.status)}
                  </span>
                </div>
                {riskLevel.level !== '-' && (
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${riskLevel.color}`}
                  >
                    Risco: {riskLevel.level}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    ID da avaliação
                  </div>
                  {chat.status !== 'expired' ? (
                    <button
                      type="button"
                      onClick={(e) => onChatClick(chat, e)}
                      className="text-blue-600 dark:text-blue-400 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                    >
                      <code className="text-xs font-mono break-all">
                        {chat.id}
                      </code>
                    </button>
                  ) : (
                    <code className="text-xs font-mono text-gray-900 dark:text-gray-100 break-all">
                      {chat.id}
                    </code>
                  )}
                </div>

                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Criada em
                  </div>
                  <div className="text-sm text-gray-900 dark:text-gray-100">
                    {new Date(chat.createdAt).toLocaleString()}
                  </div>
                </div>

                {(chat.score_rcri !== null || chat.score_aub_has2 !== null) && (
                  <div className="flex gap-4 pt-2">
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        RCRI
                      </div>
                      <div className="text-sm text-gray-900 dark:text-gray-100">
                        {chat.score_rcri !== null &&
                        chat.score_rcri !== undefined
                          ? chat.score_rcri
                          : '-'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        AUB-HAS2
                      </div>
                      <div className="text-sm text-gray-900 dark:text-gray-100">
                        {chat.score_aub_has2 !== null &&
                        chat.score_aub_has2 !== undefined
                          ? chat.score_aub_has2
                          : '-'}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
