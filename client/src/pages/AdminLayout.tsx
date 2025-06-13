import React from 'react';
import { Switch, Route, useLocation, Link } from 'wouter';
import { 
  Home, 
  Calendar, 
  Users, 
  DollarSign, 
  MessageSquare, 
  Settings, 
  LogOut
} from 'lucide-react';
import { FloatingDecorations, ScissorsIcon } from '../components/icons';
import { CustomButton } from '../components/ui-custom';
import { useApp } from '../contexts/AppContext';

// Import admin pages
import AdminDashboard from './admin/AdminDashboard';
import SchedulingPage from './admin/SchedulingPage';
import ClientsPage from './admin/ClientsPage';
import FinancialsPage from './admin/FinancialsPage';
import FollowUpPage from './admin/FollowUpPage';
import SettingsPage from './admin/SettingsPage';

const navigationItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: Home, emoji: '🏠' },
  { path: '/admin/appointments', label: 'Agendamentos', icon: Calendar, emoji: '📅' },
  { path: '/admin/clients', label: 'Clientes', icon: Users, emoji: '👥' },
  { path: '/admin/financials', label: 'Financeiro', icon: DollarSign, emoji: '💰' },
  { path: '/admin/followup', label: 'Retornos', icon: MessageSquare, emoji: '📱' },
  { path: '/admin/settings', label: 'Configurações', icon: Settings, emoji: '⚙️' },
];

export default function AdminLayout() {
  const [location] = useLocation();
  const { logout, config } = useApp();

  const handleLogout = () => {
    logout();
  };

  const isActive = (path: string) => location === path;

  return (
    <div className="min-h-screen gradient-bg pb-20 md:pb-0">
      <FloatingDecorations />
      
      {/* Header */}
      <header className="relative z-10 bg-white/90 backdrop-blur-sm shadow-lg">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-14 md:h-16">
            <div className="flex items-center space-x-2 md:space-x-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-[#A78BFA] to-[#93C5FD] rounded-full flex items-center justify-center text-white">
                <ScissorsIcon className="text-base md:text-lg" />
              </div>
              <div>
                <h1 className="text-lg md:text-xl font-bold text-gray-800">Admin Panel</h1>
                <p className="text-xs md:text-sm text-[#A78BFA] hidden sm:block">{config.stylistName}</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex space-x-1">
              {navigationItems.slice(0, -1).map((item) => (
                <Link key={item.path} href={item.path}>
                  <button
                    className={`px-2 lg:px-3 py-2 rounded-lg text-xs lg:text-sm font-medium transition-colors ${
                      isActive(item.path)
                        ? 'bg-[#A78BFA] text-white'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-1">{item.emoji}</span>
                    <span className="hidden xl:inline">{item.label}</span>
                  </button>
                </Link>
              ))}
              <Link href="/admin/settings">
                <button
                  className={`px-2 lg:px-3 py-2 rounded-lg text-xs lg:text-sm font-medium transition-colors ${
                    isActive('/admin/settings')
                      ? 'bg-[#A78BFA] text-white'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-1">⚙️</span>
                  <span className="hidden xl:inline">Configurações</span>
                </button>
              </Link>
              <CustomButton
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="ml-2 text-xs lg:text-sm"
              >
                <LogOut className="w-3 h-3 lg:w-4 lg:h-4 lg:mr-1" />
                <span className="hidden lg:inline">Sair</span>
              </CustomButton>
            </nav>

            {/* Mobile Logout Button */}
            <CustomButton
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="lg:hidden"
            >
              <LogOut className="w-3 h-3 md:w-4 md:h-4" />
            </CustomButton>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 md:py-6 lg:py-8">
        <Switch>
          <Route path="/admin/dashboard" component={AdminDashboard} />
          <Route path="/admin/appointments" component={SchedulingPage} />
          <Route path="/admin/clients" component={ClientsPage} />
          <Route path="/admin/financials" component={FinancialsPage} />
          <Route path="/admin/followup" component={FollowUpPage} />
          <Route path="/admin/settings" component={SettingsPage} />
          <Route>
            <AdminDashboard />
          </Route>
        </Switch>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 z-50">
        <div className="grid grid-cols-6 h-16">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.path} href={item.path}>
                <button
                  className={`w-full h-full flex flex-col items-center justify-center space-y-1 transition-colors px-1 ${
                    isActive(item.path)
                      ? 'text-[#A78BFA] bg-purple-50'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-[10px] font-medium truncate leading-none">
                    {item.label === 'Dashboard' ? 'Painel' :
                     item.label === 'Agendamentos' ? 'Agenda' :
                     item.label === 'Clientes' ? 'Clientes' :
                     item.label === 'Financeiro' ? 'Financeiro' :
                     item.label === 'Retornos' ? 'Retornos' :
                     item.label === 'Configurações' ? 'Ajustes' : item.label}
                  </span>
                </button>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
