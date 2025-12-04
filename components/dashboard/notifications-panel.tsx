'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle, AlertCircle, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

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
}

export function NotificationsPanel({ notifications }: NotificationsPanelProps) {
  const router = useRouter();

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

  const getNotificationStyles = (priority: string) => {
    switch (priority) {
      case 'high':
        return {
          badge: 'bg-red-100 text-red-800 border-red-200',
          icon: 'text-red-600',
          border: 'border-l-4 border-l-red-500',
        };
      case 'medium':
        return {
          badge: 'bg-orange-100 text-orange-800 border-orange-200',
          icon: 'text-orange-600',
          border: 'border-l-4 border-l-orange-500',
        };
      default:
        return {
          badge: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: 'text-blue-600',
          border: 'border-l-4 border-l-blue-500',
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
        {notifications.length > 0 && (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
          >
            {notifications.length}
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
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
              {notifications.map((notification) => {
                const Icon = getNotificationIcon(notification.priority);
                const styles = getNotificationStyles(notification.priority);

                return (
                  <div
                    key={notification.id}
                    className={`rounded-lg border bg-card p-3 transition-all hover:shadow-md ${styles.border}`}
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
                          <Badge className={styles.badge} variant="outline">
                            {getPriorityLabel(notification.priority)}
                          </Badge>
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
