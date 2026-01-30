import { useState } from 'react';

export function StatusLegend() {
  const [legendExpanded, setLegendExpanded] = useState(false);

  return (
    <div className="border rounded-lg bg-gray-50 dark:bg-gray-950/30 border-gray-200 dark:border-gray-800">
      <button
        type="button"
        onClick={() => setLegendExpanded(!legendExpanded)}
        className="w-full p-4 flex items-start gap-3 hover:bg-gray-100 dark:hover:bg-gray-950/50 transition-colors rounded-lg"
      >
        <div className="shrink-0 mt-0.5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="size-5 text-gray-600 dark:text-gray-400"
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
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Status das Avaliações
          </h3>
        </div>
        <div className="shrink-0 mt-0.5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`size-5 text-gray-600 dark:text-gray-400 transition-transform ${legendExpanded ? 'rotate-180' : ''}`}
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
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
            Cada avaliação pode estar em um dos seguintes status:
          </p>
          <ul className="space-y-1.5 text-sm text-gray-700 dark:text-gray-300">
            <li className="flex items-start gap-2">
              <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Ativo
              </span>
              <span className="mt-1">
                Avaliação foi criada e está aguardando o paciente acessar.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200">
                Iniciado
              </span>
              <span className="mt-1">Paciente abriu a avaliação.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                Em progresso
              </span>
              <span className="mt-1">
                Paciente está preenchendo a avaliação.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                Finalizado
              </span>
              <span className="mt-1">
                Avaliação foi concluída e finalizada.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                Incompleto
              </span>
              <span className="mt-1">
                Avaliação foi encerrada mas não foi completamente preenchida.
                Necessita intervenção do clínico.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                Expirado
              </span>
              <span className="mt-1">
                Avaliação expirou e não pode mais ser acessada.
              </span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
