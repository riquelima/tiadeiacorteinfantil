import React, { useState } from 'react';
import { Users, Plus, Edit, Trash2, Phone, Search, Grid, List, Filter } from 'lucide-react';
import { GradientCard, SectionHeader, CustomButton, StatusBadge } from '../../components/ui-custom';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { LOCAL_STORAGE_KEYS } from '../../constants';
import { Client } from '../../types';
import { formatDate, generateId, isClientRecent, getWhatsAppLink } from '../../utils/helpers';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useApp } from '../../contexts/AppContext';

interface ClientFormData {
  childName: string;
  responsibleName: string;
  address: string;
  birthdate: string;
  phone: string;
  email: string;
  notes: string;
  serviceType: 'Domicílio' | 'Salão';
}

const defaultFormData: ClientFormData = {
  childName: '',
  responsibleName: '',
  address: '',
  birthdate: '',
  phone: '',
  email: '',
  notes: '',
  serviceType: 'Domicílio'
};

type ViewMode = 'grid' | 'list';
type ServiceTypeFilter = 'all' | 'Domicílio' | 'Salão';

export default function ClientsPage() {
  const { config } = useApp();
  const [clients, setClients] = useLocalStorage<Client[]>(LOCAL_STORAGE_KEYS.CLIENTS_KEY, []);
  
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [serviceTypeFilter, setServiceTypeFilter] = useState<ServiceTypeFilter>('all');
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState<ClientFormData>(defaultFormData);

  // Filter clients based on search and filter criteria
  const getFilteredClients = () => {
    let filtered = clients.map(client => ({
      ...client,
      serviceType: client.serviceType || 'Domicílio' // Default for existing clients
    }));

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(client => 
        client.childName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.responsibleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone?.includes(searchTerm) ||
        client.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply service type filter
    if (serviceTypeFilter !== 'all') {
      filtered = filtered.filter(client => client.serviceType === serviceTypeFilter);
    }

    return filtered.sort((a, b) => a.childName.localeCompare(b.childName));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const clientData: Client = {
      id: editingClient?.id || generateId(),
      childName: formData.childName,
      responsibleName: formData.responsibleName,
      address: formData.address,
      birthdate: formData.birthdate,
      phone: formData.phone || undefined,
      email: formData.email || undefined,
      notes: formData.notes || undefined,
      serviceCount: editingClient?.serviceCount || 0,
      lastServiceDate: editingClient?.lastServiceDate,
      serviceType: formData.serviceType
    };

    if (editingClient) {
      setClients(prev => prev.map(client => 
        client.id === editingClient.id ? clientData : client
      ));
    } else {
      setClients(prev => [...prev, clientData]);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData(defaultFormData);
    setEditingClient(null);
    setIsModalOpen(false);
  };

  const editClient = (client: Client) => {
    setFormData({
      childName: client.childName,
      responsibleName: client.responsibleName,
      address: client.address,
      birthdate: client.birthdate,
      phone: client.phone || '',
      email: client.email || '',
      notes: client.notes || '',
      serviceType: client.serviceType || 'Domicílio'
    });
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const deleteClient = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.')) {
      setClients(prev => prev.filter(client => client.id !== id));
    }
  };

  const sendWhatsApp = (client: Client) => {
    const message = `Olá ${client.responsibleName}! Como está o ${client.childName}? 😊`;
    const whatsappLink = getWhatsAppLink(client.phone || config.whatsAppNumber, message);
    window.open(whatsappLink, '_blank');
  };

  const filteredClients = getFilteredClients();

  const ClientCard = ({ client }: { client: Client }) => (
    <GradientCard className="p-6 h-full">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-800">{client.childName}</h3>
          <p className="text-sm text-gray-600">{client.responsibleName}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Badge variant="default" className="text-xs bg-[#A78BFA] text-white">
            {client.serviceType || 'Domicílio'}
          </Badge>
          {isClientRecent(client.lastServiceDate) && (
            <Badge variant="secondary" className="text-xs">Recente</Badge>
          )}
          {client.serviceCount >= 3 && (
            <Badge variant="outline" className="text-xs">VIP</Badge>
          )}
        </div>
      </div>

      <div className="space-y-2 text-sm text-gray-600 mb-4">
        <p>📍 {client.address}</p>
        <p>🎂 {formatDate(client.birthdate)}</p>
        {client.phone && (
          <p>📱 {client.phone}</p>
        )}
        {client.lastServiceDate && (
          <p>📅 Último serviço: {formatDate(client.lastServiceDate)}</p>
        )}
        <p>✂️ {client.serviceCount} serviços</p>
      </div>

      {client.notes && (
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-1">Observações:</p>
          <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{client.notes}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2">
        {client.phone && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => sendWhatsApp(client)}
            className="flex-1 text-xs sm:text-sm text-green-600 hover:text-green-800 h-8"
          >
            <Phone className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            WhatsApp
          </Button>
        )}
        <div className="flex gap-2 flex-1 sm:flex-none">
          <Button
            size="sm"
            variant="outline"
            onClick={() => editClient(client)}
            className="flex-1 sm:flex-none text-xs sm:text-sm h-8"
          >
            <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="sm:hidden ml-1">Editar</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => deleteClient(client.id)}
            className="flex-1 sm:flex-none text-xs sm:text-sm text-red-600 hover:text-red-800 h-8"
          >
            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="sm:hidden ml-1">Excluir</span>
          </Button>
        </div>
      </div>
    </GradientCard>
  );

  const ClientListItem = ({ client }: { client: Client }) => (
    <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h3 className="font-bold text-gray-800">{client.childName}</h3>
            <span className="text-gray-600">({client.responsibleName})</span>
            <Badge variant="default" className="text-xs bg-[#A78BFA] text-white">
              {client.serviceType || 'Domicílio'}
            </Badge>
            {isClientRecent(client.lastServiceDate) && (
              <Badge variant="secondary" className="text-xs">Recente</Badge>
            )}
            {client.serviceCount >= 3 && (
              <Badge variant="outline" className="text-xs">VIP</Badge>
            )}
          </div>
          
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <span>📱 {client.phone || 'Não informado'}</span>
            <span>🎂 {formatDate(client.birthdate)}</span>
            <span>✂️ {client.serviceCount} serviços</span>
            {client.lastServiceDate && (
              <span>📅 {formatDate(client.lastServiceDate)}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {client.phone && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => sendWhatsApp(client)}
              className="text-green-600 hover:text-green-800 h-8"
            >
              <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => editClient(client)}
            className="h-8"
          >
            <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => deleteClient(client.id)}
            className="text-red-600 hover:text-red-800 h-8"
          >
            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Clientes"
        emoji="👥"
        description="Gerencie a sua clientela infantil"
      />

      {/* Controls */}
      <GradientCard className="p-4 md:p-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar clientes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setShowClientDropdown(true)}
                onBlur={() => setTimeout(() => setShowClientDropdown(false), 150)}
                className="pl-10 text-sm md:text-base"
              />
              {showClientDropdown && filteredClients.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
                  {filteredClients.slice(0, 10).map(client => (
                    <div
                      key={client.id}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                      onClick={() => {
                        setSearchTerm(client.childName);
                        setShowClientDropdown(false);
                      }}
                    >
                      <div className="font-medium text-sm">{client.childName}</div>
                      <div className="text-xs text-gray-500">{client.responsibleName} - {client.serviceType || 'Domicílio'}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <Select value={serviceTypeFilter} onValueChange={(value: ServiceTypeFilter) => setServiceTypeFilter(value)}>
              <SelectTrigger className="w-full sm:w-auto min-w-[140px]">
                <SelectValue placeholder="Tipo de Serviço" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                <SelectItem value="Domicílio">Atendimento Domicílio</SelectItem>
                <SelectItem value="Salão">Salão</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="flex gap-2 items-center justify-center sm:justify-start">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="flex-1 sm:flex-none"
              >
                <Grid className="w-4 h-4 mr-2 sm:mr-0" />
                <span className="sm:hidden">Grade</span>
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="flex-1 sm:flex-none"
              >
                <List className="w-4 h-4 mr-2 sm:mr-0" />
                <span className="sm:hidden">Lista</span>
              </Button>
            </div>
            
            <CustomButton
              variant="primary"
              onClick={() => setIsModalOpen(true)}
              className="text-sm md:text-base"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Cliente
            </CustomButton>
          </div>
        </div>
      </GradientCard>



      {/* Clients Display */}
      <GradientCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">
            📋 {filteredClients.length} Cliente{filteredClients.length !== 1 ? 's' : ''}
          </h3>
          
          {searchTerm && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchTerm('')}
            >
              Limpar busca
            </Button>
          )}
        </div>

        {filteredClients.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
            </p>
            <p className="text-gray-400 text-sm">
              {searchTerm ? 'Tente modificar os termos da busca' : 'Clique em "Novo Cliente" para começar'}
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredClients.map((client) => (
              <ClientCard key={client.id} client={client} />
            ))}
          </div>
        ) : (
          <div className="space-y-3 md:space-y-4">
            {filteredClients.map((client) => (
              <ClientListItem key={client.id} client={client} />
            ))}
          </div>
        )}
      </GradientCard>

      {/* Client Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingClient ? '✏️ Editar Cliente' : '👶 Novo Cliente'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="childName">👶 Nome da Criança *</Label>
                <Input
                  id="childName"
                  value={formData.childName}
                  onChange={(e) => setFormData(prev => ({ ...prev, childName: e.target.value }))}
                  required
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="responsibleName">👤 Responsável *</Label>
                <Input
                  id="responsibleName"
                  value={formData.responsibleName}
                  onChange={(e) => setFormData(prev => ({ ...prev, responsibleName: e.target.value }))}
                  required
                  className="mt-1"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="address">🏠 Endereço Completo *</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                required
                className="mt-1"
                rows={2}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="birthdate">🎂 Data de Nascimento *</Label>
                <Input
                  id="birthdate"
                  type="date"
                  value={formData.birthdate}
                  onChange={(e) => setFormData(prev => ({ ...prev, birthdate: e.target.value }))}
                  required
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="phone">📱 WhatsApp</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="(11) 99999-9999"
                  className="mt-1"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="email">📧 E-mail</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="serviceType">✂️ Tipo de Serviço *</Label>
              <Select 
                value={formData.serviceType} 
                onValueChange={(value: 'Domicílio' | 'Salão') => setFormData(prev => ({ ...prev, serviceType: value }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione o tipo de serviço" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Domicílio">Atendimento Domicílio</SelectItem>
                  <SelectItem value="Salão">Salão</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="notes">📝 Observações</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Preferências, alergias, observações especiais..."
                className="mt-1"
                rows={3}
              />
            </div>
            
            <div className="flex space-x-3 pt-4">
              <CustomButton 
                type="button" 
                variant="ghost" 
                onClick={resetForm}
                className="flex-1"
              >
                Cancelar
              </CustomButton>
              <CustomButton type="submit" variant="primary" className="flex-1">
                {editingClient ? 'Salvar Alterações' : 'Cadastrar Cliente'}
              </CustomButton>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
