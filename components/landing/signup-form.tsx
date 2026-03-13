'use client';

import { useState } from 'react';
import { toast } from 'sonner';

type SignupFormVariant = 'golden-hour' | 'dusk-protocol' | 'clinical-white';

interface SignupFormProps {
  variant: SignupFormVariant;
}

const styles: Record<
  SignupFormVariant,
  {
    form: string;
    inputWrapper: string;
    input: string;
    button: string;
    buttonStyle?: React.CSSProperties;
    hint?: string;
  }
> = {
  'golden-hour': {
    form: 'flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full max-w-[400px]',
    inputWrapper: 'relative flex-1 group',
    input:
      'w-full bg-transparent border border-[#1a1d24]/10 rounded-[6px] px-4 py-3 text-sm font-[\'DM_Sans\'] text-[#1a1d24] placeholder:text-[#1a1d24]/30 focus:outline-none focus:border-[#b87333]/40 focus:ring-1 focus:ring-[#b87333]/40 transition-all',
    button:
      'flex-shrink-0 bg-[#1a1d24] text-[#f5f4f0] text-xs font-semibold uppercase tracking-wider font-[\'Albert_Sans\'] px-6 py-3.5 rounded-[6px] transition-all hover:-translate-y-px disabled:opacity-50',
    buttonStyle: {
      transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      transitionDuration: '0.25s',
    },
    hint: 'font-[\'JetBrains_Mono\'] text-[10px] uppercase text-[#1a1d24]/30 mt-4 tracking-wider',
  },
  'dusk-protocol': {
    form: 'flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full max-w-[460px]',
    inputWrapper: 'relative flex-1 group',
    input:
      'w-full bg-[rgba(240,236,228,0.03)] border border-[rgba(240,236,228,0.1)] rounded-[8px] px-5 py-4 text-sm font-[\'DM_Sans\'] text-[#F0ECE4] placeholder:text-[#6A6080] focus:outline-none focus:border-[#D4906A] focus:bg-[rgba(212,144,106,0.02)] transition-all',
    button:
      'flex-shrink-0 bg-[linear-gradient(135deg,rgba(212,144,106,1)_0%,rgba(170,105,71,1)_100%)] text-[#181622] text-[11px] font-semibold uppercase tracking-wider font-[\'Albert_Sans\'] px-7 py-4 rounded-[8px] transition-all hover:-translate-y-[2px] disabled:opacity-50',
    buttonStyle: {
      boxShadow: '0 4px 24px rgba(212,144,106,0.3)',
      transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      transitionDuration: '0.25s',
    },
  },
  'clinical-white': {
    form: 'flex flex-col sm:flex-row items-stretch gap-4 sm:gap-0 w-full max-w-[480px]',
    inputWrapper: '',
    input:
      'flex-1 bg-white border border-[#0A1628]/[0.12] px-5 py-4 text-sm font-[\'Figtree\'] text-[#0A1628] placeholder:text-[#0A1628]/30 focus:outline-none focus:border-[#0A1628]/50 transition-colors rounded-none',
    button:
      'bg-[#0A1628] text-white text-[11px] font-medium uppercase tracking-[0.1em] font-[\'JetBrains_Mono\'] px-8 py-4 transition-colors hover:bg-[#0A1628]/80 rounded-none border border-[#0A1628] disabled:opacity-50',
  },
};

export function SignupForm({ variant }: SignupFormProps) {
  const [loading, setLoading] = useState(false);
  const s = styles[variant];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const input = e.currentTarget.elements.namedItem(
      'email',
    ) as HTMLInputElement;
    const email = input.value.trim();
    if (!email) return;

    setLoading(true);
    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data?.message ?? 'Algo deu errado. Tente novamente.');
        return;
      }

      input.value = '';
      toast.success('Obrigado! Entraremos em contato em breve.');
    } catch {
      toast.error('Sem conexão. Verifique sua internet e tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className={s.form} onSubmit={handleSubmit}>
      {s.inputWrapper ? (
        <div className={s.inputWrapper}>
          <input
            type="email"
            name="email"
            placeholder={
              variant === 'clinical-white'
                ? 'Seu e-mail profissional'
                : variant === 'dusk-protocol'
                  ? 'E-mail profissional'
                  : 'E-mail institucional'
            }
            required
            className={s.input}
          />
        </div>
      ) : (
        <input
          type="email"
          name="email"
          placeholder="Seu e-mail profissional"
          required
          className={s.input}
        />
      )}
      <button
        type="submit"
        disabled={loading}
        className={s.button}
        style={s.buttonStyle}
      >
        {loading ? 'Aguarde...' : 'Acesso Antecipado'}
      </button>
    </form>
  );
}
