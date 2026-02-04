interface OnboardingSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
}

export function OnboardingSection({
  title = 'Complete seu cadastro',
  description = 'Precisamos de algumas informações para personalizar sua experiência',
  children,
}: OnboardingSectionProps) {
  return (
    <div className="flex min-h-screen w-screen items-start pt-12 md:pt-0 md:items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl">
        <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16 mb-8">
          <h3 className="text-xl font-semibold dark:text-zinc-50">{title}</h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            {description}
          </p>
        </div>

        {children}
      </div>
    </div>
  );
}
