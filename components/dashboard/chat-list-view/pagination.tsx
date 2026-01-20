import { Button } from '@/components/ui/button';

interface PaginationProps {
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  totalChats: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  isLoading,
  currentPage,
  totalPages,
  totalChats,
  limit,
  onPageChange,
}: PaginationProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center sm:text-left">
        {isLoading ? (
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-48" />
        ) : (
          <>
            Mostrando {(currentPage - 1) * limit + 1} a{' '}
            {Math.min(currentPage * limit, totalChats)} de {totalChats}{' '}
            avaliações
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
                    variant={currentPage === totalPages ? 'default' : 'outline'}
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
  );
}
