'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '../ui/toast';

interface NPSEvaluationProps {
  chatId: string;
}

export function NPSEvaluation({ chatId }: NPSEvaluationProps) {
  const [selectedScore, setSelectedScore] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (selectedScore === null) {
      toast({
        type: 'error',
        description: 'Por favor, selecione uma pontuação',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/nps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId,
          score: selectedScore,
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao salvar a avaliação');
      }

      setIsSubmitted(true);
      toast({
        type: 'success',
        description: 'Avaliação enviada com sucesso',
      });
    } catch (error) {
      toast({
        type: 'error',
        description: 'Erro ao salvar a avaliação. Tente novamente.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="w-full flex justify-center">
        <div className="flex flex-col gap-4 p-6 rounded-lg">
          <p className="text-sm font-medium text-muted-foreground text-center">
            Agradecemos a sua avaliação!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center">
      <div className="flex flex-col gap-4 p-6 bg-muted/50 rounded-lg">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-center">
            Em uma escala de 0 a 10, o quanto você recomendaria a Asatenas a um
            amigo ou familiar?
          </p>
          <div className="flex justify-center gap-2 flex-wrap">
            {Array.from({ length: 11 }, (_, i) => i).map((score) => (
              <button
                type="button"
                key={score}
                onClick={() => setSelectedScore(score)}
                className={`
                size-10 rounded-md border-2 font-medium transition-all
                ${
                  selectedScore === score
                    ? 'bg-primary text-primary-foreground border-primary scale-110'
                    : 'bg-background hover:bg-muted border-border'
                }
              `}
                disabled={isSubmitting}
              >
                {score}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground px-1">
            <span>Não recomendaria</span>
            <span>Recomendaria muito</span>
          </div>
        </div>
        <Button
          onClick={handleSubmit}
          disabled={selectedScore === null || isSubmitting}
          className="w-full"
        >
          {isSubmitting ? 'Enviando...' : 'Enviar avaliação'}
        </Button>
      </div>
    </div>
  );
}
