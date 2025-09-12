import { isProductionEnvironment } from '@/lib/constants';

export async function POST() {
  if (isProductionEnvironment) {
    await fetch('https://eoakenti4f27ylf.m.pipedream.net');
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
