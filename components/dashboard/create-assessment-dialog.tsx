'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useClinicLocations } from '@/hooks/swr/use-clinic-locations';

interface CreateAssessmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: {
    surgeryName?: string;
    surgeryDate?: string;
    surgeryTime?: string;
    locationId?: string;
  }) => Promise<void>;
  isCreating: boolean;
}

export function CreateAssessmentDialog({
  open,
  onOpenChange,
  onConfirm,
  isCreating,
}: CreateAssessmentDialogProps) {
  const { locations } = useClinicLocations();
  const enabledLocations = locations.filter((l) => l.enabled);

  const [surgeryName, setSurgeryName] = useState('');
  const [surgeryDate, setSurgeryDate] = useState('');
  const [surgeryTime, setSurgeryTime] = useState('');
  const [locationId, setLocationId] = useState('');

  const reset = () => {
    setSurgeryName('');
    setSurgeryDate('');
    setSurgeryTime('');
    setLocationId('');
  };

  const handleConfirm = async () => {
    await onConfirm({
      surgeryName: surgeryName.trim() || undefined,
      surgeryDate: surgeryDate || undefined,
      surgeryTime: surgeryTime || undefined,
      locationId: locationId || undefined,
    });
    reset();
  };

  const handleOpenChange = (value: boolean) => {
    if (!value) reset();
    onOpenChange(value);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Avaliação</DialogTitle>
          <DialogDescription>
            Preencha os dados da cirurgia ou deixe os campos em branco. Você
            poderá editá-los depois.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="create-surgery-name">Nome da Cirurgia</Label>
            <Input
              id="create-surgery-name"
              value={surgeryName}
              onChange={(e) => setSurgeryName(e.target.value)}
              placeholder="Ex: Colecistectomia"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="create-surgery-date">Data</Label>
              <Input
                id="create-surgery-date"
                type="date"
                value={surgeryDate}
                onChange={(e) => setSurgeryDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-surgery-time">Hora</Label>
              <Input
                id="create-surgery-time"
                type="time"
                value={surgeryTime}
                onChange={(e) => setSurgeryTime(e.target.value)}
              />
            </div>
          </div>

          {enabledLocations.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="create-surgery-location">Local</Label>
              <Select
                value={locationId}
                onValueChange={(value) =>
                  setLocationId(value === '__none__' ? '' : value)
                }
              >
                <SelectTrigger id="create-surgery-location">
                  <SelectValue placeholder="Selecione o local..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Nenhum</SelectItem>
                  {enabledLocations.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id}>
                      {loc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isCreating}
          >
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={isCreating}>
            {isCreating ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Criando...
              </>
            ) : (
              'Criar Avaliação'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
