import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { FloatingDecorations, ScissorsIcon } from '../components/icons';
import { CustomButton, GradientCard } from '../components/ui-custom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApp } from '../contexts/AppContext';

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { login, showNotification } = useApp();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate a small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));

    if (login(password)) {
      showNotification('Login realizado com sucesso!', 'success');
      setLocation('/admin/dashboard');
    } else {
      showNotification('Senha incorreta. Tente novamente.', 'error');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center">
      <FloatingDecorations />
      
      <div className="relative z-10 w-full max-w-md mx-4">
        <GradientCard className="p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-[#A78BFA] to-[#93C5FD] rounded-full flex items-center justify-center mx-auto mb-4">
              <ScissorsIcon className="text-3xl text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Área Administrativa</h1>
            <p className="text-gray-600">Salão Infantil Encantado</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Senha de Acesso
              </Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <CustomButton
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Entrando...
                </div>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Entrar
                </>
              )}
            </CustomButton>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setLocation('/')}
              className="text-[#A78BFA] hover:text-[#93C5FD] font-medium text-sm transition-colors"
            >
              ← Voltar para o site
            </button>
          </div>
        </GradientCard>
      </div>
    </div>
  );
}
