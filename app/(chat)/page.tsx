import { auth } from '../(auth)/auth';
import { redirect } from 'next/navigation';

export default async function Page() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  // Redirect authenticated users to clinic dashboard
  redirect('/dashboard');
}
