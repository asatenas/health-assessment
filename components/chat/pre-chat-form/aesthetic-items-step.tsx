import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';
import type { StepProps } from './types';

export function AestheticItemsStep({
  formData,
  setFormData,
  formConfig,
}: StepProps) {
  const aestheticItemsConfig = formConfig.sections.aestheticItems.fields;
  const aestheticItemsOptions = [
    { key: 'megaHair', label: 'Mega-Hair' },
    { key: 'apliques', label: 'Apliques sintéticos no cabelo' },
    { key: 'unhaGel', label: 'Unha de gel' },
    { key: 'ciliosPosticos', label: 'Cílios postiços' },
    { key: 'piercings', label: 'Piercings' },
    { key: 'lenteContato', label: 'Lente de contato' },
  ].filter(
    ({ key }) =>
      aestheticItemsConfig[key as keyof typeof aestheticItemsConfig]?.enabled,
  );

  const aestheticItemsLabels = {
    megaHair: 'Mega-Hair',
    apliques: 'Apliques sintéticos no cabelo',
    unhaGel: 'Unha de gel',
    ciliosPosticos: 'Cílios postiços',
    piercings: 'Piercings',
    lenteContato: 'Lente de contato',
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-600">
        Selecione todos os itens abaixo que você utiliza no dia a dia. Caso não
        utilize nenhum, deixe os campos em branco.
      </p>
      {aestheticItemsOptions.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between font-normal"
              type="button"
            >
              <span
                className={`text-sm truncate ${
                  Object.entries(formData.itensUso)
                    .filter(
                      ([key]) =>
                        aestheticItemsConfig[
                          key as keyof typeof aestheticItemsConfig
                        ]?.enabled,
                    )
                    .some(([, value]) => value)
                    ? ''
                    : 'text-gray-500'
                }`}
              >
                {(() => {
                  const selected = Object.entries(formData.itensUso)
                    .filter(
                      ([key]) =>
                        aestheticItemsConfig[
                          key as keyof typeof aestheticItemsConfig
                        ]?.enabled,
                    )
                    .filter(([, value]) => value)
                    .map(
                      ([key]) =>
                        aestheticItemsLabels[
                          key as keyof typeof aestheticItemsLabels
                        ],
                    );
                  if (selected.length === 0) {
                    return 'Selecione os itens aqui...';
                  } else if (selected.length === 1) {
                    return `${selected.length} item selecionado`;
                  } else {
                    return `${selected.length} itens selecionados`;
                  }
                })()}
              </span>
              <ChevronDown className="size-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
            {aestheticItemsOptions.map(({ key, label }) => (
              <DropdownMenuCheckboxItem
                key={key}
                checked={
                  formData.itensUso[key as keyof typeof formData.itensUso]
                }
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    itensUso: {
                      ...formData.itensUso,
                      [key]: checked,
                    },
                  })
                }
                onSelect={(e) => e.preventDefault()}
              >
                {label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      {aestheticItemsConfig.itensUsoOutros?.enabled && (
        <div>
          <Label htmlFor="itens-uso-outros" className="text-sm">
            Outros itens estéticos
          </Label>
          <Input
            id="itens-uso-outros"
            type="text"
            className="text-sm"
            value={formData.itensUsoOutros}
            onChange={(e) =>
              setFormData({
                ...formData,
                itensUsoOutros: e.target.value,
              })
            }
            placeholder="Ex: extensões de cabelo, procedimentos estéticos..."
          />
        </div>
      )}
    </div>
  );
}
