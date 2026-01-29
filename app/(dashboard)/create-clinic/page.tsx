'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Loader2,
  Info,
  Building2,
  UserX,
  Trash2,
  LogOut,
  Home,
} from 'lucide-react';
import { toast } from 'sonner';

export default function CreateClinicPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [clinicName, setClinicName] = useState('');
  const [loading, setLoading] = useState<
    'create' | 'accept' | 'return' | 'delete' | null
  >(null);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loadingInvitations, setLoadingInvitations] = useState(false);
  const [originalClinic, setOriginalClinic] = useState<any>(null);
  const [loadingOriginalClinic, setLoadingOriginalClinic] = useState(true);

  // Fetch pending invitations and original clinic
  useEffect(() => {
    if (session?.user?.email) {
      fetchInvitations();
      fetchOriginalClinic();
    }
  }, [session]);

  const fetchInvitations = async () => {
    setLoadingInvitations(true);
    try {
      const response = await fetch('/api/user/clinic-invitations');
      if (response.ok) {
        const data = await response.json();
        setInvitations(data.invitations || []);
      }
    } catch (error) {
      console.error('Error fetching invitations:', error);
    } finally {
      setLoadingInvitations(false);
    }
  };

  const fetchOriginalClinic = async () => {
    setLoadingOriginalClinic(true);
    try {
      const response = await fetch('/api/clinic/original');
      if (response.ok) {
        const data = await response.json();
        setOriginalClinic(data.clinic || null);
      }
    } catch (error) {
      console.error('Error fetching original clinic:', error);
    } finally {
      setLoadingOriginalClinic(false);
    }
  };

  // Check if user is removed
  const isRemoved = session?.user?.status === 'removed';

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="size-8 animate-spin" />
      </div>
    );
  }

  // Only removed users can access this page
  if (!isRemoved) {
    router.push('/dashboard');
    return null;
  }

  // Wait for all data to load before rendering
  if (loadingOriginalClinic || loadingInvitations) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="size-8 animate-spin" />
      </div>
    );
  }

  const handleCreateNewClinic = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!clinicName || clinicName.trim().length < 3) {
      toast.error('Nome da clínica deve ter no mínimo 3 caracteres');
      return;
    }

    setLoading('create');

    try {
      const response = await fetch('/api/clinic/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clinicName: clinicName.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao criar clínica');
      }

      toast.success('Clínica criada! Aguarde aprovação do suporte.');

      await handleLogout();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar clínica');
      setLoading(null);
    }
  };

  const handleAcceptInvitation = async (invitationId: string) => {
    setLoading('accept');
    try {
      const response = await fetch(
        `/api/user/clinic-invitations/${invitationId}/accept`,
        {
          method: 'POST',
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao aceitar convite');
      }

      toast.success('Convite aceito! Você será redirecionado...');

      await signOut({ redirectTo: '/login' });
    } catch (error: any) {
      toast.error(error.message || 'Erro ao aceitar convite');
      setLoading(null);
    }
  };

  const handleReturnToOriginalClinic = async () => {
    setLoading('return');
    try {
      const response = await fetch('/api/clinic/return-to-original', {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(
          data.message || 'Erro ao retornar para clínica original',
        );
      }

      toast.success('Retornando para sua clínica original...');

      await signOut({ redirectTo: '/login' });
    } catch (error: any) {
      toast.error(error.message || 'Erro ao retornar para clínica original');
      setLoading(null);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmMessage = originalClinic
      ? 'Tem certeza que deseja deletar sua conta e sua clínica original permanentemente? Esta ação não pode ser desfeita.'
      : 'Tem certeza que deseja deletar sua conta permanentemente? Esta ação não pode ser desfeita.';

    if (!confirm(confirmMessage)) {
      return;
    }

    setLoading('delete');
    try {
      const response = await fetch('/api/user/delete', {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Erro ao deletar conta');
      }

      toast.success('Conta deletada com sucesso');

      await handleLogout();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao deletar conta');
      setLoading(null);
    }
  };

  const handleLogout = async () => {
    await signOut({ redirectTo: '/login' });
  };

  // Render for removed users
  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="w-full max-w-2xl space-y-6">
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut className="size-4" />
            Sair
          </Button>
        </div>
        <Card className="border-orange-200">
          <CardHeader>
            <div className="flex items-center gap-3">
              <UserX className="size-8 text-orange-600" />
              <div>
                <CardTitle>Você foi removido da clínica</CardTitle>
                <CardDescription>
                  Você não tem mais acesso aos recursos dessa clínica
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Return to original clinic */}
            {originalClinic ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Home className="size-5" />
                  Retornar para sua clínica original
                </h3>
                <Alert>
                  <Info className="size-4" />
                  <AlertDescription>
                    <p className="mb-2">
                      Encontramos sua clínica original:{' '}
                      <strong>{originalClinic.clinicName}</strong>
                    </p>
                    <p className="text-sm font-medium">
                      Você será desconectado e precisará fazer login novamente
                      para acessar sua clínica.
                    </p>
                  </AlertDescription>
                </Alert>
                <Button
                  onClick={handleReturnToOriginalClinic}
                  disabled={loading !== null}
                  className="w-full"
                >
                  {loading === 'return' ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Retornando...
                    </>
                  ) : (
                    'Retornar para minha clínica'
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Building2 className="size-5" />
                  Criar nova clínica
                </h3>
                <form onSubmit={handleCreateNewClinic} className="space-y-4">
                  <div>
                    <Label htmlFor="clinicName">Nome da clínica</Label>
                    <Input
                      id="clinicName"
                      type="text"
                      value={clinicName}
                      onChange={(e) => setClinicName(e.target.value)}
                      placeholder="Digite o nome da sua clínica"
                      disabled={loading !== null}
                      minLength={3}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading !== null}
                    className="w-full"
                  >
                    {loading === 'create' ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Criando...
                      </>
                    ) : (
                      'Criar clínica'
                    )}
                  </Button>
                </form>
                <Alert>
                  <Info className="size-4" />
                  <AlertDescription>
                    <p className="font-medium mb-1">Importante:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>
                        Você será desconectado e precisará fazer login novamente
                      </li>
                      <li>
                        Sua clínica precisará ser aprovada pelo suporte antes
                        que você possa utilizá-la
                      </li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* Accept invitations */}
            {invitations.length > 0 && (
              <div className="space-y-4 pt-6 border-t">
                <h3 className="text-lg font-semibold">Convites pendentes</h3>
                <div className="space-y-2">
                  {invitations.map((invitation) => (
                    <Card key={invitation.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{invitation.clinicName}</p>
                          <p className="text-sm text-gray-500">
                            Cargo: {invitation.role}
                          </p>
                        </div>
                        <Button
                          onClick={() => handleAcceptInvitation(invitation.id)}
                          disabled={loading !== null}
                          size="sm"
                        >
                          {loading === 'accept' ? (
                            <>
                              <Loader2 className="mr-2 size-4 animate-spin" />
                              Aceitando...
                            </>
                          ) : (
                            'Aceitar'
                          )}
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Delete account */}
            <div className="space-y-4 pt-6 border-t">
              <h3 className="text-lg font-semibold text-red-600 flex items-center gap-2">
                <Trash2 className="size-5" />
                Deletar minha conta
              </h3>
              <p className="text-sm text-gray-600">
                {originalClinic
                  ? 'Se você não deseja mais usar o sistema, pode deletar sua conta e sua clínica original permanentemente.'
                  : 'Se você não deseja mais usar o sistema, pode deletar sua conta permanentemente.'}
              </p>
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={loading !== null}
                className="w-full"
              >
                {loading === 'delete' ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Deletando...
                  </>
                ) : originalClinic ? (
                  'Deletar conta e clínica permanentemente'
                ) : (
                  'Deletar conta permanentemente'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
