'use client';

import { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, Info } from 'lucide-react';
import { toast } from '@/components/ui/toast';

export interface AccountTabRef {
  saveProfile: () => Promise<void>;
}

export const AccountTab = forwardRef<AccountTabRef>((props, ref) => {
  const { data: session, update } = useSession();

  // Profile fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [profilePhotoUrl, setProfilePhotoUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Initialize profile fields from session
  useEffect(() => {
    if (session?.user) {
      const nameParts = session.user.name?.split(' ') || [];
      setFirstName(nameParts[0] || '');
      setLastName(nameParts.slice(1).join(' ') || '');

      // Format phone number if it exists
      const phone = session.user.phoneNumber || '';
      if (phone) {
        let formatted = phone;
        if (phone.length === 10 || phone.length === 11) {
          const digits = phone.replace(/\D/g, '');
          if (digits.length === 11) {
            formatted = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
          } else if (digits.length === 10) {
            formatted = `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
          }
        }
        setPhoneNumber(formatted);
      }

      setProfilePhotoUrl(session.user.image || '');
    }
  }, [session]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');

    if (value.length <= 11) {
      if (value.length > 2) {
        value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
      }
      if (value.length > 10) {
        value = `${value.slice(0, 10)}-${value.slice(10)}`;
      } else if (value.length > 9) {
        value = `${value.slice(0, 9)}-${value.slice(9)}`;
      }
      setPhoneNumber(value);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        type: 'error',
        description: 'Por favor, selecione uma imagem válida.',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ type: 'error', description: 'A imagem deve ter no máximo 5MB.' });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      setProfilePhotoUrl(data.url);
      toast({ type: 'success', description: 'Foto enviada com sucesso!' });
    } catch (error) {
      toast({
        type: 'error',
        description: 'Erro ao enviar foto. Tente novamente.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const saveProfile = async () => {
    setProfileError(null);
    setProfileSuccess(false);

    // Client-side validation
    if (!firstName.trim() || !lastName.trim()) {
      setProfileError('Nome e sobrenome são obrigatórios');
      throw new Error('Nome e sobrenome são obrigatórios');
    }

    setProfileLoading(true);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phoneNumber: phoneNumber || undefined,
          profilePhotoUrl: profilePhotoUrl || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.cause || data.message || 'Falha ao atualizar perfil',
        );
      }

      setProfileSuccess(true);

      // Update session with new data
      await update({ trigger: 'update' });

      // Clear success message after 5 seconds
      setTimeout(() => {
        setProfileSuccess(false);
      }, 5000);
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Erro ao atualizar perfil';
      setProfileError(errorMessage);
      throw error;
    } finally {
      setProfileLoading(false);
    }
  };

  // Expose saveProfile method to parent via ref
  useImperativeHandle(ref, () => ({
    saveProfile,
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Client-side validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Todos os campos são obrigatórios');
      return;
    }

    if (newPassword.length < 6) {
      setError('Nova senha deve ter no mínimo 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('As novas senhas não coincidem');
      return;
    }

    if (currentPassword === newPassword) {
      setError('Nova senha deve ser diferente da senha atual');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/user/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.cause || data.message || 'Falha ao alterar senha');
      }

      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 5000);
    } catch (error) {
      console.error('Error changing password:', error);
      setError(
        error instanceof Error ? error.message : 'Erro ao alterar senha',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informações da Conta</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Dados da sua conta na plataforma
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={session?.user?.email || ''}
                disabled
                readOnly
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Seu endereço de email não pode ser alterado
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nome</Label>
                <Input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Digite seu nome"
                  disabled={profileLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Sobrenome</Label>
                <Input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Digite seu sobrenome"
                  disabled={profileLoading}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Celular</Label>
              <Input
                id="phoneNumber"
                type="text"
                value={phoneNumber}
                onChange={handlePhoneChange}
                placeholder="(00) 00000-0000"
                disabled={profileLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profilePhoto">Foto de perfil</Label>
              <div className="flex items-center gap-4">
                {profilePhotoUrl && (
                  <img
                    src={profilePhotoUrl}
                    alt="Profile"
                    className="size-16 rounded-full object-cover"
                  />
                )}
                <div className="flex-1">
                  <Input
                    id="profilePhoto"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    disabled={isUploading || profileLoading}
                    className="cursor-pointer"
                  />
                  {isUploading && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Enviando foto...
                    </p>
                  )}
                </div>
              </div>
            </div>

            {profileError && (
              <Alert variant="destructive">
                <Info className="size-4" />
                <AlertDescription>{profileError}</AlertDescription>
              </Alert>
            )}

            {profileSuccess && (
              <Alert>
                <CheckCircle className="size-4" />
                <AlertDescription>
                  Perfil atualizado com sucesso!
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Alterar Senha</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Atualize sua senha de acesso à plataforma
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Senha Atual</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Digite sua senha atual"
                disabled={loading}
                required
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">Nova Senha</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Digite sua nova senha (mínimo 6 caracteres)"
                disabled={loading}
                required
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Digite novamente sua nova senha"
                disabled={loading}
                required
                minLength={6}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <Info className="size-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <CheckCircle className="size-4" />
                <AlertDescription>Senha alterada com sucesso!</AlertDescription>
              </Alert>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
              {loading ? 'Alterando senha...' : 'Alterar Senha'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
});

AccountTab.displayName = 'AccountTab';
