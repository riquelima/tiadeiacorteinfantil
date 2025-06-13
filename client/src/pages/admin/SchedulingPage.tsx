import React, { useState } from 'react';
import { Calendar, Clock, MapPin, User, Plus, Filter, ChevronDown } from 'lucide-react';
import { CustomButton } from '../../components/ui-custom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '../../components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { Appointment, AppointmentStatus, AppointmentLocation, Client } from '../../types';
import { formatDate, generateId, getStatusLabel } from '../../utils/helpers';
import { APPOINTMENT_STATUS_COLORS } from '../../constants';

export default function SchedulingPage() {
  const [appointments, setAppointments] = useLocalStorage<Appointment[]>('appointments', []);
  const [clients] = useLocalStorage<Client[]>('clients', []);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'all'>('all');
  const [locationFilter, setLocationFilter] = useState<AppointmentLocation | 'all'>('all');
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);
  
  const [formData, setFormData] = useState({
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newAppointment: Appointment = {
      id: generateId(),
      clientName: formData.clientName,
      date: `${formData.date} ${formData.time}`,
      location: formData.location,
      status: 'pending',
      notes: formData.notes,
      serviceValue: formData.serviceValue ? parseFloat(formData.serviceValue) : undefined
    };

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
  };

  const updateAppointmentStatus = (id: string, status: AppointmentStatus) => {
    setAppointments(prev => prev.map(app => 
      app.id === id ? { ...app, status } : app
    ));
  };

  const deleteAppointment = (id: string) => {
    setAppointments(prev => prev.filter(app => app.id !== id));
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
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="clientName">Nome do Cliente</Label>
                <Popover open={isClientDropdownOpen} onOpenChange={setIsClientDropdownOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="w-full justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 flex items-center"
                    >
                      <span className={formData.clientName ? "text-foreground" : "text-muted-foreground"}>
                        {formData.clientName || "Selecione ou digite o nome do cliente"}
                      </span>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0" align="start">
                    <Command>
                      <CommandInput 
                        placeholder="Buscar cliente ou digite um novo nome..." 
                        value={formData.clientName}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, clientName: value }))}
                      />
                      {clients.length === 0 ? (
                        <div className="py-4 px-3 text-center">
                          <p className="text-sm text-muted-foreground">Nenhum cliente cadastrado ainda.</p>
                        </div>
                      ) : (
                        <>
                          <CommandEmpty>
                            <div className="py-2 px-3">
                              <p className="text-sm text-muted-foreground mb-2">Nenhum cliente encontrado com este nome.</p>
                              {formData.clientName && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsClientDropdownOpen(false);
                                  }}
                                  className="text-sm text-primary hover:underline"
                                >
                                  Usar "{formData.clientName}" como novo cliente
                                </button>
                              )}
                            </div>
                          </CommandEmpty>
                          <CommandGroup heading="Clientes Cadastrados">
                            {clients.map((client) => (
                              <CommandItem
                                key={client.id}
                                value={`${client.childName} ${client.responsibleName}`}
                                onSelect={() => {
                                  setFormData(prev => ({ 
                                    ...prev, 
                                    clientName: `${client.childName} - ${client.responsibleName}` 
                                  }));
                                  setIsClientDropdownOpen(false);
                                }}
                                className="cursor-pointer"
                              >
                                <div className="flex flex-col w-full">
                                  <span className="font-medium">{client.childName}</span>
                                  <span className="text-xs text-muted-foreground">
                                    Responsável: {client.responsibleName} | {client.serviceType}
                                  </span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </>
                      )}
                    </Command>
                  </PopoverContent>
                </Popover>
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
                <Input
                  id="serviceValue"
                  type="number"
                  step="0.01"
                  value={formData.serviceValue}
                  onChange={(e) => setFormData(prev => ({ ...prev, serviceValue: e.target.value }))}
                  placeholder="R$ 0,00"
                />
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
        {filteredAppointments.length === 0 ? (
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
                    {appointment.status === 'pending' && (
                      <CustomButton
                        size="sm"
                        onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                      >
                        Confirmar
                      </CustomButton>
                    )}
                    {appointment.status === 'confirmed' && (
                      <CustomButton
                        size="sm"
                        onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                      >
                        Finalizar
                      </CustomButton>
                    )}
                    <CustomButton
                      size="sm"
                      variant="outline"
                      onClick={() => deleteAppointment(appointment.id)}
                    >
                      Remover
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