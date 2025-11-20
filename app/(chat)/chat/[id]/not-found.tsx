export default function NotFound() {
  return (
    <div className="flex h-dvh w-screen items-center justify-center bg-background">
      <div className="w-full max-w-md overflow-hidden rounded-2xl flex flex-col gap-8 px-4 sm:px-16">
        <div className="flex flex-col items-center justify-center gap-6 text-center">
          <div className="relative">
            <h1 className="text-9xl font-bold text-primary/20 select-none">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="size-32 rounded-full bg-primary/10 animate-pulse" />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-semibold text-foreground">
              Chat não encontrado
            </h2>
            <p className="text-sm text-muted-foreground max-w-sm">
              Desculpe, não conseguimos encontrar a conversa que você está
              procurando.
            </p>
            <p className="text-sm text-muted-foreground max-w-sm">
              Verifique se o link está correto.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
