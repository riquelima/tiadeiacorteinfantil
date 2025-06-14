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
import { configService } from '../services/supabaseService';
import { galleryService } from '../services/supabaseService'; // Import galleryService

const AppContext = createContext<AppContextType | undefined>(undefined);

const defaultConfig: AppConfig = {
  stylistName: DEFAULT_STYLIST_NAME,
  serviceDescription: DEFAULT_SERVICE_DESCRIPTION,
  homeServiceDays: DEFAULT_HOME_SERVICE_DAYS,
  salonAddress: DEFAULT_SALON_ADDRESS,
  whatsAppNumber: DEFAULT_WHATSAPP_NUMBER,
  instagramUrl: DEFAULT_INSTAGRAM_URL,
  adminPassword: ADMIN_DEFAULT_PASSWORD,
  galleryImages: [] // Initialize galleryImages
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const [theme, setTheme] = useLocalStorage<Theme>(LOCAL_STORAGE_KEYS.THEME_KEY, 'light');
  const [isAuthenticated, setIsAuthenticated] = useLocalStorage<boolean>(LOCAL_STORAGE_KEYS.AUTH_KEY, false);
  const [config, setConfig] = useState<AppConfig>({
    stylistName: DEFAULT_STYLIST_NAME,
    serviceDescription: DEFAULT_SERVICE_DESCRIPTION,
    homeServiceDays: DEFAULT_HOME_SERVICE_DAYS,
    salonAddress: DEFAULT_SALON_ADDRESS,
    whatsAppNumber: DEFAULT_WHATSAPP_NUMBER,
    instagramUrl: DEFAULT_INSTAGRAM_URL,
    adminPassword: ADMIN_DEFAULT_PASSWORD,
    galleryImages: [] // Initialize galleryImages
  });

  // Load config from Supabase
  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const dbConfig = await configService.getConfig();
      setConfig(dbConfig);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      // Keep default config if error
    }
  };

  // Migration: Update address and service days if they're still the old defaults
  useEffect(() => {
    let needsUpdate = false;
    const updates: Partial<AppConfig> = {};

    if (config.salonAddress === "Rua da Alegria, 123 - Bairro Feliz (Consulte sobre atendimento móvel)") {
      updates.salonAddress = DEFAULT_SALON_ADDRESS;
      needsUpdate = true;
    }

    if (JSON.stringify(config.homeServiceDays) === JSON.stringify([1, 2, 3])) {
      updates.homeServiceDays = DEFAULT_HOME_SERVICE_DAYS;
      needsUpdate = true;
    }

    if (needsUpdate) {
      setConfig(prev => ({ ...prev, ...updates }));
    }
  }, [config.salonAddress, config.homeServiceDays, setConfig]);
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

  const updateConfig = async (newConfig: Partial<AppConfig>) => {
    try {
      await configService.updateConfig(newConfig);
      setConfig(prev => ({ ...prev, ...newConfig }));
      showNotification('Configurações atualizadas com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error);
      showNotification('Erro ao atualizar configurações', 'error');
    }
  };

  const uploadGalleryImage = async (file: File) => {
    try {
      const imageUrl = await galleryService.uploadImage(file);
      const newImages = [...config.galleryImages, imageUrl];
      setConfig(prev => ({ ...prev, galleryImages: newImages }));
      showNotification('Imagem adicionada à galeria!', 'success');
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      if (error && typeof error === 'object' && 'message' in error) {
        if (error.message.includes('Bucket not found')) {
          showNotification('Erro: Bucket "salon-gallery" não encontrado no Supabase. Crie o bucket primeiro.', 'error');
        } else {
          showNotification(`Erro ao fazer upload: ${error.message}`, 'error');
        }
      } else {
        showNotification('Erro ao fazer upload da imagem', 'error');
      }
    }
  };

  const deleteGalleryImage = async (url: string) => {
    try {
      await galleryService.deleteImage(url);
      const newImages = config.galleryImages.filter(img => img !== url);
      setConfig(prev => ({ ...prev, galleryImages: newImages }));
      showNotification('Imagem removida da galeria!', 'success');
    } catch (error) {
      console.error('Erro ao remover imagem:', error);
      if (error && typeof error === 'object' && 'message' in error) {
        showNotification(`Erro ao remover imagem: ${error.message}`, 'error');
      } else {
        showNotification('Erro ao remover imagem', 'error');
      }
    }
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
    uploadGalleryImage,
    deleteGalleryImage,
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