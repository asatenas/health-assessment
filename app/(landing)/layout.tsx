import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Asatenas',
  description:
    'Gerencie todo o fluxo cirúrgico e recupere milhões de reais perdidos em cancelamentos através de inteligência artificial.',
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Albert+Sans:wght@400;500;600;700&family=DM+Sans:ital,wght@0,300;0,400;1,300;1,400&family=Figtree:ital,wght@0,300;0,400;0,500;1,300&family=Fraunces:ital,opsz,wght@0,9..144,300;1,9..144,300&family=JetBrains+Mono:wght@300;400&family=Libre+Baskerville:ital,wght@0,400;1,400&family=Newsreader:ital,opsz,wght@0,6..72,300;1,6..72,300&family=Lora:ital,wght@0,400;1,400&family=Spectral:ital,wght@0,300;1,300&family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;1,8..60,300&display=swap"
        rel="stylesheet"
      />
      {children}
    </>
  );
}
