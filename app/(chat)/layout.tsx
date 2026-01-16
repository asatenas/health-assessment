import { ChatHeader } from '@/components/chat/chat-header';
import { DataStreamProvider } from '@/components/providers/data-stream-provider';
import { TooltipProvider } from '@/components/ui/tooltip';

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="flex flex-col min-w-0 h-dvh bg-background">
        <DataStreamProvider>
          <TooltipProvider>
            <ChatHeader />
            {children}
          </TooltipProvider>
        </DataStreamProvider>
      </div>
    </>
  );
}
