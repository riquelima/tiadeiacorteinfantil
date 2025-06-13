export const APP_NAME = "Salão Infantil Encantado";

export const DEFAULT_STYLIST_NAME = "Tia Déa | Salão Móvel Infantil";

export const DEFAULT_SERVICE_DESCRIPTION = "Cortes divertidos e estilosos para a criançada, no conforto do seu lar ou em nosso espaço!";

export const DEFAULT_HOME_SERVICE_DAYS = [1, 2, 3]; // Segunda, Terça, Quarta

export const DEFAULT_SALON_ADDRESS = "Rua da Alegria, 123 - Bairro Feliz (Consulte sobre atendimento móvel)";

export const DEFAULT_WHATSAPP_NUMBER = "5511912345678";

export const DEFAULT_INSTAGRAM_URL = "https://instagram.com/salaoinfantilencantado";

export const ADMIN_DEFAULT_PASSWORD = "1234";

export const LOCAL_STORAGE_KEYS = {
  THEME_KEY: 'salon_theme',
  AUTH_KEY: 'salon_auth',
  CONFIG_KEY: 'salon_config',
  CLIENTS_KEY: 'salon_clients',
  APPOINTMENTS_KEY: 'salon_appointments',
  FINANCIALS_KEY: 'salon_financials',
  FOLLOWUP_DAYS_KEY: 'salon_followup_days',
  FOLLOWUP_TEMPLATE_KEY: 'salon_followup_template',
  TESOURINHA_KEY: 'salon_tesourinha',
  BIRTHDAY_CHECKED_KEY: 'salon_birthday_checked'
};

export const DAYS_OF_WEEK = [
  "Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"
];

export const DEFAULT_FOLLOWUP_DAYS = 45;

export const DEFAULT_FOLLOWUP_MESSAGE = "Oi {cliente}! Que tal agendar um novo cortinho para {pronome}? Já faz um tempinho! 💇‍♀️✨";

export const APPOINTMENT_STATUS_LABELS = {
  pending: 'Pendente',
  confirmed: 'Confirmado',
  completed: 'Concluído',
  missed: 'Perdido',
  cancelled: 'Cancelado'
};

export const APPOINTMENT_STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  missed: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800'
};
