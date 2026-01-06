'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';

interface TermsConsentModalProps {
  open: boolean;
  onAccept: () => void;
  onReject: () => void;
}

export function TermsConsentModal({
  open,
  onAccept,
  onReject,
}: TermsConsentModalProps) {
  const [accepted, setAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const getFormattedDate = () => {
    const date = new Date();
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'America/Sao_Paulo',
    };
    const formatter = new Intl.DateTimeFormat('pt-BR', options);
    const formattedDate = formatter.format(date);
    return `São Paulo, ${formattedDate}.`;
  };

  const handleAccept = () => {
    setIsLoading(true);
    onAccept();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => !isOpen && !isLoading && onReject()}
    >
      <DialogContent
        className="max-w-3xl max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => isLoading && e.preventDefault()}
        onEscapeKeyDown={(e) => isLoading && e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-xl text-center font-bold">
            Termo de Consentimento Livre e Esclarecido
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <div>
            <h3 className="font-bold text-center">
              PROTOCOLO DE VALIDAÇÃO TECNOLÓGICA E ACURÁCIA ALGORÍTMICA
            </h3>
          </div>

          <div className="space-y-2">
            <p>
              <strong>Identificação do Projeto:</strong> Validação da solução de
              Inteligência Artificial para Triagem Pré-Anestésica.
            </p>
            <p>
              <strong>Responsável Técnico:</strong> PEDRO HENRIQUE HITOSHI UEDA,
              inscrito no CREMESP sob nº 208246.
            </p>
            <p>
              <strong>Desenvolvedor da Tecnologia:</strong> ASATENAS SOLUÇÕES EM
              SOFTWARE MÉDICOS LTDA.
            </p>
          </div>

          <div>
            <p className="font-semibold">Prezado(a) Paciente,</p>
            <p>
              Você está sendo convidado(a) a participar de uma iniciativa de
              inovação tecnológica. Antes de decidir, leia atentamente as
              informações abaixo. Este documento visa garantir que a sua
              participação ocorra de forma consciente, segura e transparente.
            </p>
          </div>

          <div>
            <h4 className="font-bold">
              1. DO OBJETO E NATUREZA DO TESTE (SHADOW TESTING)
            </h4>
            <p>
              1.1 A presente iniciativa visa validar a acurácia de um software
              de Inteligência Artificial (IA) desenvolvido para auxiliar na
              organização de dados em entrevistas pré-anestésicas, sendo que a
              tecnologia utilizada não decidirá, não influenciará e não alterará
              qualquer conduta, diagnóstico ou plano anestésico definido pelo
              seu médico.
            </p>
          </div>

          <div>
            <h4 className="font-bold">
              2. DA SOBERANIA MÉDICA E SEGURANÇA DO PACIENTE
            </h4>
            <p>
              2.1 Para garantir a sua total segurança clínica, declaramos que o
              seu médico realizará a consulta e a avaliação de risco de forma
              independente, utilizando exclusivamente os protocolos clínicos,
              sendo que, os resultados gerados pela IA destinam-se apenas à
              comparação estatística e não serão utilizados para fundamentar o
              seu procedimento cirúrgico atual.
            </p>
          </div>

          <div>
            <h4 className="font-bold">
              3. DA PRIVACIDADE E PROTEÇÃO DE DADOS (LGPD)
            </h4>
            <p>
              3.1 O tratamento das informações geradas obedece rigorosamente à
              Lei Geral de Proteção de Dados (Lei nº 13.709/18):
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Anonimização na Origem:</strong> O fluxo tecnológico foi
                estruturado sob o conceito de &ldquo;Anonymization by
                Design&rdquo;. Isso garante que nenhum dado capaz de
                identificá-lo(a) (como nome ou CPF) seja enviado ou armazenado
                pela equipa técnica da Asatenas.
              </li>
              <li>
                <strong>Custódia de Dados:</strong> O seu médico é o único
                detentor do acesso à sua identidade civil. A Asatenas processará
                apenas dados matemáticos e estatísticos anonimizados para fins
                de aprimoramento do algoritmo.
              </li>
              <li>
                <strong>Vedação de Reidentificação:</strong> A empresa
                compromete-se a não realizar qualquer esforço técnico para
                tentar identificar os participantes do teste.
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold">
              4. VOLUNTARIEDADE E DIREITOS DO PARTICIPANTE
            </h4>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Liberdade de Escolha:</strong> A sua participação é
                voluntária e não acarreta qualquer custo adicional ou pagamento
                de compensação financeira.
              </li>
              <li>
                <strong>Direito de Revogação:</strong> Você pode retirar o seu
                consentimento a qualquer momento, sem necessidade de
                justificativa e sem que isso afete a qualidade do atendimento
                médico prestado.
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold">5. DECLARAÇÃO DE CONSENTIMENTO</h4>
            <p>
              Eu, abaixo assinado, declaro que li este documento, compreendi a
              natureza experimental da validação da ferramenta de IA e concordo
              que os meus dados clínicos sejam processados de forma anonimizada
              para fins de pesquisa e desenvolvimento da tecnologia da Asatenas.
            </p>
          </div>

          <div className="text-center">
            <p>{getFormattedDate()}</p>
          </div>

          <div className="flex items-center space-x-2 pt-4 border-t">
            <Checkbox
              id="terms-consent"
              checked={accepted}
              onCheckedChange={(checked) => setAccepted(checked === true)}
              disabled={isLoading}
            />
            <label
              htmlFor="terms-consent"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Li e aceito os termos do Consentimento Livre e Esclarecido
            </label>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onReject}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            Rejeitar
          </Button>
          <Button
            type="button"
            onClick={handleAccept}
            disabled={!accepted || isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              'Aceitar'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
