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

const salonImages = [
  'https://images.unsplash.com/photo-1560472355-536de3962603?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400',
  'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400',
  'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400'
];

interface SchedulingFormData {
  responsibleName: string;
  childName: string;
  address: string;
  birthdate: string;
}

export default function LandingPage() {
  const { config } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<SchedulingFormData>({
    responsibleName: '',
    childName: '',
    address: '',
    birthdate: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const message = `Olá Tia Déa, gostaria de agendar um corte com você. Segue as informações:

Nome do responsável: ${formData.responsibleName}
Nome da criança: ${formData.childName}
Endereço: ${formData.address}
Data de nascimento: ${formData.birthdate}`;

    const whatsappLink = getWhatsAppLink('5571988624093', message);
    window.open(whatsappLink, '_blank');
    setIsModalOpen(false);
    
    // Reset form
    setFormData({
      responsibleName: '',
      childName: '',
      address: '',
      birthdate: ''
    });
  };

  return (
    <div className="min-h-screen gradient-bg">
      <FloatingDecorations />
      
      {/* Navigation Header */}
      <nav className="relative z-10 bg-white/90 backdrop-blur-sm shadow-lg rounded-b-3xl mx-4 mt-4">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-[#A78BFA] to-[#93C5FD] rounded-full flex items-center justify-center text-white text-xl">
                <ScissorsIcon />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-[#A78BFA] to-[#93C5FD] bg-clip-text text-transparent">
                  Tia Déa | Salão Móvel Infantil
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-3">
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
              <Link href="/login">
                <CustomButton variant="primary" size="md">
                  <Lock className="w-4 h-4 mr-2" />
                  Admin
                </CustomButton>
              </Link>
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
          
          <div className="bg-gradient-to-r from-[#A78BFA] to-[#93C5FD] text-white p-4 rounded-2xl mb-6">
            <p className="text-lg font-semibold text-center">
              🏠 Atendimento a Domicílio: Segunda, Terça e Quarta (consulte disponibilidade)
            </p>
          </div>

          {/* Image Gallery */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-center mb-6 text-gray-800">📸 Nossa Galeria Encantada</h3>
            <ImageCarousel images={salonImages} />
          </div>

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
                Segunda, Terça e Quarta<br />
                <span className="text-sm italic">(Consulte disponibilidade)</span>
              </p>
            </div>
          </div>
        </GradientCard>
      </section>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8">
        <div className="bg-white/90 backdrop-blur-sm rounded-t-3xl mx-4 p-6">
          <p className="text-gray-600 mb-2">
            💜 Feito com carinho pela <strong>Tia Déa</strong>
          </p>
          <p className="text-sm text-gray-500">
            Salão Infantil Encantado - Transformando sorrisos, um corte por vez! ✨
          </p>
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
            
            <div className="flex space-x-3 pt-4">
              <CustomButton 
                type="button" 
                variant="ghost" 
                onClick={() => setIsModalOpen(false)}
                className="flex-1"
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
