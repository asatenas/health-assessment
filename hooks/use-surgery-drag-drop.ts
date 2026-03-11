'use client';

import { useState } from 'react';
import {
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { useSWRConfig } from 'swr';
import { toast } from '@/components/ui/toast';

type SurgeryBase = {
  assessmentId: string;
  surgeryDate: string;
};

interface WeeklySurgeriesData<T extends SurgeryBase> {
  surgeries: T[];
}

function buildNewSurgeryDate(targetDay: Date, originalSurgeryDate: string): string {
  const original = new Date(originalSurgeryDate);
  const y = targetDay.getFullYear();
  const m = String(targetDay.getMonth() + 1).padStart(2, '0');
  const d = String(targetDay.getDate()).padStart(2, '0');
  const h = String(original.getHours()).padStart(2, '0');
  const min = String(original.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${d}T${h}:${min}:00`;
}

export function useSurgeryDragDrop<T extends SurgeryBase>(surgeries: T[]) {
  const [activeSurgery, setActiveSurgery] = useState<T | null>(null);
  const { mutate } = useSWRConfig();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const surgery = event.active.data.current?.surgery as T | undefined;
    setActiveSurgery(surgery ?? null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveSurgery(null);

    const surgery = event.active.data.current?.surgery as T | undefined;
    const targetDayIso = event.over?.id as string | undefined;

    if (!surgery || !targetDayIso) return;

    const targetDay = new Date(targetDayIso);
    const originalDay = new Date(surgery.surgeryDate);

    if (targetDay.toDateString() === originalDay.toDateString()) return;

    const newIsoDate = buildNewSurgeryDate(targetDay, surgery.surgeryDate);
    const { assessmentId } = surgery;
    const weeklyKey = '/api/clinic/metrics/weekly-surgeries';

    // Optimistic update
    mutate(
      weeklyKey,
      (current: WeeklySurgeriesData<T> | undefined) => ({
        surgeries: (current?.surgeries ?? surgeries).map((s) =>
          s.assessmentId === assessmentId
            ? { ...s, surgeryDate: newIsoDate }
            : s,
        ),
      }),
      { revalidate: false },
    );

    try {
      const res = await fetch(`/api/clinic/chats/${assessmentId}/surgery-details`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ surgeryDate: newIsoDate }),
      });

      if (!res.ok) {
        mutate(weeklyKey);
        toast({ type: 'error', description: 'Erro ao mover cirurgia.' });
        return;
      }

      // Revalidate all dashboard panels
      mutate(
        (k: unknown) =>
          typeof k === 'string' &&
          (k.startsWith('/api/clinic/metrics') ||
            k.startsWith('/api/clinic/monthly-surgeries')),
      );
    } catch {
      mutate(weeklyKey);
      toast({ type: 'error', description: 'Erro ao mover cirurgia.' });
    }
  };

  return { sensors, activeSurgery, handleDragStart, handleDragEnd };
}
