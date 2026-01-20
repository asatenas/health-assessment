import { useState } from 'react';

export function RiskLegend() {
  const [legendExpanded, setLegendExpanded] = useState(true);

  return (
    <div className="border rounded-lg bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900">
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
            Cálculo do Nível de Risco
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
            O nível de risco é determinado pela maior pontuação entre duas
            avaliações de risco cardíaco (RCRI e HAS2):
          </p>
          <ul className="space-y-1.5 text-sm text-blue-800 dark:text-blue-200">
            <li className="flex items-start gap-2">
              <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Baixo
              </span>
              <span className="mt-1">
                A maior pontuação entre as duas é 0 ou 1
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                Moderado
              </span>
              <span className="mt-1">
                A maior pontuação entre as duas é 2 ou 3
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                Alto
              </span>
              <span className="mt-1">
                A maior pontuação entre as duas é 4 ou mais
              </span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
