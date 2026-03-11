'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle, AlertCircle, Clock, X } from 'lucide-react';

interface Notification {
  id: string;
  chatId: string;
  priority: 'high' | 'medium';
  type: string;
  message: string;
  description: string;
  timestamp: string;
}

interface NotificationsPanelProps {
  notifications: Notification[];
  onNotificationClick?: (chatId: string) => void;
}

type DismissedEntry = { id: string; dismissedAt: number };
const STORAGE_KEY = 'dismissed-notifications';
const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

function loadDismissedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const entries: DismissedEntry[] = JSON.parse(raw);
    const now = Date.now();
    const valid = entries.filter((e) => now - e.dismissedAt < SEVEN_DAYS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(valid));
    return new Set(valid.map((e) => e.id));
  } catch {
    return new Set();
  }
}

function persistDismiss(id: string) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const entries: DismissedEntry[] = raw ? JSON.parse(raw) : [];
    entries.push({ id, dismissedAt: Date.now() });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {}
}

export function NotificationsPanel({
  notifications,
  onNotificationClick,
}: NotificationsPanelProps) {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [showDismissed, setShowDismissed] = useState(false);

  useEffect(() => {
    setDismissedIds(loadDismissedIds());
  }, []);

  const handleDismiss = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    persistDismiss(id);
    setDismissedIds((prev) => new Set([...prev, id]));
  };

  const visible = notifications.filter((n) => !dismissedIds.has(n.id));
  const dismissed = notifications.filter((n) => dismissedIds.has(n.id));
  const displayed = showDismissed ? notifications : visible;

  const getNotificationIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return AlertTriangle;
      case 'medium':
        return AlertCircle;
      default:
        return Clock;
    }
  };

  const getNotificationStyles = (priority: string, isDismissed: boolean) => {
    if (isDismissed) {
      return {
        badge: 'bg-gray-100 text-gray-500 border-gray-200',
        icon: 'text-gray-400',
        border: 'border-l-4 border-l-gray-300',
        container: 'opacity-50',
      };
    }
    switch (priority) {
      case 'high':
        return {
          badge: 'bg-red-100 text-red-800 border-red-200',
          icon: 'text-red-600',
          border: 'border-l-4 border-l-red-500',
          container: '',
        };
      case 'medium':
        return {
          badge: 'bg-orange-100 text-orange-800 border-orange-200',
          icon: 'text-orange-600',
          border: 'border-l-4 border-l-orange-500',
          container: '',
        };
      default:
        return {
          badge: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: 'text-blue-600',
          border: 'border-l-4 border-l-blue-500',
          container: '',
        };
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'Alta';
      case 'medium':
        return 'Média';
      default:
        return 'Info';
    }
  };

  const formatTimestamp = (timestamp: string = new Date().toString()) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `há ${diffMins} minuto${diffMins !== 1 ? 's' : ''}`;
    }
    if (diffHours < 24) {
      return `há ${diffHours} hora${diffHours !== 1 ? 's' : ''}`;
    }
    if (diffDays < 7) {
      return `há ${diffDays} dia${diffDays !== 1 ? 's' : ''}`;
    }
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Notificações e Alertas</CardTitle>
        <div className="flex items-center gap-2">
          {dismissed.length > 0 && (
            <button
              type="button"
              onClick={() => setShowDismissed((v) => !v)}
              className="text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
            >
              {showDismissed ? 'Ocultar dispensados' : `+${dismissed.length} dispensado${dismissed.length !== 1 ? 's' : ''}`}
            </button>
          )}
          {visible.length > 0 && (
            <Badge
              variant="outline"
              className="bg-red-50 text-red-700 border-red-200"
            >
              {visible.length}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {displayed.length === 0 ? (
          <div className="flex h-[300px] flex-col items-center justify-center gap-2 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground" />
            <p className="text-sm font-medium">Nenhuma notificação</p>
            <p className="text-xs text-muted-foreground">
              Você está em dia com todas as avaliações
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-3">
              {displayed.map((notification) => {
                const Icon = getNotificationIcon(notification.priority);
                const isDismissed = dismissedIds.has(notification.id);
                const styles = getNotificationStyles(
                  notification.priority,
                  isDismissed,
                );
                const isClickable = !!onNotificationClick && !isDismissed;

                return (
                  <div
                    key={notification.id}
                    role={isClickable ? 'button' : undefined}
                    tabIndex={isClickable ? 0 : undefined}
                    onClick={
                      isClickable
                        ? () => onNotificationClick(notification.chatId)
                        : undefined
                    }
                    onKeyDown={
                      isClickable
                        ? (e) => {
                            if (e.key === 'Enter' || e.key === ' ')
                              onNotificationClick(notification.chatId);
                          }
                        : undefined
                    }
                    className={`rounded-lg border bg-card p-3 transition-all hover:shadow-md ${styles.border} ${styles.container} ${isClickable ? 'cursor-pointer' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        <Icon className={`h-5 w-5 ${styles.icon}`} />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium leading-none">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-1 shrink-0">
                            <Badge className={styles.badge} variant="outline">
                              {getPriorityLabel(notification.priority)}
                            </Badge>
                            {!isDismissed && (
                              <button
                                type="button"
                                onClick={(e) =>
                                  handleDismiss(e, notification.id)
                                }
                                className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                                aria-label="Dispensar notificação"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Chat ID: {notification.chatId}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatTimestamp(notification.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
