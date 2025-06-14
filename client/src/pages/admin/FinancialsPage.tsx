import React, { useState, useMemo, useEffect } from 'react';
import { DollarSign, TrendingUp, Calendar, Download, Plus } from 'lucide-react';
import { CustomButton } from '../../components/ui-custom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { FinancialRecord, Appointment } from '../../types';
import { formatDate, formatCurrency, generateId, exportToCSV } from '../../utils/helpers';
import { appointmentService } from '../../services/supabaseService';
import { useApp } from '../../contexts/AppContext';

export default function FinancialsPage() {
  const { showNotification } = useApp();
  const [financialRecords, setFinancialRecords] = useLocalStorage<FinancialRecord[]>('financialRecords', []);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth().toString());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [locationFilter, setLocationFilter] = useState<'all' | 'Salão' | 'Domicílio'>('all');
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    description: '',
    appointmentId: ''
  });

  // Carregar dados do Supabase
  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const appointmentsData = await appointmentService.getAll();
      setAppointments(appointmentsData);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
      showNotification('Erro ao carregar dados financeiros', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Calculate financial metrics
  const filteredRecords = useMemo(() => {
    return financialRecords.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate.getMonth() === parseInt(selectedMonth) && 
             recordDate.getFullYear() === parseInt(selectedYear);
    });
  }, [financialRecords, selectedMonth, selectedYear]);

  const completedAppointments = useMemo(() => {
    return appointments.filter(app => {
      const appDate = new Date(app.date);
      const locationMatch = locationFilter === 'all' || app.location === locationFilter;
      return app.status === 'completed' && 
             appDate.getMonth() === parseInt(selectedMonth) && 
             appDate.getFullYear() === parseInt(selectedYear) &&
             locationMatch;
    });
  }, [appointments, selectedMonth, selectedYear, locationFilter]);

  const totalRevenue = useMemo(() => {
    const recordsTotal = filteredRecords.reduce((sum, record) => sum + record.amount, 0);
    const appointmentsTotal = completedAppointments
      .filter(app => app.serviceValue)
      .reduce((sum, app) => sum + (app.serviceValue || 0), 0);
    return recordsTotal + appointmentsTotal;
  }, [filteredRecords, completedAppointments]);

  const totalServices = completedAppointments.length;
  const averageTicket = totalServices > 0 ? totalRevenue / totalServices : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newRecord: FinancialRecord = {
      id: generateId(),
      appointmentId: formData.appointmentId || '',
      date: formData.date,
      amount: parseFloat(formData.amount),
      description: formData.description
    };

    setFinancialRecords(prev => [...prev, newRecord]);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      amount: '',
      description: '',
      appointmentId: ''
    });
    setIsDialogOpen(false);
  };

  const handleExport = () => {
    const exportData = [
      ...filteredRecords.map(record => ({
        Data: formatDate(record.date),
        Valor: formatCurrency(record.amount),
        Descrição: record.description,
        Tipo: 'Receita Manual',
        Local: 'N/A'
      })),
      ...completedAppointments
        .filter(app => app.serviceValue)
        .map(app => ({
          Data: formatDate(app.date),
          Valor: formatCurrency(app.serviceValue),
          Descrição: `Serviço - ${app.clientName}`,
          Tipo: 'Agendamento',
          Local: app.location
        }))
    ];

    const columns = [
      { key: 'Data' as keyof typeof exportData[0], label: 'Data' },
      { key: 'Valor' as keyof typeof exportData[0], label: 'Valor' },
      { key: 'Descrição' as keyof typeof exportData[0], label: 'Descrição' },
      { key: 'Tipo' as keyof typeof exportData[0], label: 'Tipo' },
      { key: 'Local' as keyof typeof exportData[0], label: 'Local' }
    ];

    const locationSuffix = locationFilter === 'all' ? 'todos' : locationFilter.toLowerCase();
    exportToCSV(exportData, `financeiro-${selectedMonth}-${selectedYear}-${locationSuffix}`, columns);
  };

  const deleteRecord = (id: string) => {
    setFinancialRecords(prev => prev.filter(record => record.id !== id));
  };

  const currentMonthName = new Date(parseInt(selectedYear), parseInt(selectedMonth)).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const locationText = locationFilter === 'all' ? '' : ` - ${locationFilter}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            💰 Financeiro
          </h1>
          <p className="text-gray-600 mt-1">
            Controle suas receitas e relatórios
          </p>
        </div>

        <div className="flex gap-2">
          <CustomButton variant="outline" onClick={handleExport} className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </CustomButton>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <CustomButton variant="outline" className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400">
                <Plus className="w-4 h-4 mr-2" />
                Nova Receita
              </CustomButton>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Nova Receita</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
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
                  <Label htmlFor="amount">Valor</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="R$ 0,00"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descrição da receita..."
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <CustomButton type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                    Cancelar
                  </CustomButton>
                  <CustomButton type="submit" className="flex-1">
                    Salvar
                  </CustomButton>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Month/Year/Location Filter */}
      <div className="flex gap-4">
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 12 }, (_, i) => (
              <SelectItem key={i} value={i.toString()}>
                {new Date(2024, i).toLocaleDateString('pt-BR', { month: 'long' })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 5 }, (_, i) => {
              const year = new Date().getFullYear() - 2 + i;
              return (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        <Select value={locationFilter} onValueChange={(value: 'all' | 'Salão' | 'Domicílio') => setLocationFilter(value)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Locais</SelectItem>
            <SelectItem value="Salão">🏪 Salão</SelectItem>
            <SelectItem value="Domicílio">🏠 Domicílio</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              em {currentMonthName}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Serviços Realizados</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {totalServices}
            </div>
            <p className="text-xs text-muted-foreground">
              serviços concluídos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(averageTicket)}
            </div>
            <p className="text-xs text-muted-foreground">
              por serviço
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Financial Records */}
      <Card>
        <CardHeader>
          <CardTitle>Movimentação Financeira - {currentMonthName}{locationText}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-[#A78BFA] border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando dados financeiros...</p>
            </div>
          ) : (
            <div className="space-y-4">
            {/* Manual Records */}
            {filteredRecords.map((record) => (
              <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{record.description}</p>
                  <p className="text-sm text-gray-600">{formatDate(record.date)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-green-600">
                    {formatCurrency(record.amount)}
                  </span>
                  <CustomButton
                    size="sm"
                    variant="outline"
                    onClick={() => deleteRecord(record.id)}
                  >
                    Remover
                  </CustomButton>
                </div>
              </div>
            ))}

            {/* Completed Appointments */}
            {completedAppointments
              .filter(app => app.serviceValue)
              .map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
                  <div>
                    <p className="font-medium">Serviço - {appointment.clientName}</p>
                    <p className="text-sm text-gray-600">{formatDate(appointment.date)} • {appointment.location === 'Salão' ? '🏪' : '🏠'} {appointment.location}</p>
                  </div>
                  <span className="font-bold text-green-600">
                    {formatCurrency(appointment.serviceValue)}
                  </span>
                </div>
              ))}

            {filteredRecords.length === 0 && completedAppointments.filter(app => app.serviceValue).length === 0 && (
              <div className="text-center py-8">
                <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">
                  Nenhuma movimentação encontrada
                </h3>
                <p className="text-gray-500">
                  Registre suas receitas ou complete agendamentos para ver a movimentação financeira.
                </p>
              </div>
            )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}