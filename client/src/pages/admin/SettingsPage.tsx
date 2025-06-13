import React, { useState } from 'react';
import { Settings, Save, User, MapPin, Phone, Instagram, Clock, Lock } from 'lucide-react';
import { CustomButton, SectionHeader } from '../../components/ui-custom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Switch } from '../../components/ui/switch';
import { Checkbox } from '../../components/ui/checkbox';
import { useApp } from '../../contexts/AppContext';
import { DAYS_OF_WEEK } from '../../constants';

export default function SettingsPage() {
  const { config, updateConfig, theme, toggleTheme, showNotification } = useApp();
  const [formData, setFormData] = useState(config);
  const [hasChanges, setHasChanges] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    updateConfig(formData);
    setHasChanges(false);
    showNotification('Configurações salvas com sucesso!', 'success');
  };

  const handleReset = () => {
    setFormData(config);
    setHasChanges(false);
    showNotification('Alterações descartadas', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <SectionHeader
        title="Configurações"
        emoji="⚙️"
        description="Personalize as configurações do sistema"
      />

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Informações do Profissional
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="stylistName">Nome do Profissional</Label>
            <Input
              id="stylistName"
              value={formData.stylistName}
              onChange={(e) => handleInputChange('stylistName', e.target.value)}
              placeholder="Seu nome profissional"
            />
          </div>

          <div>
            <Label htmlFor="serviceDescription">Descrição do Serviço</Label>
            <Textarea
              id="serviceDescription"
              value={formData.serviceDescription}
              onChange={(e) => handleInputChange('serviceDescription', e.target.value)}
              placeholder="Descreva seus serviços..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Informações de Contato
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="whatsAppNumber">Número do WhatsApp</Label>
            <Input
              id="whatsAppNumber"
              value={formData.whatsAppNumber}
              onChange={(e) => handleInputChange('whatsAppNumber', e.target.value)}
              placeholder="5511999999999"
            />
            <p className="text-xs text-gray-500 mt-1">
              Formato: código do país + DDD + número (sem espaços ou símbolos)
            </p>
          </div>

          <div>
            <Label htmlFor="instagramUrl">Instagram</Label>
            <Input
              id="instagramUrl"
              value={formData.instagramUrl}
              onChange={(e) => handleInputChange('instagramUrl', e.target.value)}
              placeholder="https://instagram.com/seu_perfil"
            />
          </div>

          <div>
            <Label htmlFor="salonAddress">Endereço do Salão</Label>
            <Textarea
              id="salonAddress"
              value={formData.salonAddress}
              onChange={(e) => handleInputChange('salonAddress', e.target.value)}
              placeholder="Endereço completo do seu salão..."
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Service Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Configurações de Atendimento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-base font-medium">Dias de Atendimento Domiciliar</Label>
            <p className="text-sm text-gray-600 mb-3">
              Selecione os dias da semana em que você atende em domicílio
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {DAYS_OF_WEEK.map((day, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Checkbox
                    id={`day-${index}`}
                    checked={formData.homeServiceDays.includes(index)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        handleInputChange('homeServiceDays', [...formData.homeServiceDays, index]);
                      } else {
                        handleInputChange('homeServiceDays', formData.homeServiceDays.filter(d => d !== index));
                      }
                    }}
                  />
                  <Label htmlFor={`day-${index}`} className="text-sm">
                    {day}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Configurações de Segurança
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="adminPassword">Senha do Administrador</Label>
            <Input
              id="adminPassword"
              type="password"
              value={formData.adminPassword}
              onChange={(e) => handleInputChange('adminPassword', e.target.value)}
              placeholder="Nova senha"
            />
            <p className="text-xs text-gray-500 mt-1">
              Deixe em branco para manter a senha atual
            </p>
          </div>
        </CardContent>
      </Card>



      {/* Save Actions */}
      {hasChanges && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-orange-800">
                <Settings className="w-4 h-4" />
                <span className="font-medium">Você tem alterações não salvas</span>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <CustomButton
                  variant="outline"
                  onClick={handleReset}
                  className="flex-1 sm:flex-none"
                >
                  Descartar
                </CustomButton>
                <CustomButton
                  onClick={handleSave}
                  className="flex-1 sm:flex-none"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </CustomButton>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Information Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h3 className="font-semibold text-blue-800 mb-2">💡 Dicas de Configuração</h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p>• <strong>WhatsApp:</strong> Use o formato internacional completo (55 + DDD + número)</p>
            <p>• <strong>Dias de atendimento:</strong> Configure os dias que você atende em domicílio</p>
            <p>• <strong>Senha:</strong> Use uma senha forte para proteger o painel administrativo</p>
            <p>• <strong>Instagram:</strong> Link completo do seu perfil para divulgação</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}