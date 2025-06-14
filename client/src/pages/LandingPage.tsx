import React, { useState } from 'react';
import { Link } from 'wouter';
import { Lock, MapPin, Clock, Phone, Instagram } from 'lucide-react';
import { FloatingDecorations, ScissorsIcon } from '../components/icons';
import { CustomButton, GradientCard, SectionHeader } from '../components/ui-custom';
import { ImageCarousel } from '../components/ImageCarousel';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useApp } from '../contexts/AppContext';
import { getWhatsAppLink } from '../utils/helpers';
import { clientService } from '../services/supabaseService';

// Imagens padrão caso não haja imagens na galeria
const defaultSalonImages = [
  'https://raw.githubusercontent.com/riquelima/tiadeiacorteinfantil/refs/heads/main/1.png',
  'https://raw.githubusercontent.com/riquelima/tiadeiacorteinfantil/refs/heads/main/2.png',
  'https://raw.githubusercontent.com/riquelima/tiadeiacorteinfantil/refs/heads/main/3.png',
  'https://raw.githubusercontent.com/riquelima/tiadeiacorteinfantil/refs/heads/main/4.png',
  'https://raw.githubusercontent.com/riquelima/tiadeiacorteinfantil/refs/heads/main/5.png',
  'https://raw.githubusercontent.com/riquelima/tiadeiacorteinfantil/refs/heads/main/6.png',
  'https://raw.githubusercontent.com/riquelima/tiadeiacorteinfantil/refs/heads/main/7.png',
  'https://raw.githubusercontent.com/riquelima/tiadeiacorteinfantil/refs/heads/main/8.png'
];

interface SchedulingFormData {
  responsibleName: string;
  childName: string;
  address: string;
  birthdate: string;
  preferredDate: string;
  preferredTime: string;
}

