'use client';

import { memo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

function PureChatHeader() {
  const [isComoUsarOpen, setIsComoUsarOpen] = useState(false);
  const [isQuemSomosOpen, setIsQuemSomosOpen] = useState(false);

  return (
    <>
      <header className="flex sticky top-0 bg-transparent pt-3 pb-2 md:pt-4 items-center px-4 md:px-6 justify-between">
        <div className="flex items-center">
          <h1
            className="text-xl md:text-2xl font-bold text-primary tracking-wide select-none cursor-default"
            style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
            onDragStart={(e) => e.preventDefault()}
          >
            asatenas
          </h1>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <Button
            variant="ghost"
            className="text-foreground hover:text-foreground/80 hover:bg-transparent text-sm px-2 md:px-4"
            onClick={() => setIsComoUsarOpen(true)}
          >
            Como Usar
          </Button>
          <Button
            variant="ghost"
            className="text-foreground hover:text-foreground/80 hover:bg-transparent text-sm px-2 md:px-4"
            onClick={() => setIsQuemSomosOpen(true)}
          >
            Quem Somos
          </Button>
        </div>
      </header>

      <Dialog open={isComoUsarOpen} onOpenChange={setIsComoUsarOpen}>
        <DialogContent
          className="max-w-xl w-[95vw] max-h-[80vh] overflow-y-auto rounded-2xl [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          aria-describedby={undefined}
        >
          <DialogHeader>
            <DialogTitle className="sr-only">Como Usar</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 text-foreground/90 text-left">
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground text-base">
                Como Usar
              </h4>
              <p>
                Bem-vindo à plataforma de avaliação pré-operatória da Asatenas
                Health.
              </p>
              <p>
                Esta é uma interface de conversa baseada em chat, onde nosso
                assistente virtual treinado fará perguntas sobre suas
                informações de saúde e condições médicas. Use a caixa de entrada
                de texto na parte inferior para digitar e enviar suas respostas
                conforme o assistente solicitar.
              </p>
              <p>
                O assistente fará perguntas de acompanhamento para garantir que
                as informações estejam claras. Após coletar todas as informações
                necessárias, os médicos serão notificados e revisarão os dados
                fornecidos, entrando em contato caso precisem de esclarecimentos
                adicionais. As informações coletadas serão utilizadas para
                preparar adequadamente sua cirurgia, garantindo sua segurança.
              </p>
            </div>

            <div className="space-y-3 pt-4 border-t">
              <h4 className="font-semibold text-foreground text-base">
                Como garantimos sua segurança
              </h4>
              <p>
                Os médicos sempre analisarão previamente as informações
                fornecidas para compreender suas condições de saúde e tratá-las
                adequadamente. Esta análise permite que a equipe médica faça os
                preparativos necessários para a cirurgia, considerando alergias,
                dispositivos externos e internos, e outras particularidades do
                seu caso.
              </p>
              <p>
                Caso seja necessário, a equipe médica irá solicitar que faça
                consultas médicas adicionais ou exames complementares.
              </p>
              <p>
                Suas condições serão sempre verificadas novamente antes da
                realização da cirurgia, proporcionando tranquilidade e segurança
                durante todo o processo.
              </p>
            </div>

            <div className="space-y-3 pt-4 border-t">
              <h4 className="font-semibold text-foreground text-base">
                Como garantimos sua privacidade
              </h4>
              <p>
                Seus dados são tão importantes quanto sua segurança de saúde.
                Todas as informações são protegidas com criptografia de ponta a
                ponta, tanto durante a transmissão quanto em repouso. Seus dados
                são anonimizados, ou seja, não há identificação pessoal
                vinculada às conversas.
              </p>
              <p>
                <strong>
                  Recomendamos não enviar informações de identificação
                </strong>{' '}
                como nome completo, número de documentos, e-mail ou dados
                pessoais similares.
              </p>
              <p>
                Não compartilhamos ou vendemos seus dados com terceiros. Não
                utilizamos suas informações para treinamento de modelos. Seus
                dados são revisados exclusivamente pela equipe médica
                responsável pela preparação da sua cirurgia e/ou pelo
                responsável técnico da Asatenas.
              </p>
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <Button onClick={() => setIsComoUsarOpen(false)}>Entendi</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isQuemSomosOpen} onOpenChange={setIsQuemSomosOpen}>
        <DialogContent
          className="max-w-xl w-[95vw] max-h-[80vh] overflow-y-auto rounded-2xl [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          aria-describedby={undefined}
        >
          <DialogHeader>
            <DialogTitle className="sr-only">Quem Somos</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 text-foreground/90 text-left">
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground text-base">
                Quem Somos
              </h4>
              <p>
                Olá! É um imenso privilégio apresentar a equipe fundadora da
                Asatenas.
              </p>
              <p>
                Com grande responsabilidade e determinação embarcamos na missão
                de trazer melhorias concretas para a área da saúde, unindo
                eficiência, segurança, privacidade e humanidade no cuidado ao
                paciente. Sabemos de perto o quanto o sistema de saúde é
                desafiador e as pressões que todos os seus profissionais e
                usuários enfrentam.
              </p>
              <p>
                Nosso propósito é integrar tecnologia de forma humanizada,
                beneficiando cada ponto do ecossistema de saúde, mantendo o
                paciente sempre no centro. Acreditamos que todos merecem acesso
                a um cuidado de qualidade, e vamos passo a passo, no caminho em
                direção a esta realidade.
              </p>
              <p>
                Compreendemos a sensibilidade de cada situação médica e
                desejamos que, neste momento de todo o processo pelo qual você
                passa, sua experiência pré-operatória seja a mais tranquila
                possível. Agradecemos pela confiança depositada em nós e
                esperamos que, mesmo neste momento desafiador, você siga forte e
                corajosamente.
              </p>
              <p className="italic">
                Com carinho,
                <br />
                Asatenas
              </p>
            </div>

            <div className="space-y-6 pt-4 border-t">
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground text-base">
                  Dr. Pedro Henrique Hitoshi Ueda
                </h4>
                <p className="text-sm">
                  Médico anestesiologista formado pela Universidade Estadual de
                  Campinas. Vivenciou de perto as oportunidades de aprimoramento
                  no processo de preparação pré-operatória e decidiu pausar sua
                  carreira como médico para se dedicar a desenvolver soluções
                  aos pacientes dentro da área de saúde.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-foreground text-base">
                  Andrew Jye Shih Chuang
                </h4>
                <p className="text-sm">
                  Formado em Ciência da Computação pela Universidade Estadual de
                  Campinas. Em sua carreira como desenvolvedor, atuou em
                  diversas aplicações de sistemas de software. Ao se deparar com
                  os desafios do sistema de saúde brasileiro, decidiu migrar
                  para esse ecossistema e aplicar sua experiência técnica nesta
                  área.
                </p>
              </div>
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <Button onClick={() => setIsQuemSomosOpen(false)}>Fechar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export const ChatHeader = memo(PureChatHeader);
