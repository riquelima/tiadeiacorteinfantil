import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Calendar, Users, DollarSign, TrendingUp, Clock, Plus, MessageSquare } from 'lucide-react';
import { GradientCard, SectionHeader, CustomButton } from '../../components/ui-custom';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { LOCAL_STORAGE_KEYS } from '../../constants';
import { Client, Appointment, FinancialRecord } from '../../types';
import { formatCurrency, isClientRecent, getStatusLabel } from '../../utils/helpers';
import { Badge } from '@/components/ui/badge';
import { appointmentService, clientService } from '../../services/supabaseService';
import { useApp } from '../../contexts/AppContext';

export default function AdminDashboard() {
  const { showNotification } = useApp();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [financials] = useLocalStorage<FinancialRecord[]>(LOCAL_STORAGE_KEYS.FINANCIALS_KEY, []);
  const [loading, setLoading] = useState(true);

  // Carregar dados do Supabase
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
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      showNotification('Erro ao carregar dados do dashboard', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const totalClients = clients.length;
  const recentClients = clients.filter(client => isClientRecent(client.lastServiceDate)).length;
  const vipClients = clients.filter(client => client.serviceCount >= 3).length;

  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(apt => apt.date.startsWith(today));
  const pendingAppointments = appointments.filter(apt => apt.status === 'pending').length;

  // Week appointments (next 7 days)
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const weekAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.date);
    const todayDate = new Date(today);
    return aptDate >= todayDate && aptDate <= nextWeek && apt.status !== 'cancelled';
  });

  // Calculate monthly earnings from all revenue sources
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const completedAppointmentsThisMonth = appointments.filter(apt => {
    const aptDate = new Date(apt.date);
    return aptDate.getMonth() === currentMonth && 
           aptDate.getFullYear() === currentYear &&
           apt.status === 'completed' &&
           apt.serviceValue;
  });

  const monthlyEarnings = completedAppointmentsThisMonth
    .reduce((sum, apt) => sum + (apt.serviceValue || 0), 0);

  // Add manual financial records for the current month
  const monthlyFinancials = financials
    .filter(record => {
      const recordDate = new Date(record.date);
      return recordDate.getMonth() === currentMonth && 
             recordDate.getFullYear() === currentYear;
    })
    .reduce((sum, record) => sum + record.amount, 0);

  const totalMonthlyEarnings = monthlyEarnings + monthlyFinancials;

  const recentAppointments = appointments
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const upcomingAppointments = appointments
    .filter(apt => new Date(apt.date) > new Date() && apt.status !== 'cancelled')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  if (loading) {
    return (
      <div className="space-y-8">
        <GradientCard className="p-6">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-[#A78BFA] border-t-transparent rounded-full mx-auto mb-4"></div>
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              Carregando dashboard...
            </h3>
          </div>
        </GradientCard>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Dashboard"
        emoji="🏠"
        description="Visão geral do seu salão infantil"
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/admin/clients">
          <GradientCard className="p-6 cursor-pointer hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Clientes</p>
                <p className="text-3xl font-bold text-gray-800">{totalClients}</p>
              </div>
              <Users className="w-8 h-8 text-[#A678E2]" />
            </div>
            <div className="mt-4 flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs">
                {recentClients} novos (7 dias)
              </Badge>
              <Badge variant="outline" className="text-xs">
                {vipClients} VIP
              </Badge>
            </div>
          </GradientCard>
        </Link>

        <Link href="/admin/appointments">
          <GradientCard className="p-6 cursor-pointer hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Agendamentos Hoje</p>
                <p className="text-3xl font-bold text-gray-800">{todayAppointments.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-[#4AB7F0]" />
            </div>
            <div className="mt-4">
              <Badge variant="outline" className="text-xs">
                {pendingAppointments} pendentes
              </Badge>
            </div>
          </GradientCard>
        </Link>

        <Link href="/admin/appointments">
          <GradientCard className="p-6 cursor-pointer hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Agendamentos Semana</p>
                <p className="text-3xl font-bold text-gray-800">{weekAppointments.length}</p>
              </div>
              <Clock className="w-8 h-8 text-[#F9D449]" />
            </div>
            <div className="mt-4">
              <Badge variant="secondary" className="text-xs">
                próximos 7 dias
              </Badge>
            </div>
          </GradientCard>
        </Link>

        <Link href="/admin/financials">
          <GradientCard className="p-6 cursor-pointer hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Faturamento Mensal</p>
                <p className="text-3xl font-bold text-gray-800">{formatCurrency(totalMonthlyEarnings)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-[#7BD8B2]" />
            </div>
            <div className="mt-4">
              <Badge variant="secondary" className="text-xs">
                {completedAppointmentsThisMonth.length} serviços concluídos
              </Badge>
            </div>
          </GradientCard>
        </Link>
      </div>

      {/* Quick Actions */}
      <GradientCard className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
          ⚡ Ações Rápidas
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/admin/appointments">
            <CustomButton 
              variant="outline" 
              className="w-full h-20 flex flex-col items-center justify-center space-y-2 hover:bg-[#A78BFA] hover:text-white transition-all"
            >
              <Calendar className="w-6 h-6" />
              <span className="text-sm font-medium">Novo Agendamento</span>
            </CustomButton>
          </Link>

          <Link href="/admin/clients">
            <CustomButton 
              variant="outline" 
              className="w-full h-20 flex flex-col items-center justify-center space-y-2 hover:bg-[#93C5FD] hover:text-white transition-all"
            >
              <Users className="w-6 h-6" />
              <span className="text-sm font-medium">Novo Cliente</span>
            </CustomButton>
          </Link>

          <Link href="/admin/followup">
            <CustomButton 
              variant="outline" 
              className="w-full h-20 flex flex-col items-center justify-center space-y-2 hover:bg-[#86EFAC] hover:text-white transition-all"
            >
              <MessageSquare className="w-6 h-6" />
              <span className="text-sm font-medium">Retornos</span>
            </CustomButton>
          </Link>

          <Link href="/admin/financials">
            <CustomButton 
              variant="outline" 
              className="w-full h-20 flex flex-col items-center justify-center space-y-2 hover:bg-[#FBBF24] hover:text-white transition-all"
            >
              <DollarSign className="w-6 h-6" />
              <span className="text-sm font-medium">Financeiro</span>
            </CustomButton>
          </Link>
        </div>
      </GradientCard>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GradientCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg md:text-xl font-bold text-gray-800 flex items-center">
              <Clock className="w-4 h-4 md:w-5 md:h-5 mr-2 text-[#A78BFA]" />
              <span className="text-sm md:text-lg">📅 Próximos Agendamentos</span>
            </h3>
            <Link href="/admin/appointments">
              <button className="text-[#A78BFA] hover:text-[#93C5FD] text-xs md:text-sm font-medium">
                Ver todos →
              </button>
            </Link>
          </div>

          <div className="space-y-4">
            {upcomingAppointments.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Nenhum agendamento próximo
              </p>
            ) : (
              upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{appointment.clientName}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(appointment.date).toLocaleDateString('pt-BR')} às{' '}
                      {new Date(appointment.date).toLocaleTimeString('pt-BR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                    <p className="text-xs text-gray-500">{appointment.location}</p>
                  </div>
                  <Badge 
                    variant={appointment.status === 'confirmed' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {getStatusLabel(appointment.status)}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </GradientCard>

        <GradientCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg md:text-xl font-bold text-gray-800 flex items-center">
              <TrendingUp className="w-4 h-4 md:w-5 md:h-5 mr-2 text-[#93C5FD]" />
              <span className="text-sm md:text-lg">📊 Atividade Recente</span>
            </h3>
            <Link href="/admin/appointments">
              <button className="text-[#A78BFA] hover:text-[#93C5FD] text-xs md:text-sm font-medium">
                Ver histórico →
              </button>
            </Link>
          </div>

          <div className="space-y-4">
            {recentAppointments.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Nenhuma atividade recente
              </p>
            ) : (
              recentAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{appointment.clientName}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(appointment.date).toLocaleDateString('pt-BR')}
                    </p>
                    {appointment.serviceValue && (
                      <p className="text-xs text-green-600 font-medium">
                        {formatCurrency(appointment.serviceValue)}
                      </p>
                    )}
                  </div>
                  <Badge 
                    variant={
                      appointment.status === 'completed' ? 'default' : 
                      appointment.status === 'cancelled' ? 'destructive' : 'secondary'
                    }
                    className="text-xs"
                  >
                    {getStatusLabel(appointment.status)}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </GradientCard>
      </div>


    </div>
  );
}