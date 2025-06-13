import React, { useState, useMemo } from 'react';
import { MessageSquare, Clock, User, Send, Filter, Settings } from 'lucide-react';
import { CustomButton } from '../../components/ui-custom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { Client } from '../../types';
import { formatDate, getWhatsAppLink, isClientOverdueForReturn, detectPronoun } from '../../utils/helpers';
import { DEFAULT_FOLLOWUP_DAYS, DEFAULT_FOLLOWUP_MESSAGE } from '../../constants';
import { useApp } from '../../contexts/AppContext';

type FilterType = 'all' | 'overdue' | 'upcoming';

export default function FollowUpPage() {
  const [clients] = useLocalStorage<Client[]>('clients', []);
  const [filter, setFilter] = useState<FilterType>('overdue');
  const [followupDays, setFollowupDays] = useLocalStorage<number>('followup_days', DEFAULT_FOLLOWUP_DAYS);
  const [followupMessage, setFollowupMessage] = useLocalStorage<string>('followup_message', DEFAULT_FOLLOWUP_MESSAGE);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [tempDays, setTempDays] = useState(followupDays.toString());
  const [tempMessage, setTempMessage] = useState(followupMessage);
  const { config, showNotification } = useApp();

  const followupClients = useMemo(() => {
    return clients.filter(client => client.lastServiceDate).map(client => {
      const daysSinceService = Math.floor(
        (new Date().getTime() - new Date(client.lastServiceDate!).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      return {
        ...client,
        daysSinceService,
        isOverdue: isClientOverdueForReturn(client.lastServiceDate, followupDays),
        isUpcoming: daysSinceService >= followupDays - 7 && daysSinceService < followupDays
      };
    });
  }, [clients, followupDays]);

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

  const getUrgencyBadge = (daysSinceService: number) => {
    if (daysSinceService > followupDays + 30) {
      return <Badge variant="destructive">Muito Atrasado</Badge>;
    } else if (daysSinceService > followupDays + 14) {
      return <Badge variant="destructive">Atrasado</Badge>;
    } else if (daysSinceService > followupDays) {
      return <Badge className="bg-orange-500 text-white">Para Retorno</Badge>;
    } else if (daysSinceService >= followupDays - 7) {
      return <Badge className="bg-yellow-500 text-white">Em Breve</Badge>;
    } else {
      return <Badge variant="secondary">Recente</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            📱 Controle de Retornos
          </h1>
          <p className="text-gray-600 mt-1">
            Gerencie e acompanhe o retorno dos seus clientes
          </p>
        </div>

        <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
          <DialogTrigger asChild>
            <CustomButton variant="outline" className="w-full sm:w-auto bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400">
              <Settings className="w-4 h-4 mr-2" />
              Configurações
            </CustomButton>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Configurações de Follow-up</DialogTitle>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Para Retorno</p>
                <p className="text-2xl font-bold text-orange-600">
                  {followupClients.filter(c => c.isOverdue).length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Em Breve</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {followupClients.filter(c => c.isUpcoming).length}
                </p>
              </div>
              <MessageSquare className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Clientes</p>
                <p className="text-2xl font-bold text-blue-600">
                  {followupClients.length}
                </p>
              </div>
              <User className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-gray-500" />
        <Select value={filter} onValueChange={(value: FilterType) => setFilter(value)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Clientes</SelectItem>
            <SelectItem value="overdue">Para Retorno</SelectItem>
            <SelectItem value="upcoming">Em Breve</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Clients List */}
      <div className="grid gap-4">
        {filteredClients.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                {filter === 'overdue' ? 'Nenhum cliente para retorno' :
                 filter === 'upcoming' ? 'Nenhum retorno próximo' :
                 'Nenhum cliente com histórico de serviços'}
              </h3>
              <p className="text-gray-500">
                {filter === 'overdue' ? 'Todos os clientes estão em dia!' :
                 filter === 'upcoming' ? 'Nenhum retorno programado para os próximos dias.' :
                 'Clientes aparecerão aqui após realizarem serviços.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredClients.map((client) => (
            <Card key={client.id} className="hover:shadow-md transition-shadow border-l-4 border-l-[#A78BFA]">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                          👶 {client.childName}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          <User className="w-3 h-3 inline mr-1" />
                          Responsável: {client.responsibleName}
                        </p>
                      </div>
                      {getUrgencyBadge(client.daysSinceService)}
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-[#A78BFA]" />
                        <span className="font-medium">Último serviço:</span> {formatDate(client.lastServiceDate!)}
                      </div>
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-3 h-3 text-[#93C5FD]" />
                        <span className="font-medium">Dias desde serviço:</span> {client.daysSinceService} dias
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[#86EFAC]">🏠</span>
                        <span className="font-medium">Tipo:</span> {client.serviceType}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[#FBBF24]">⭐</span>
                        <span className="font-medium">Total de serviços:</span> {client.serviceCount}
                      </div>
                    </div>

                    {client.phone && (
                      <div className="mt-3 p-2 bg-green-50 rounded-lg text-sm text-gray-700">
                        <span className="font-medium text-green-700">📱 Telefone:</span> {client.phone}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 min-w-[120px]">
                    {client.phone ? (
                      <CustomButton
                        onClick={() => sendFollowUpMessage(client)}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.382"/>
                        </svg>
                        WhatsApp
                      </CustomButton>
                    ) : (
                      <CustomButton
                        variant="outline"
                        onClick={() => {
                          showNotification(`Cliente ${client.childName} não tem telefone cadastrado`, 'error');
                        }}
                        className="w-full border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Sem Telefone
                      </CustomButton>
                    )}
                    
                    {client.phone && (
                      <a 
                        href={getWhatsAppLink(client.phone, '')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full"
                      >
                        <CustomButton variant="outline" className="w-full text-xs">
                          <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.382"/>
                          </svg>
                          Chat Direto
                        </CustomButton>
                      </a>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Instructions */}
      {filteredClients.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h3 className="font-semibold text-blue-800 mb-2">💡 Dicas para Follow-up</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• <strong>Para Retorno:</strong> Clientes que não voltam há mais de {followupDays} dias</p>
              <p>• <strong>Em Breve:</strong> Clientes que estão próximos dos {followupDays} dias</p>
              <p>• <strong>Mensagem automática:</strong> A mensagem é personalizada com o nome e pronome correto</p>
              <p>• <strong>WhatsApp direto:</strong> Use "Chat Direto" para conversas personalizadas</p>
              <p>• <strong>Configurável:</strong> Ajuste os dias e mensagem nas configurações</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}