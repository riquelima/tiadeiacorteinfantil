
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, Plus, Filter, ChevronDown, Edit, Check, Trash2, AlertTriangle } from 'lucide-react';
import { CustomButton } from '../../components/ui-custom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { Appointment, AppointmentStatus, AppointmentLocation, Client } from '../../types';
import { formatDate, getStatusLabel } from '../../utils/helpers';
import { APPOINTMENT_STATUS_COLORS } from '../../constants';
import { appointmentService, clientService } from '../../services/supabaseService';
import { useApp } from '../../contexts/AppContext';

export default function SchedulingPage() {
  const { showNotification } = useApp();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'all'>('all');
  const [locationFilter, setLocationFilter] = useState<AppointmentLocation | 'all'>('all');
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);

  // Load data from Supabase
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [appointmentsData, clientsData] = await Promise.all([
        appointmentService.getAll(),
        clientService.getAll()
      ]);
      setAppointments(appointmentsData);
      setClients(clientsData);
      showNotification('Dados carregados com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      showNotification('Erro ao carregar dados', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const [formData, setFormData] = useState({
    clientName: '',
    date: '',
    time: '',
    location: 'Salão' as AppointmentLocation,
    notes: '',
    serviceValue: ''
  });

  const [editFormData, setEditFormData] = useState({
    clientName: '',
    date: '',
    time: '',
    location: 'Salão' as AppointmentLocation,
    notes: '',
    serviceValue: ''
  });

  const filteredAppointments = appointments.filter(appointment => {
    const statusMatch = statusFilter === 'all' || appointment.status === statusFilter;
    const locationMatch = locationFilter === 'all' || appointment.location === locationFilter;
    return statusMatch && locationMatch;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validar se o cliente está cadastrado com busca mais precisa
      let selectedClient = null;
      
      // Primeira tentativa: busca exata pelo formato "Nome - Responsável"
      selectedClient = clients.find(client => 
        formData.clientName === `${client.childName} - ${client.responsibleName}`
      );
      
      // Segunda tentativa: busca exata pelo nome da criança
      if (!selectedClient) {
        selectedClient = clients.find(client => 
          formData.clientName === client.childName
        );
      }
      
      // Terceira tentativa: busca exata pelo nome do responsável
      if (!selectedClient) {
        selectedClient = clients.find(client => 
          formData.clientName === client.responsibleName
        );
      }
      
      // Quarta tentativa: busca parcial (apenas se não encontrou exata)
      if (!selectedClient) {
        const searchTerm = formData.clientName.toLowerCase().trim();
        selectedClient = clients.find(client => {
          const childMatch = client.childName.toLowerCase() === searchTerm;
          const responsibleMatch = client.responsibleName.toLowerCase() === searchTerm;
          return childMatch || responsibleMatch;
        });
      }

      if (!selectedClient) {
        alert(`Erro: Cliente "${formData.clientName}" não encontrado!\n\nSó é possível agendar para clientes cadastrados. Por favor:\n1. Vá para a página "Clientes"\n2. Cadastre o cliente primeiro\n3. Retorne para fazer o agendamento`);
        return;
      }
      
      const appointmentData = {
        clientName: `${selectedClient.childName} (${selectedClient.responsibleName})`,
        date: `${formData.date} ${formData.time}`,
        location: formData.location,
        status: 'pending' as AppointmentStatus,
        notes: formData.notes,
        serviceValue: formData.serviceValue ? parseFloat(formData.serviceValue) : undefined
      };

      const newAppointment = await appointmentService.create(appointmentData);
      setAppointments(prev => [...prev, newAppointment]);
      
      setFormData({
        clientName: '',
        date: '',
        time: '',
        location: 'Salão',
        notes: '',
        serviceValue: ''
      });
      setIsClientDropdownOpen(false);
      setIsDialogOpen(false);
      
      showNotification('Agendamento criado com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      showNotification('Erro ao criar agendamento', 'error');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAppointment) return;

    try {
      const appointmentData = {
        clientName: editFormData.clientName,
        date: `${editFormData.date} ${editFormData.time}`,
        location: editFormData.location,
        status: selectedAppointment?.status || 'pending',
        notes: editFormData.notes,
        serviceValue: editFormData.serviceValue ? parseFloat(editFormData.serviceValue) : undefined
      };

      const updatedAppointment = await appointmentService.update(selectedAppointment.id, appointmentData);
      setAppointments(prev => prev.map(app => 
        app.id === selectedAppointment.id ? updatedAppointment : app
      ));
      
      setIsEditDialogOpen(false);
      setSelectedAppointment(null);
      showNotification('Agendamento atualizado com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao atualizar agendamento:', error);
      showNotification('Erro ao atualizar agendamento', 'error');
    }
  };

  const openEditDialog = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    const appointmentDate = new Date(appointment.date);
    setEditFormData({
      clientName: appointment.clientName,
      date: appointmentDate.toISOString().split('T')[0],
      time: appointmentDate.toTimeString().slice(0, 5),
      location: appointment.location,
      notes: appointment.notes || '',
      serviceValue: appointment.serviceValue?.toString() || ''
    });
    setIsEditDialogOpen(true);
  };

  const confirmAppointment = async (appointment: Appointment) => {
    // Mostrar dialog de confirmação se não houver valor definido
    if (!appointment.serviceValue) {
      setSelectedAppointment(appointment);
      setIsConfirmDialogOpen(true);
      return;
    }

    // Se já tem valor, confirmar diretamente
    await updateAppointmentStatus(appointment.id, 'completed');
  };

  const handleConfirmWithValue = async (serviceValue: number) => {
    if (!selectedAppointment) return;

    try {
      const updatedAppointment = await appointmentService.update(selectedAppointment.id, {
        status: 'completed' as AppointmentStatus,
        serviceValue: serviceValue
      });
      
      setAppointments(prev => prev.map(app => 
        app.id === selectedAppointment.id ? updatedAppointment : app
      ));
      
      setIsConfirmDialogOpen(false);
      setSelectedAppointment(null);
      showNotification('Agendamento confirmado e valor registrado!', 'success');
    } catch (error) {
      console.error('Erro ao confirmar agendamento:', error);
      showNotification('Erro ao confirmar agendamento', 'error');
    }
  };

  const updateAppointmentStatus = async (id: string, status: AppointmentStatus) => {
    try {
      const updatedAppointment = await appointmentService.update(id, { status });
      setAppointments(prev => prev.map(app => 
        app.id === id ? updatedAppointment : app
      ));
      showNotification('Status do agendamento atualizado!', 'success');
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      showNotification('Erro ao atualizar status', 'error');
    }
  };

  const deleteAppointment = async (appointment: Appointment) => {
    // Dialog de confirmação elegante
    const confirmed = window.confirm(
      `⚠️ Confirmar Exclusão\n\n` +
      `Tem certeza que deseja excluir este agendamento?\n\n` +
      `Cliente: ${appointment.clientName}\n` +
      `Data: ${formatDate(appointment.date, true)}\n` +
      `Local: ${appointment.location}\n\n` +
      `Esta ação não pode ser desfeita.`
    );

    if (!confirmed) return;

    try {
      await appointmentService.delete(appointment.id);
      setAppointments(prev => prev.filter(app => app.id !== appointment.id));
      showNotification('Agendamento removido com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao remover agendamento:', error);
      showNotification('Erro ao remover agendamento', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            📅 Agendamentos
          </h1>
          <p className="text-gray-600 mt-1">
            Gerencie seus agendamentos e horários
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <CustomButton variant="outline" className="w-full sm:w-auto bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400">
              <Plus className="w-4 h-4 mr-2" />
              Novo Agendamento
            </CustomButton>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Novo Agendamento</DialogTitle>
              <DialogDescription>
                Preencha os dados para criar um novo agendamento
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="clientName">👶 Nome da Criança (Cliente)</Label>
                <div className="relative">
                  <Input
                    id="clientName"
                    type="text"
                    placeholder={clients.length > 0 ? "Digite ou clique para selecionar um cliente..." : "Nenhum cliente cadastrado"}
                    value={formData.clientName}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, clientName: e.target.value }));
                      setIsClientDropdownOpen(true);
                    }}
                    onFocus={() => setIsClientDropdownOpen(true)}
                    onBlur={() => setTimeout(() => setIsClientDropdownOpen(false), 200)}
                    required
                    disabled={clients.length === 0}
                    className="pr-8"
                  />
                  <ChevronDown 
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 cursor-pointer"
                    onClick={() => {
                      setIsClientDropdownOpen(!isClientDropdownOpen);
                      if (!isClientDropdownOpen) {
                        document.getElementById('clientName')?.focus();
                      }
                    }}
                  />
                  
                  {isClientDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto mt-1">
                      {clients.length > 0 ? (
                        <>
                          <div className="p-2 text-xs text-gray-500 bg-gray-50 border-b">
                            ✅ {clients.length} cliente{clients.length !== 1 ? 's' : ''} cadastrado{clients.length !== 1 ? 's' : ''} - Clique para selecionar
                          </div>
                          
                          {(() => {
                            // Filtra clientes baseado no texto digitado
                            const searchTerm = formData.clientName.toLowerCase().trim();
                            let filteredClients = clients;
                            
                            if (searchTerm) {
                              filteredClients = clients.filter(client => {
                                return client.childName.toLowerCase().includes(searchTerm) ||
                                       client.responsibleName.toLowerCase().includes(searchTerm);
                              });
                            }
                            
                            // Se há busca mas nenhum resultado
                            if (searchTerm && filteredClients.length === 0) {
                              return (
                                <div className="p-3 text-center text-red-500 text-sm bg-red-50">
                                  ❌ Nenhum cliente encontrado para "{formData.clientName}"
                                  <br />
                                  <span className="text-xs">Tente buscar por outro nome</span>
                                </div>
                              );
                            }
                            
                            // Sempre mostra os clientes (todos ou filtrados)
                            return filteredClients.map((client) => (
                              <div
                                key={client.id}
                                className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  // Define o nome exatamente como aparece na busca
                                  const clientDisplayName = `${client.childName} - ${client.responsibleName}`;
                                  setFormData(prev => ({ 
                                    ...prev, 
                                    clientName: clientDisplayName
                                  }));
                                  setIsClientDropdownOpen(false);
                                  console.log('Cliente selecionado:', client.childName, 'Responsável:', client.responsibleName);
                                }}
                              >
                                <div className="flex flex-col">
                                  <span className="font-bold text-base text-[#A78BFA]">👶 {client.childName}</span>
                                  <span className="text-xs text-gray-600">
                                    👤 Responsável: {client.responsibleName}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    📍 {client.serviceType || 'Domicílio'} | 🎂 {new Date(client.birthdate).toLocaleDateString('pt-BR')}
                                  </span>
                                  {client.phone && (
                                    <span className="text-xs text-gray-500">
                                      📱 {client.phone}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ));
                          })()}
                          
                          {!formData.clientName.trim() && (
                            <div className="p-2 text-xs text-blue-600 bg-blue-50">
                              💡 Digite para buscar ou clique em um cliente da lista
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="p-4 text-center text-red-500 text-sm bg-red-50">
                          ❌ Nenhum cliente cadastrado ainda!
                          <br />
                          <span className="text-xs font-semibold">Vá para a página "Clientes" para cadastrar novos clientes primeiro.</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  ⚠️ Somente clientes já cadastrados podem ser agendados
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Data</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="time">Horário</Label>
                  <Select value={formData.time} onValueChange={(value) => setFormData(prev => ({ ...prev, time: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o horário" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px] overflow-y-auto">
                      {Array.from({ length: 24 }, (_, hour) => {
                        return ['00', '30'].map(minute => {
                          const timeValue = `${hour.toString().padStart(2, '0')}:${minute}`;
                          const displayTime = `${hour.toString().padStart(2, '0')}:${minute}`;
                          return (
                            <SelectItem key={timeValue} value={timeValue}>
                              {displayTime}
                            </SelectItem>
                          );
                        });
                      }).flat()}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="location">Local</Label>
                <Select value={formData.location} onValueChange={(value: AppointmentLocation) => setFormData(prev => ({ ...prev, location: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Salão">Salão</SelectItem>
                    <SelectItem value="Domicílio">Domicílio</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="serviceValue">Valor do Serviço (opcional)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                    R$
                  </span>
                  <Input
                    id="serviceValue"
                    type="number"
                    step="0.01"
                    value={formData.serviceValue}
                    onChange={(e) => setFormData(prev => ({ ...prev, serviceValue: e.target.value }))}
                    placeholder="0,00"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Observações adicionais..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <CustomButton type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                  Cancelar
                </CustomButton>
                <CustomButton type="submit" className="flex-1">
                  Agendar
                </CustomButton>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Agendamento</DialogTitle>
            <DialogDescription>
              Altere os dados do agendamento
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <Label htmlFor="editClientName">👶 Nome do Cliente</Label>
              <Input
                id="editClientName"
                type="text"
                value={editFormData.clientName}
                onChange={(e) => setEditFormData(prev => ({ ...prev, clientName: e.target.value }))}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editDate">Data</Label>
                <Input
                  id="editDate"
                  type="date"
                  value={editFormData.date}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, date: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="editTime">Horário</Label>
                <Input
                  id="editTime"
                  type="time"
                  value={editFormData.time}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, time: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="editLocation">Local</Label>
              <Select value={editFormData.location} onValueChange={(value: AppointmentLocation) => setEditFormData(prev => ({ ...prev, location: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Salão">Salão</SelectItem>
                  <SelectItem value="Domicílio">Domicílio</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="editStatus">Status</Label>
              <Select value={selectedAppointment?.status || 'pending'} onValueChange={(value: AppointmentStatus) => {
                if (selectedAppointment) {
                  setSelectedAppointment({...selectedAppointment, status: value});
                }
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="confirmed">Confirmado</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                  <SelectItem value="missed">Faltou</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="editServiceValue">Valor do Serviço</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                  R$
                </span>
                <Input
                  id="editServiceValue"
                  type="number"
                  step="0.01"
                  value={editFormData.serviceValue}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, serviceValue: e.target.value }))}
                  placeholder="0,00"
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="editNotes">Observações</Label>
              <Textarea
                id="editNotes"
                value={editFormData.notes}
                onChange={(e) => setEditFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Observações adicionais..."
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <CustomButton type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)} className="flex-1">
                Cancelar
              </CustomButton>
              <CustomButton type="submit" className="flex-1">
                Salvar Alterações
              </CustomButton>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600" />
              Confirmar Agendamento
            </DialogTitle>
            <DialogDescription>
              Defina o valor do serviço para confirmar o agendamento
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target as HTMLFormElement);
            const serviceValue = parseFloat(formData.get('confirmServiceValue') as string);
            if (serviceValue > 0) {
              handleConfirmWithValue(serviceValue);
            }
          }} className="space-y-4">
            <div>
              <Label htmlFor="confirmServiceValue">💰 Valor do Serviço</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                  R$
                </span>
                <Input
                  id="confirmServiceValue"
                  name="confirmServiceValue"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0,00"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="flex gap-2">
              <CustomButton type="button" variant="outline" onClick={() => setIsConfirmDialogOpen(false)} className="flex-1">
                Cancelar
              </CustomButton>
              <CustomButton type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
                Confirmar Agendamento
              </CustomButton>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <Select value={statusFilter} onValueChange={(value: AppointmentStatus | 'all') => setStatusFilter(value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Status</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="confirmed">Confirmado</SelectItem>
              <SelectItem value="completed">Realizado</SelectItem>
              <SelectItem value="cancelled">Cancelado</SelectItem>
              <SelectItem value="missed">Faltou</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Select value={locationFilter} onValueChange={(value: AppointmentLocation | 'all') => setLocationFilter(value)}>
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Locais</SelectItem>
            <SelectItem value="Salão">Salão</SelectItem>
            <SelectItem value="Domicílio">Domicílio</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Appointments List */}
      <div className="grid gap-4">
        {loading ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-[#A78BFA] border-t-transparent rounded-full mx-auto mb-4"></div>
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                Carregando agendamentos...
              </h3>
            </CardContent>
          </Card>
        ) : filteredAppointments.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                Nenhum agendamento encontrado
              </h3>
              <p className="text-gray-500">
                {statusFilter !== 'all' || locationFilter !== 'all' 
                  ? 'Tente ajustar os filtros ou' 
                  : 'Comece'} criando um novo agendamento.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredAppointments.map((appointment) => (
            <Card key={appointment.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <h3 className="font-semibold text-gray-800">{appointment.clientName}</h3>
                      <Badge 
                        variant="secondary" 
                        className={`${APPOINTMENT_STATUS_COLORS[appointment.status]} text-white`}
                      >
                        {getStatusLabel(appointment.status)}
                      </Badge>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(appointment.date, true)}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {appointment.location}
                      </div>
                      {appointment.serviceValue && (
                        <div className="flex items-center gap-1">
                          <span className="text-green-600 font-medium">
                            R$ {appointment.serviceValue.toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {appointment.notes && (
                      <p className="text-sm text-gray-600 mt-2 italic">
                        {appointment.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <CustomButton
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(appointment)}
                      className="border-blue-300 text-blue-600 hover:bg-blue-50"
                      title="Editar agendamento"
                    >
                      <Edit className="w-3 h-3" />
                    </CustomButton>
                    
                    {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
                      <CustomButton
                        size="sm"
                        onClick={() => confirmAppointment(appointment)}
                        className="bg-green-500 hover:bg-green-600 text-white"
                        title="Marcar como concluído"
                      >
                        <Check className="w-3 h-3" />
                      </CustomButton>
                    )}
                    
                    <CustomButton
                      size="sm"
                      variant="outline"
                      onClick={() => deleteAppointment(appointment)}
                      className="border-red-300 text-red-600 hover:bg-red-50"
                      title="Excluir agendamento"
                    >
                      <Trash2 className="w-3 h-3" />
                    </CustomButton>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