export default function LandingPage() {
  const { config } = useApp();

  // Usar imagens da galeria se disponíveis, senão usar as padrão
  const salonImages = config.galleryImages.length > 0 ? config.galleryImages : defaultSalonImages;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<SchedulingFormData>({
    responsibleName: '',
    childName: '',
    address: '',
    birthdate: '',
    preferredDate: '',
    preferredTime: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Salvar cliente automaticamente
      const clientData = {
        childName: formData.childName,
        responsibleName: formData.responsibleName,
        address: formData.address,
        birthdate: formData.birthdate,
        phone: '', // Será preenchido posteriormente se necessário
        email: undefined,
        notes: `Agendamento solicitado em ${new Date().toLocaleDateString('pt-BR')} para ${formData.preferredDate ? new Date(formData.preferredDate).toLocaleDateString('pt-BR') : 'data não informada'} às ${formData.preferredTime || 'horário não informado'}`,
        serviceCount: 0,
        serviceType: 'Domicílio' as const
      };

      await clientService.create(clientData);

      const message = `Olá Tia Déa, gostaria de agendar um corte com você. Segue as informações:

Nome do responsável: ${formData.responsibleName}
Nome da criança: ${formData.childName}
Endereço: ${formData.address}
Data de nascimento: ${formData.birthdate ? new Date(formData.birthdate).toLocaleDateString('pt-BR') : 'Não informado'}
Data preferida: ${formData.preferredDate ? new Date(formData.preferredDate).toLocaleDateString('pt-BR') : 'Não informado'}
Horário preferido: ${formData.preferredTime || 'Não informado'}`;

      const whatsappLink = getWhatsAppLink('5571988624093', message);
      window.open(whatsappLink, '_blank');
      setIsModalOpen(false);

      // Reset form
      setFormData({
        responsibleName: '',
        childName: '',
        address: '',
        birthdate: '',
        preferredDate: '',
        preferredTime: ''
      });

    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      // Mesmo com erro ao salvar, ainda envia o WhatsApp
      const message = `Olá Tia Déa, gostaria de agendar um corte com você. Segue as informações:

Nome do responsável: ${formData.responsibleName}
Nome da criança: ${formData.childName}
Endereço: ${formData.address}
Data de nascimento: ${formData.birthdate ? new Date(formData.birthdate).toLocaleDateString('pt-BR') : 'Não informado'}
Data preferida: ${formData.preferredDate ? new Date(formData.preferredDate).toLocaleDateString('pt-BR') : 'Não informado'}
Horário preferido: ${formData.preferredTime || 'Não informado'}`;

      const whatsappLink = getWhatsAppLink('5571988624093', message);
      window.open(whatsappLink, '_blank');
      setIsModalOpen(false);

      // Reset form
      setFormData({
        responsibleName: '',
        childName: '',
        address: '',
        birthdate: '',
        preferredDate: '',
        preferredTime: ''
      });
    }
  };

  return (
    <div className="min-h-screen gradient-bg relative">
      <FloatingDecorations />
      {/* Navigation Header */}
      <nav className="relative z-10 bg-white/90 backdrop-blur-sm shadow-lg rounded-b-3xl mx-4 mt-4">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full overflow-hidden">
                <img 
                  src="https://raw.githubusercontent.com/riquelima/tiadeiacorteinfantil/refs/heads/main/logo.png" 
                  alt="Tia Déa Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="font-bold bg-gradient-to-r from-[#A678E2] to-[#4AB7F0] bg-clip-text text-transparent text-[21px]">
                  Tia Déa | Salão Móvel Infantil
                </h1>
              </div>
            </div>
            <div className="flex items-center">
              {config.instagramUrl && (
                <a 
                  href={config.instagramUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform"
                  title="Siga no Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </nav>
      {/* Hero Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        <GradientCard>
          <SectionHeader
            title="Cortes Mágicos para Criançada!"
            emoji="🌟"
            description={config.serviceDescription}
          />

          <div className="bg-gradient-to-r from-[#A678E2] to-[#4AB7F0] text-white p-4 rounded-2xl mb-6">
            <p className="font-semibold text-center text-[18px]">🏠 Atendimento a Domicílio: 
            Segunda e Terça (consulte disponibilidade)</p>
          </div>

          {/* Image Gallery */}
          {salonImages.length > 0 && (
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-center mb-6 text-gray-800">📸 Galeria</h3>
              <ImageCarousel images={salonImages} />
            </div>
          )}

          {/* Services Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-[#A78BFA]/20 to-[#93C5FD]/20 p-6 rounded-2xl card-hover">
              <div className="text-center">
                <div className="text-4xl mb-3">🏠</div>
                <h4 className="text-xl font-bold text-gray-800 mb-2">Atendimento Domiciliar</h4>
                <p className="text-gray-600">Cortamos no conforto da sua casa!</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-[#86EFAC]/20 to-[#FBBF24]/20 p-6 rounded-2xl card-hover">
              <div className="text-center">
                <div className="text-4xl mb-3">✂️</div>
                <h4 className="text-xl font-bold text-gray-800 mb-2">Cortes Especiais</h4>
                <p className="text-gray-600">Estilos únicos para cada criança!</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-[#FBBF24]/20 to-[#A78BFA]/20 p-6 rounded-2xl card-hover">
              <div className="text-center">
                <div className="text-4xl mb-3">🎉</div>
                <h4 className="text-xl font-bold text-gray-800 mb-2">Aniversários</h4>
                <p className="text-gray-600">Fazemos o dia especial ainda mais mágico!</p>
              </div>
            </div>
          </div>

          {/* WhatsApp Scheduling Section */}
          <div className="bg-gradient-to-r from-green-400 to-green-500 p-8 rounded-3xl text-white text-center mb-8">
            <h3 className="text-3xl font-bold mb-4">📱 Agende pelo WhatsApp!</h3>
            <p className="text-lg mb-6">Clique no botão e preencha as informações para agendar seu horário</p>
            <CustomButton 
              variant="ghost" 
              size="lg"
              onClick={() => setIsModalOpen(true)}
              className="bg-white text-green-500 hover:bg-gray-100"
            >
              <Phone className="w-5 h-5 mr-2" />
              Agendar Agora
            </CustomButton>
          </div>

          {/* Contact Information */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/80 p-6 rounded-2xl shadow-lg">
              <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <MapPin className="w-5 h-5 text-[#A78BFA] mr-2" />
                📍 Nosso Endereço
              </h4>
              <p className="text-gray-600">{config.salonAddress}</p>
            </div>
            <div className="bg-white/80 p-6 rounded-2xl shadow-lg">
              <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Clock className="w-5 h-5 text-[#93C5FD] mr-2" />
                ⏰ Horários
              </h4>
              <p className="text-gray-600">
                Atendimento Domiciliar:<br />
                Segunda e Terça<br />
                <span className="text-sm italic">(Consulte disponibilidade)</span>
              </p>
            </div>
          </div>
        </GradientCard>
      </section>
      {/* Footer */}
      <footer className="relative z-10 py-8">
        <div className="bg-white/90 backdrop-blur-sm rounded-t-3xl mx-4 p-6">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <p className="text-gray-600 mb-2">
                💜 Feito com carinho pela <strong>Tia Déa</strong>
              </p>
              <p className="text-gray-500 text-[12px]">Tia Déa - Transformando cortes em momentos mágicos ✨</p>
            </div>
            <div className="ml-4">
              <Link href="/login">
                <CustomButton variant="primary" size="md" className="text-[12px] font-extrabold">
                  <Lock className="w-4 h-4 mr-2" />
                  Admin
                </CustomButton>
              </Link>
            </div>
          </div>
        </div>
      </footer>
      {/* Scheduling Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              📝 Dados para Agendamento
            </DialogTitle>
            <p className="text-center text-gray-600 text-sm">
              Preencha os dados abaixo para enviar via WhatsApp
            </p>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="responsibleName">👤 Nome do Responsável</Label>
              <Input
                id="responsibleName"
                name="responsibleName"
                value={formData.responsibleName}
                onChange={handleInputChange}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="childName">👶 Nome da Criança</Label>
              <Input
                id="childName"
                name="childName"
                value={formData.childName}
                onChange={handleInputChange}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="address">🏠 Endereço Completo</Label>
              <Textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                className="mt-1"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="birthdate">🎂 Data de Aniversário</Label>
              <Input
                id="birthdate"
                name="birthdate"
                type="date"
                value={formData.birthdate}
                onChange={handleInputChange}
                required
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="preferredDate">📅 Data Preferida</Label>
                <Input
                  id="preferredDate"
                  name="preferredDate"
                  type="date"
                  value={formData.preferredDate}
                  onChange={handleInputChange}
                  required
                  className="mt-1"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <Label htmlFor="preferredTime">⏰ Horário Preferido</Label>
                <div className="relative mt-1">
                  <Input
                    id="preferredTime"
                    name="preferredTime"
                    type="text"
                    placeholder="__:__"
                    value={formData.preferredTime}
                    onChange={(e) => {
                      let value = e.target.value.replace(/[^\d]/g, '');
                      if (value.length >= 3) {
                        value = value.slice(0, 2) + ':' + value.slice(2, 4);
                      }
                      if (value.length <= 5) {
                        setFormData(prev => ({ ...prev, preferredTime: value }));
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && formData.preferredTime.endsWith(':')) {
                        e.preventDefault();
                        setFormData(prev => ({ ...prev, preferredTime: prev.preferredTime.slice(0, -2) }));
                      }
                    }}
                    required
                    className="text-center font-mono text-lg tracking-wider"
                    maxLength={5}
                    pattern="^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$"
                    title="Digite o horário no formato HH:MM"
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-gray-400 font-mono text-lg">
                    <span className={`${formData.preferredTime.length < 2 ? 'opacity-100' : 'opacity-0'}`}>
                      __:__
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <CustomButton 
                type="button" 
                variant="ghost" 
                onClick={() => setIsModalOpen(false)}
                className="inline-flex items-center justify-center rounded-full duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-gradient-to-r from-[#A78BFA] to-[#93C5FD] hover:opacity-90 focus:ring-purple-500 px-6 py-3 shadow-lg hover:shadow-xl transition-shadow text-[12px] font-extrabold text-[#1f2937]"
              >
                Cancelar
              </CustomButton>
              <CustomButton type="submit" variant="primary" className="flex-1">
                <Phone className="w-4 h-4 mr-2" />
                Enviar
              </CustomButton>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}