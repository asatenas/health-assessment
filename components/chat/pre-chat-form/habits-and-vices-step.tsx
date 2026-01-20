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

export function HabitsAndVicesStep({
  formData,
  setFormData,
  formConfig,
}: StepProps) {
  const habitsAndVicesConfig = formConfig.sections.habitsAndVices.fields;
  const habitsAndVicesOptions = [
    { key: 'cocaina', label: 'Cocaína' },
    { key: 'maconha', label: 'Maconha' },
    { key: 'crack', label: 'Crack' },
    {
      key: 'opiaceos',
      label: 'Opiáceos (Fentanil, morfina, codeína...)',
    },
    { key: 'metanfetamina', label: 'Metanfetamina' },
  ].filter(
    ({ key }) =>
      habitsAndVicesConfig[key as keyof typeof habitsAndVicesConfig]?.enabled,
  );

  const habitsAndVicesLabels = {
    cocaina: 'Cocaína',
    maconha: 'Maconha',
    crack: 'Crack',
    opiaceos: 'Opiáceos (fentanil, morfina, codeína...)',
    metanfetamina: 'Metanfetamina',
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-600">
        Selecione todas os hábitos e vícios que se aplicam a você. Caso não
        tenha nenhum, deixe os campos em branco. Esta informação é confidencial
        e essencial para sua segurança durante a cirurgia.
      </p>
      {habitsAndVicesConfig.alcool?.enabled && (
        <>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="bebidas-alcoolicas"
              checked={formData.drogasRecreativas.alcool}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  drogasRecreativas: {
                    ...formData.drogasRecreativas,
                    alcool: e.target.checked,
                  },
                })
              }
              className="rounded border-gray-300"
            />
            <Label htmlFor="bebidas-alcoolicas" className="font-normal">
              Bebidas Alcoólicas
            </Label>
          </div>
          <p className="text-xs text-gray-600 ml-6">
            Consumo de bebidas alcoólicas (cerveja, vinho, destilados, etc.)
          </p>
        </>
      )}
      {habitsAndVicesConfig.tabaco?.enabled && (
        <>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="tabaco"
              checked={formData.drogasRecreativas.tabaco}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  drogasRecreativas: {
                    ...formData.drogasRecreativas,
                    tabaco: e.target.checked,
                  },
                })
              }
              className="rounded border-gray-300"
            />
            <Label htmlFor="tabaco" className="font-normal">
              Tabaco
            </Label>
          </div>
          <p className="text-xs text-gray-600 ml-6">
            Uso de produtos de tabaco (cigarro, charuto, cachimbo, etc.)
          </p>
        </>
      )}
      {habitsAndVicesOptions.length > 0 && (
        <div>
          <Label className="text-sm">Drogas Recreativas</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between font-normal mt-2"
                type="button"
              >
                <span
                  className={`text-sm truncate ${
                    Object.entries(formData.drogasRecreativas)
                      .filter(
                        ([key]) =>
                          key !== 'alcool' &&
                          key !== 'tabaco' &&
                          habitsAndVicesConfig[
                            key as keyof typeof habitsAndVicesConfig
                          ]?.enabled,
                      )
                      .some(([, value]) => value)
                      ? ''
                      : 'text-gray-500'
                  }`}
                >
                  {(() => {
                    const selected = Object.entries(formData.drogasRecreativas)
                      .filter(
                        ([key]) =>
                          key !== 'alcool' &&
                          key !== 'tabaco' &&
                          habitsAndVicesConfig[
                            key as keyof typeof habitsAndVicesConfig
                          ]?.enabled,
                      )
                      .filter(([, value]) => value)
                      .map(
                        ([key]) =>
                          habitsAndVicesLabels[
                            key as keyof typeof habitsAndVicesLabels
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
              {habitsAndVicesOptions.map(({ key, label }) => (
                <DropdownMenuCheckboxItem
                  key={key}
                  checked={
                    formData.drogasRecreativas[
                      key as keyof typeof formData.drogasRecreativas
                    ]
                  }
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      drogasRecreativas: {
                        ...formData.drogasRecreativas,
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
        </div>
      )}
      {habitsAndVicesConfig.drogasRecreativasOutros?.enabled && (
        <div>
          <Label htmlFor="drogas-recreativas-outros" className="text-sm">
            Outras drogas recreativas
          </Label>
          <Input
            id="drogas-recreativas-outros"
            type="text"
            className="text-sm"
            value={formData.drogasRecreativasOutros}
            onChange={(e) =>
              setFormData({
                ...formData,
                drogasRecreativasOutros: e.target.value,
              })
            }
            placeholder="Ex: LSD, ecstasy, outras substâncias..."
          />
        </div>
      )}
    </div>
  );
}
