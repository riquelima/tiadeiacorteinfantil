import React, { useState, useMemo, useEffect } from 'react';
import { MessageSquare, Clock, User, Settings, Calendar } from 'lucide-react';
import { CustomButton } from '../../components/ui-custom';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { Client, Appointment } from '../../types';
import { formatDate, getWhatsAppLink, detectPronoun } from '../../utils/helpers';
import { DEFAULT_FOLLOWUP_DAYS, DEFAULT_FOLLOWUP_MESSAGE } from '../../constants';
import { useApp } from '../../contexts/AppContext';
import { appointmentService, clientService } from '../../services/supabaseService';

type FilterType = 'all' | 'overdue' | 'upcoming';

export default function FollowUpPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter] = useState<FilterType>('overdue');
  const [followupDays, setFollowupDays] = useLocalStorage<number>('followup_days', DEFAULT_FOLLOWUP_DAYS);
  const [followupMessage, setFollowupMessage] = useLocalStorage<string>('followup_message', DEFAULT_FOLLOWUP_MESSAGE);
  const [remindersSent, setRemindersSent] = useLocalStorage<string[]>('reminders_sent', []);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [tempDays, setTempDays] = useState(followupDays.toString());
  const [tempMessage, setTempMessage] = useState(followupMessage);
  const { config, showNotification } = useApp();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [clientsData, appointmentsData] = await Promise.all([
          clientService.getAll(),
          appointmentService.getAll()
        ]);
        console.log('Clientes carregados:', clientsData.length);
        console.log('Agendamentos carregados:', appointmentsData.length);
        console.log('Agendamentos:', appointmentsData);
        setClients(clientsData);
        setAppointments(appointmentsData);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        showNotification('Erro ao carregar dados', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [showNotification]);

  const followupClients = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    console.log('Calculando follow-up clients...');
    console.log('Total de clientes:', clients.length);
    console.log('Total de agendamentos:', appointments.length);

    const results = clients.map(client => {
      console.log(`\nProcessando cliente: ${client.childName} (${client.responsibleName})`);
      
      // Buscar agendamentos deste cliente por nome da criança ou responsável
      const clientAppointments = appointments.filter(appointment => {
        const appointmentClientLower = appointment.clientName.toLowerCase();
        const clientChildLower = client.childName.toLowerCase();
        const clientResponsibleLower = client.responsibleName.toLowerCase();
        
        // Verificar se o nome do agendamento contém o nome da criança ou responsável
        const match = appointmentClientLower.includes(clientChildLower) || 
               appointmentClientLower.includes(clientResponsibleLower) ||
               clientChildLower.includes(appointmentClientLower.split('(')[0].trim()) ||
               clientResponsibleLower.includes(appointmentClientLower.split('(')[0].trim()) ||
               (appointmentClientLower.includes('(') && 
                appointmentClientLower.split('(')[1]?.replace(')', '').trim().includes(clientResponsibleLower));
        
        if (match) {
          console.log(`  Agendamento encontrado: ${appointment.clientName} - ${appointment.date}`);
        }
        
        return match;
      });

      console.log(`  Agendamentos encontrados: ${clientAppointments.length}`);

      if (clientAppointments.length === 0) {
        console.log(`  Cliente sem agendamentos, ignorando.`);
        return null; // Sem histórico de agendamentos
      }

      // Encontrar o agendamento mais recente
      const sortedAppointments = clientAppointments.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      const lastAppointment = sortedAppointments[0];
      const lastServiceDate = new Date(lastAppointment.date);
      
      // Calcular dias desde o último serviço
      const daysSinceService = Math.floor((today.getTime() - lastServiceDate.getTime()) / (1000 * 60 * 60 * 24));
      
      console.log(`  Último agendamento: ${lastAppointment.date}`);
      console.log(`  Dias desde o último serviço: ${daysSinceService}`);
      
      // Só incluir clientes que tiveram agendamentos há mais de 15 dias
      if (daysSinceService < 15) {
        console.log(`  Cliente muito recente (< 15 dias), ignorando.`);
        return null;
      }
      
      const isOverdue = daysSinceService >= followupDays;
      const isUpcoming = daysSinceService >= Math.max(0, followupDays - 7) && daysSinceService < followupDays;

      console.log(`  Cliente qualificado para follow-up!`);
      
      return {
        ...client,
        lastServiceDate: lastServiceDate.toISOString(),
        daysSinceService,
        isOverdue,
        isUpcoming,
        hasHistory: true
      };
    }).filter(Boolean) as Array<Client & { daysSinceService: number; isOverdue: boolean; isUpcoming: boolean; hasHistory: boolean; lastServiceDate: string | null }>;
    
    console.log('Clientes de follow-up encontrados:', results.length);
    return results;
  }, [clients, appointments, followupDays]);

  const filteredClients = useMemo(() => {
    switch (filter) {
      case 'overdue':
        return followupClients.filter(client => client.isOverdue);
      case 'upcoming':
        return followupClients.filter(client => client.isUpcoming);
      default:
        return followupClients;
    }
  }, [followupClients, filter]);

    const sendFollowUpMessage = (client: Client & { daysSinceService: number }) => {
    const pronoun = detectPronoun(client.childName);
    const message = followupMessage
      .replace('{cliente}', client.responsibleName)
      .replace('{pronome}', pronoun === 'ele' ? 'ele' : 'ela');
    
    const whatsappUrl = getWhatsAppLink(client.phone || config.whatsAppNumber, message);
    window.open(whatsappUrl, '_blank');
  };

  const markReminderAsSent = (clientId: string) => {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const reminderKey = `${clientId}-${today}`;
    
    if (!remindersSent.includes(reminderKey)) {
      setRemindersSent([...remindersSent, reminderKey]);
      showNotification('Lembrete marcado como enviado!', 'success');
    }
  };

  const isReminderSent = (clientId: string) => {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const reminderKey = `${clientId}-${today}`;
    return remindersSent.includes(reminderKey);
  };

  const handleSaveConfig = () => {
    const days = parseInt(tempDays);
    if (days < 1 || days > 365) {
      showNotification('Número de dias deve estar entre 1 e 365', 'error');
      return;
    }

    setFollowupDays(days);
    setFollowupMessage(tempMessage);
    setIsConfigOpen(false);
    showNotification('Configurações salvas com sucesso!', 'success');
  };

  const getUrgencyBadge = (client: any) => {
    // Check if reminder was sent first
    if (isReminderSent(client.id)) {
      return <Badge className="bg-green-500 text-white">Lembrete Enviado</Badge>;
    }

    if (!client.hasHistory) {
      return <Badge variant="secondary">Sem Histórico</Badge>;
    }

    if (client.daysSinceService > followupDays + 30) {
      return <Badge variant="destructive">Muito Atrasado</Badge>;
    } else if (client.daysSinceService > followupDays + 14) {
      return <Badge variant="destructive">Atrasado</Badge>;
    } else if (client.daysSinceService >= followupDays) {
      return <Badge className="bg-orange-500 text-white">Para Retorno</Badge>;
    } else if (client.daysSinceService >= Math.max(0, followupDays - 7)) {
      return <Badge className="bg-yellow-500 text-white">Em Breve</Badge>;
    } else {
      return <Badge variant="secondary">Recente</Badge>;
    }
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex justify-center mb-6">
        <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
          <DialogTrigger asChild>
            <CustomButton variant="outline" className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400">
              <Settings className="w-4 h-4 mr-2" />
              ⚙️ Configurações
            </CustomButton>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Configurações de Retorno</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="followupDays">Dias para Retorno</Label>
                <Input
                  id="followupDays"
                  type="number"
                  min="1"
                  max="365"
                  value={tempDays}
                  onChange={(e) => setTempDays(e.target.value)}
                  placeholder="45"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Número de dias após o último serviço para considerar retorno
                </p>
              </div>

              <div>
                <Label htmlFor="followupMessage">Mensagem de Follow-up</Label>
                <Textarea
                  id="followupMessage"
                  value={tempMessage}
                  onChange={(e) => setTempMessage(e.target.value)}
                  placeholder="Oi {cliente}! Que tal agendar um novo cortinho para {pronome}? Já faz um tempinho! 💇‍♀️✨"
                  rows={4}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use {'{cliente}'} para nome do responsável e {'{pronome}'} para ele/ela
                </p>
              </div>

              <div className="flex gap-2">
                <CustomButton 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsConfigOpen(false)} 
                  className="flex-1"
                >
                  Cancelar
                </CustomButton>
                <CustomButton onClick={handleSaveConfig} className="flex-1">
                  Salvar
                </CustomButton>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3 mb-6 max-w-xs mx-auto">
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-3 text-center">
            <div className="text-xl mb-1">🕐</div>
            <p className="text-xs font-medium text-orange-800 mb-1">Para Retorno</p>
            <p className="text-xl font-bold text-orange-600">
              {followupClients.filter(c => c.isOverdue).length}
            </p>
            <p className="text-[9px] text-orange-600 mt-1">
              (≥ {followupDays} dias)
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-3 text-center">
            <div className="text-xl mb-1">💬</div>
            <p className="text-xs font-medium text-yellow-800 mb-1">Em Breve</p>
            <p className="text-xl font-bold text-yellow-600">
              {followupClients.filter(c => c.isUpcoming).length}
            </p>
            <p className="text-[9px] text-yellow-600 mt-1">
              ({Math.max(0, followupDays - 7)}-{followupDays - 1} dias)
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-3 text-center">
            <div className="text-xl mb-1">👥</div>
            <p className="text-xs font-medium text-blue-800 mb-1">Total de Clientes</p>
            <p className="text-xl font-bold text-blue-600">
              {clients.length}
            </p>
            <p className="text-[9px] text-blue-600 mt-1">
              {followupClients.filter(c => c.hasHistory).length} com histórico
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-800 flex items-center justify-center gap-2">
          👥 Clientes para Retorno
        </h3>
      </div>

      <div className="space-y-3">
        {loading ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-[#A78BFA] border-t-transparent rounded-full mx-auto mb-4"></div>
              <h3 className="text-lg font-medium text-gray-600 mb-2">Carregando dados...</h3>
            </CardContent>
          </Card>
        ) : filteredClients.length === 0 ? (
          <Card className="bg-gradient-to-br from-gray-50 to-gray-100">
            <CardContent className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-600 mb-2">
                {filter === 'overdue' ? 'Nenhum cliente para retorno' :
                 filter === 'upcoming' ? 'Nenhum retorno próximo' :
                 'Nenhum cliente cadastrado'}
              </h3>
              <p className="text-gray-500 mb-4">
                {filter === 'overdue' ? 'Todos os clientes estão em dia! 🎉' :
                 filter === 'upcoming' ? 'Nenhum retorno programado para os próximos dias.' :
                 'Cadastre clientes para começar a usar o sistema.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {filteredClients.map((client) => (
              <Card key={client.id} className="hover:shadow-md transition-all duration-200 border-l-4 border-l-[#A78BFA]">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-800 text-lg truncate">👶 {client.childName}</h3>
                          <p className="text-gray-600 text-sm truncate">👤 {client.responsibleName}</p>
                        </div>
                        {getUrgencyBadge(client)}
                      </div>

                      <div className="flex flex-col gap-1 text-sm text-gray-600 mb-2">
                        {client.hasHistory && client.lastServiceDate ? (
                          <>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4 text-[#A78BFA] flex-shrink-0" />
                              <span className="truncate">{formatDate(client.lastServiceDate)}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4 text-[#93C5FD] flex-shrink-0" />
                              <span className="truncate">há {Math.abs(client.daysSinceService)} dias</span>
                            </span>
                          </>
                        ) : (
                          <span className="text-gray-500 italic">Sem histórico de serviços</span>
                        )}

                        {client.phone && (
                          <span className="text-green-600 font-medium truncate">📱 {client.phone}</span>
                        )}

                        {isReminderSent(client.id) && (
                          <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full w-fit">
                            ✅ Lembrete Enviado
                          </span>
                        )}
                      </div>

                      {client.phone && (
                        <div className="flex items-center justify-end gap-2">
                          <a 
                            href={getWhatsAppLink(client.phone, client.hasHistory ? 
                              followupMessage
                                .replace('{cliente}', client.responsibleName)
                                .replace('{pronome}', detectPronoun(client.childName) === 'ele' ? 'ele' : 'ela')
                              : `Olá ${client.responsibleName}! Como posso ajudar com o ${client.childName}?`
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center w-10 h-10 bg-green-500 hover:bg-green-600 rounded-full text-white transition-colors shadow-md hover:shadow-lg flex-shrink-0"
                            title={`Enviar mensagem para ${client.responsibleName}`}
                          >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.382"/>
                            </svg>
                          </a>
                          
                          {!isReminderSent(client.id) && (
                            <CustomButton
                              onClick={() => markReminderAsSent(client.id)}
                              variant="outline"
                              size="sm"
                              className="text-xs px-3 py-1 h-10 bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100 flex-shrink-0"
                              title="Marcar lembrete como enviado"
                            >
                              ✓ Concluído
                            </CustomButton>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Instructions */}
      {filteredClients.length > 0 && (
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
          <CardContent className="p-6">
            <h3 className="font-semibold text-blue-800 mb-3 text-center">💡 Como Usar o Sistema de Retornos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
              <div className="space-y-2">
                <p>• <strong>🕐 Para Retorno:</strong> Clientes há mais de {followupDays} dias sem serviços</p>
                <p>• <strong>💬 Em Breve:</strong> Clientes próximos dos {followupDays} dias</p>
                <p>• <strong>👥 Todos os Clientes:</strong> Lista completa de clientes cadastrados</p>
              </div>
              <div className="space-y-2">
                <p>• <strong>📱 WhatsApp:</strong> Clique no ícone verde para enviar mensagem</p>
                <p>• <strong>⚙️ Configurável:</strong> Ajuste dias e mensagem personalizada</p>
                <p>• <strong>📊 Baseado em histórico:</strong> Considera agendamentos realizados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}