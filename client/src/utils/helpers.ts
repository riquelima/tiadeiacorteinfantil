import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AppointmentStatus } from '../types';
import { APPOINTMENT_STATUS_LABELS } from '../constants';

export function formatDate(dateString: string, includeTime = false): string {
  try {
    const date = parseISO(dateString);
    if (includeTime) {
      return format(date, 'dd/MM/yyyy HH:mm', { locale: ptBR });
    }
    return format(date, 'dd/MM/yyyy', { locale: ptBR });
  } catch {
    return 'Data inválida';
  }
}

export function formatCurrency(value?: number): string {
  if (!value) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  columns: { key: keyof T; label: string }[]
): void {
  if (data.length === 0) return;

  const headers = columns.map(col => col.label).join(',');
  const rows = data.map(item =>
    columns.map(col => {
      const value = item[col.key];
      return typeof value === 'string' && value.includes(',') 
        ? `"${value}"` 
        : value;
    }).join(',')
  );

  const csv = [headers, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export function getDayOfWeek(dateString: string): string {
  try {
    const date = parseISO(dateString);
    return format(date, 'EEEE', { locale: ptBR });
  } catch {
    return '';
  }
}

export function isFutureDate(dateString: string): boolean {
  try {
    const date = parseISO(dateString);
    return date > new Date();
  } catch {
    return false;
  }
}

export function getMonthName(index: number): string {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return months[index] || '';
}

export function getWhatsAppLink(phone: string, message?: string): string {
  const cleanPhone = phone.replace(/\D/g, '');
  const encodedMessage = message ? encodeURIComponent(message) : '';
  return `https://wa.me/${cleanPhone}${encodedMessage ? `?text=${encodedMessage}` : ''}`;
}

export function isClientRecent(lastServiceDate?: string): boolean {
  if (!lastServiceDate) return false;
  try {
    const date = parseISO(lastServiceDate);
    const daysDiff = Math.floor((new Date().getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff <= 7;
  } catch {
    return false;
  }
}

export function isClientOverdueForReturn(lastServiceDate?: string, daysThreshold = 45): boolean {
  if (!lastServiceDate) return false;
  try {
    const date = parseISO(lastServiceDate);
    const daysDiff = Math.floor((new Date().getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff >= daysThreshold;
  } catch {
    return false;
  }
}

export function getStatusLabel(status: AppointmentStatus): string {
  return APPOINTMENT_STATUS_LABELS[status] || status;
}

export function detectPronoun(name: string): string {
  const cleanName = name.trim().toLowerCase();
  // Simple heuristic: names ending in 'a' are typically feminine
  return cleanName.endsWith('a') ? 'ela' : 'ele';
}

export function isBirthday(birthdate: string): boolean {
  try {
    const birth = parseISO(birthdate);
    const today = new Date();
    return birth.getDate() === today.getDate() && birth.getMonth() === today.getMonth();
  } catch {
    return false;
  }
}

export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}
