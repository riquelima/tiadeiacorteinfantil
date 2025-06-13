export interface Client {
  id: string;
  childName: string;
  responsibleName: string;
  address: string;
  birthdate: string;
  phone?: string;
  email?: string;
  lastServiceDate?: string;
  notes?: string;
  serviceCount: number;
  serviceType: 'Domicílio' | 'Salão';
}

export type AppointmentLocation = 'Domicílio' | 'Salão';

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'missed' | 'cancelled';

export interface Appointment {
  id: string;
  clientName: string;
  date: string;
  location: AppointmentLocation;
  status: AppointmentStatus;
  notes?: string;
  serviceValue?: number;
}

export interface FinancialRecord {
  id: string;
  appointmentId: string;
  date: string;
  amount: number;
  description: string;
}

export interface AppConfig {
  stylistName: string;
  serviceDescription: string;
  homeServiceDays: number[];
  salonAddress: string;
  whatsAppNumber: string;
  instagramUrl: string;
  adminPassword: string;
}

export type Theme = 'light' | 'dark';

export interface TesourinhaEntry {
  id: string;
  date: string;
  note: string;
}

export interface AppContextType {
  theme: Theme;
  toggleTheme: () => void;
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
  config: AppConfig;
  updateConfig: (newConfig: Partial<AppConfig>) => void;
  showNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export interface BirthdayNotification {
  clientName: string;
  birthdate: string;
}
