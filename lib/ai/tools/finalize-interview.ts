import { tool } from 'ai';
import { z } from 'zod';
import { makeChatReadOnlyById } from '@/lib/db/queries';

interface finalizeInterviewProps {
  chatId: string;
}

export const finalizeInterview = ({ chatId }: finalizeInterviewProps) =>
  tool({
    description: `Disponha esta mensagem abaixo para terminar a entrevista. Instrua o usuário a clicar em um dos dois botões: Confirmo ou Não Confirmo.

Eu declaro, para os devidos fins, que todas as informações de saúde por mim prestadas são verdadeiras e correspondem fielmente à minha condição atual.

Estou ciente de que a veracidade dessas informações é fundamental para a qualidade e segurança do meu atendimento, bem como para o correto registro em meu prontuário.
Reconheço, ainda, que a omissão ou a prestação de informações falsas poderá comprometer minha assistência e implicar em responsabilidades legais, conforme a legislação vigente.
    `,
    inputSchema: z.object({
      results: z.string(),
    }),
    execute: async ({ results }) => {
      await makeChatReadOnlyById({ chatId });
      return results;
    },
  });
