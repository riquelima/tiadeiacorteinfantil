import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { AppContextType, AppConfig, Theme, BirthdayNotification, Client } from '../types';
import { 
  LOCAL_STORAGE_KEYS, 
  DEFAULT_STYLIST_NAME, 
  DEFAULT_SERVICE_DESCRIPTION,
  DEFAULT_HOME_SERVICE_DAYS,
  DEFAULT_SALON_ADDRESS,
  DEFAULT_WHATSAPP_NUMBER,
  DEFAULT_INSTAGRAM_URL,
  ADMIN_DEFAULT_PASSWORD
} from '../constants';
import { isBirthday, getTodayDateString } from '../utils/helpers';
import { useToast } from '../hooks/use-toast';

const AppContext = createContext<AppContextType | undefined>(undefined);

const defaultConfig: AppConfig = {
  stylistName: DEFAULT_STYLIST_NAME,
  serviceDescription: DEFAULT_SERVICE_DESCRIPTION,
  homeServiceDays: DEFAULT_HOME_SERVICE_DAYS,
  salonAddress: DEFAULT_SALON_ADDRESS,
  whatsAppNumber: DEFAULT_WHATSAPP_NUMBER,
  instagramUrl: DEFAULT_INSTAGRAM_URL,
  adminPassword: ADMIN_DEFAULT_PASSWORD
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const [theme, setTheme] = useLocalStorage<Theme>(LOCAL_STORAGE_KEYS.THEME_KEY, 'light');
  const [isAuthenticated, setIsAuthenticated] = useLocalStorage<boolean>(LOCAL_STORAGE_KEYS.AUTH_KEY, false);
  const [config, setConfig] = useLocalStorage<AppConfig>(LOCAL_STORAGE_KEYS.CONFIG_KEY, defaultConfig);
  const [clients] = useLocalStorage<Client[]>(LOCAL_STORAGE_KEYS.CLIENTS_KEY, []);
  const [birthdayCheckedToday, setBirthdayCheckedToday] = useLocalStorage<string>(LOCAL_STORAGE_KEYS.BIRTHDAY_CHECKED_KEY, '');

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const login = (password: string): boolean => {
    if (password === config.adminPassword) {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  const updateConfig = (newConfig: Partial<AppConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  };

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    toast({
      title: type === 'error' ? 'Erro' : type === 'success' ? 'Sucesso' : 'Informação',
      description: message,
      variant: type === 'error' ? 'destructive' : 'default',
    });
  };

  // Check for birthdays on dashboard load
  useEffect(() => {
    const today = getTodayDateString();
    if (isAuthenticated && birthdayCheckedToday !== today) {
      const birthdayClients = clients.filter(client => isBirthday(client.birthdate));
      
      if (birthdayClients.length > 0) {
        birthdayClients.forEach(client => {
          showNotification(
            `🎉 Hoje é aniversário de ${client.childName}! Que tal enviar uma mensagem especial?`,
            'info'
          );
        });
        setBirthdayCheckedToday(today);
      }
    }
  }, [isAuthenticated, clients, birthdayCheckedToday, setBirthdayCheckedToday, showNotification]);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const value: AppContextType = {
    theme,
    toggleTheme,
    isAuthenticated,
    login,
    logout,
    config,
    updateConfig,
    showNotification
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
