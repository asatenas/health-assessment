import type { ChatStatus } from '@/lib/db/chat-status';

export type Chat = {
  id: string;
  createdAt: string;
  status: ChatStatus | 'expired';
  form?: {
    age: number;
    weight: number;
    height: number;
    allergies?: string[];
    medicalDevices?: {
      paceMaker?: boolean;
      medicationPump?: boolean;
      others?: string;
    };
    hemoglobin?: number;
    creatinine?: number;
  };
  results?: string;
  medications?: string;
  score_rcri: number | null;
  score_aub_has2: number | null;
  surgeryDate?: string | null;
};

export interface ChatListViewProps {
  chats: Chat[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  totalChats: number;
  limit: number;
  statusFilter: string;
  dateFromFilter: string;
  dateToFilter: string;
  onPageChange: (page: number) => void;
  onStatusFilterChange: (status: string) => void;
  onDateFromFilterChange: (date: string) => void;
  onDateToFilterChange: (date: string) => void;
  onClearFilters: () => void;
}

export type MedicationDetail = {
  medicationName: string;
  suspensionDays: string;
};
