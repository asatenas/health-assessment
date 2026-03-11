import { signOut } from 'next-auth/react';

export async function fetcher<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));

    // Handle removed-user edge case
    if (
      response.status === 401 &&
      typeof data?.cause === 'string' &&
      data.cause.toLowerCase().includes('removed users')
    ) {
      await signOut({ redirectTo: '/login' });
    }

    const error = new Error(data?.error || `Request failed: ${response.status}`);
    (error as any).status = response.status;
    (error as any).data = data;
    throw error;
  }

  return response.json();
}
