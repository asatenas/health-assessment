import { DataStreamProvider } from '@/components/providers/data-stream-provider';

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <DataStreamProvider>{children}</DataStreamProvider>
    </>
  );
}
