export const APP_NAME = "Salão Infantil Encantado";

export const DEFAULT_STYLIST_NAME = "Tia Déa | Salão Móvel Infantil";

export const DEFAULT_SERVICE_DESCRIPTION = "✨ Transformamos cortes em momentos mágicos! ✨\n\nCom mais de 21 anos de dedicação e carinho, o Tia Déa Salão Móvel Infantil é referência em cortes e cuidados voltados para o público infantil. Mais do que um simples atendimento, oferecemos uma experiência divertida, segura e personalizada — no conforto do seu lar ou em nosso espaço encantado.";

export const DEFAULT_HOME_SERVICE_DAYS = [1, 2]; // Segunda, Terça

export const DEFAULT_SALON_ADDRESS = "Rua Alameda Dilson Jatahy Fonseca, Stella Maris - Salvador/BA";

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
  pending: 'bg-[#F9D449]/20 text-[#D97706] border border-[#F9D449]',
  confirmed: 'bg-[#4AB7F0]/20 text-[#0284C7] border border-[#4AB7F0]',
  completed: 'bg-[#7BD8B2]/20 text-[#059669] border border-[#7BD8B2]',
  missed: 'bg-[#F86D70]/20 text-[#DC2626] border border-[#F86D70]',
  cancelled: 'bg-[#A678E2]/20 text-[#7C3AED] border border-[#A678E2]'
};
