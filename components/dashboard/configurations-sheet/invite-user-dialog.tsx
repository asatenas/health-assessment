'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Copy, CheckCircle, Info } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface InviteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  existingEmails: string[];
}

const ROLE_LABELS: Record<string, string> = {
  owner: 'Proprietário',
  admin: 'Admin',
  clinician: 'Clínico',
  secretary: 'Secretária',
};

const ROLE_DESCRIPTIONS: Record<string, string> = {
  owner:
    'Acesso completo ao sistema. Pode gerenciar todos os usuários, incluindo outros proprietários, e configurar a clínica.',
  admin:
    'Pode gerenciar usuários (exceto proprietários), criar e visualizar avaliações completas, e acessar todas as métricas do dashboard.',
  clinician:
    'Pode criar e visualizar avaliações completas de pacientes e registrar detalhes de cirurgias.',
  secretary:
    'Pode criar novas avaliações e visualizar lista resumida de avaliações (sem acesso a detalhes clínicos completos).',
};

export function InviteUserDialog({
  open,
  onOpenChange,
  onSuccess,
  existingEmails,
}: InviteUserDialogProps) {
  const { data: session } = useSession();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invitationResult, setInvitationResult] = useState<{
    type: 'new_user' | 'clinic_switch';
    temporaryPassword?: string;
    invitationUrl?: string;
    message?: string;
  } | null>(null);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [invitationCreated, setInvitationCreated] = useState(false);
  const [emailAlreadyExists, setEmailAlreadyExists] = useState(false);

  const isAdmin = session?.user?.role === 'admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate email doesn't already exist
    if (emailAlreadyExists) {
      setError('Este email já está associado a um membro ou convite pendente');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/clinic/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to invite user');
      }

      setInvitationResult(data);
      setInvitationCreated(true);
    } catch (error) {
      console.error('Error inviting user:', error);
      setError(
        error instanceof Error ? error.message : 'Erro ao convidar usuário',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // If invitation was created, trigger refresh before closing
    if (invitationCreated) {
      onSuccess();
    }

    // Reset all state
    setEmail('');
    setRole('');
    setError(null);
    setInvitationResult(null);
    setInvitationCreated(false);
    setCopiedPassword(false);
    setCopiedUrl(false);
    setEmailAlreadyExists(false);
    onOpenChange(false);
  };

  const handleCopyPassword = () => {
    if (invitationResult?.temporaryPassword) {
      navigator.clipboard.writeText(invitationResult.temporaryPassword);
      setCopiedPassword(true);
      setTimeout(() => setCopiedPassword(false), 2000);
    }
  };

  const handleCopyUrl = () => {
    if (invitationResult?.invitationUrl) {
      navigator.clipboard.writeText(invitationResult.invitationUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen) {
          handleClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {invitationResult ? 'Convite Enviado' : 'Convidar Usuário'}
          </DialogTitle>
          <DialogDescription>
            {invitationResult
              ? invitationResult.type === 'new_user'
                ? 'Compartilhe as credenciais abaixo com o novo usuário'
                : 'O usuário verá o convite ao fazer login'
              : 'Adicione um novo membro à sua clínica'}
          </DialogDescription>
        </DialogHeader>

        {invitationResult ? (
          // Success view
          <div className="space-y-4">
            {invitationResult.type === 'new_user' ? (
              <>
                <Alert>
                  <Info className="size-4" />
                  <AlertDescription>
                    Compartilhe estas informações de forma segura com o novo
                    usuário. A senha temporária deve ser alterada no primeiro
                    login.
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <div className="flex items-center gap-2">
                      <Input value={email} readOnly className="flex-1" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Senha Temporária</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={invitationResult.temporaryPassword}
                        readOnly
                        type="text"
                        className="flex-1 font-mono"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleCopyPassword}
                      >
                        {copiedPassword ? (
                          <CheckCircle className="size-4 text-green-600" />
                        ) : (
                          <Copy className="size-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Link de Acesso</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={invitationResult.invitationUrl}
                        readOnly
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleCopyUrl}
                      >
                        {copiedUrl ? (
                          <CheckCircle className="size-4 text-green-600" />
                        ) : (
                          <Copy className="size-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button onClick={handleClose}>Fechar</Button>
                </DialogFooter>
              </>
            ) : (
              // Clinic switch message
              <>
                <Alert>
                  <CheckCircle className="size-4" />
                  <AlertDescription>
                    {invitationResult.message}
                  </AlertDescription>
                </Alert>
                <p className="text-sm text-muted-foreground">
                  Quando o usuário fizer login na clínica atual, verá uma opção
                  para aceitar o convite e mudar para esta clínica.
                </p>
              </>
            )}
          </div>
        ) : (
          // Invitation form
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    const newEmail = e.target.value;
                    setEmail(newEmail);
                    setError(null);

                    // Check if email already exists (case-insensitive)
                    const isDuplicate =
                      newEmail.trim() !== '' &&
                      existingEmails.some(
                        (existingEmail) =>
                          existingEmail.toLowerCase() ===
                          newEmail.trim().toLowerCase(),
                      );
                    setEmailAlreadyExists(isDuplicate);
                  }}
                  placeholder="usuario@exemplo.com"
                  required
                  disabled={loading}
                  className={emailAlreadyExists ? 'border-destructive' : ''}
                />
                {emailAlreadyExists && (
                  <p className="text-xs text-destructive">
                    Este email já está associado a um membro ou convite pendente
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Perfil *</Label>
                <Select value={role} onValueChange={setRole} disabled={loading}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Selecione um perfil" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">{ROLE_LABELS.admin}</SelectItem>
                    <SelectItem value="clinician">
                      {ROLE_LABELS.clinician}
                    </SelectItem>
                    <SelectItem value="secretary">
                      {ROLE_LABELS.secretary}
                    </SelectItem>
                  </SelectContent>
                </Select>
                {role && (
                  <p className="text-xs text-muted-foreground">
                    {ROLE_DESCRIPTIONS[role]}
                  </p>
                )}
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading || !email || !role || emailAlreadyExists}
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-2" />
                    Enviando...
                  </>
                ) : (
                  'Enviar Convite'
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
