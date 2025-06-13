import React, { useState } from 'react';
import { Scissors, Plus, Edit, Trash2, Calendar } from 'lucide-react';
import { GradientCard, SectionHeader, CustomButton } from '../../components/ui-custom';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { LOCAL_STORAGE_KEYS } from '../../constants';
import { TesourinhaEntry } from '../../types';
import { formatDate, generateId, getTodayDateString } from '../../utils/helpers';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface EntryFormData {
  date: string;
  note: string;
}

const defaultFormData: EntryFormData = {
  date: getTodayDateString(),
  note: ''
};

export default function TesourinhaPage() {
  const [entries, setEntries] = useLocalStorage<TesourinhaEntry[]>(LOCAL_STORAGE_KEYS.TESOURINHA_KEY, []);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TesourinhaEntry | null>(null);
  const [formData, setFormData] = useState<EntryFormData>(defaultFormData);

  // Sort entries by date (most recent first)
  const sortedEntries = [...entries].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.note.trim()) {
      return;
    }

    const entryData: TesourinhaEntry = {
      id: editingEntry?.id || generateId(),
      date: formData.date,
      note: formData.note.trim()
    };

    if (editingEntry) {
      setEntries(prev => prev.map(entry => 
        entry.id === editingEntry.id ? entryData : entry
      ));
    } else {
      setEntries(prev => [...prev, entryData]);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData(defaultFormData);
    setEditingEntry(null);
    setIsModalOpen(false);
  };

  const editEntry = (entry: TesourinhaEntry) => {
    setFormData({
      date: entry.date,
      note: entry.note
    });
    setEditingEntry(entry);
    setIsModalOpen(true);
  };

  const deleteEntry = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta anotação?')) {
      setEntries(prev => prev.filter(entry => entry.id !== id));
    }
  };

  // Group entries by month for better organization
  const groupedEntries = sortedEntries.reduce((groups, entry) => {
    const monthKey = entry.date.substring(0, 7); // YYYY-MM
    if (!groups[monthKey]) {
      groups[monthKey] = [];
    }
    groups[monthKey].push(entry);
    return groups;
  }, {} as Record<string, TesourinhaEntry[]>);

  const formatMonthYear = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  const getEntryStats = () => {
    const today = getTodayDateString();
    const thisMonth = today.substring(0, 7);
    
    const todayEntries = entries.filter(entry => entry.date === today).length;
    const thisMonthEntries = entries.filter(entry => entry.date.startsWith(thisMonth)).length;
    
    return { todayEntries, thisMonthEntries, totalEntries: entries.length };
  };

  const stats = getEntryStats();

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Tesourinha Log"
        emoji="✂️"
        description="Anotações livres sobre serviços no salão"
      />

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GradientCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Anotações Hoje</p>
              <p className="text-3xl font-bold text-gray-800">{stats.todayEntries}</p>
            </div>
            <div className="text-3xl">📝</div>
          </div>
          <div className="mt-4">
            <Badge variant="secondary" className="text-xs">
              {getTodayDateString()}
            </Badge>
          </div>
        </GradientCard>

        <GradientCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Este Mês</p>
              <p className="text-3xl font-bold text-gray-800">{stats.thisMonthEntries}</p>
            </div>
            <Calendar className="w-8 h-8 text-[#93C5FD]" />
          </div>
          <div className="mt-4">
            <Badge variant="outline" className="text-xs">
              {new Date().toLocaleDateString('pt-BR', { month: 'long' })}
            </Badge>
          </div>
        </GradientCard>

        <GradientCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-3xl font-bold text-gray-800">{stats.totalEntries}</p>
            </div>
            <Scissors className="w-8 h-8 text-[#A78BFA]" />
          </div>
          <div className="mt-4">
            <Badge variant="outline" className="text-xs">
              Todas as anotações
            </Badge>
          </div>
        </GradientCard>
      </div>

      {/* Add New Entry */}
      <GradientCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800 flex items-center">
            <Scissors className="w-5 h-5 mr-2 text-[#A78BFA]" />
            📋 Anotações do Salão
          </h3>
          
          <CustomButton
            variant="primary"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Anotação
          </CustomButton>
        </div>

        {entries.length === 0 ? (
          <div className="text-center py-12">
            <Scissors className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Nenhuma anotação encontrada</p>
            <p className="text-gray-400 text-sm">
              Clique em "Nova Anotação" para começar a registrar atividades do salão
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedEntries).map(([monthKey, monthEntries]) => (
              <div key={monthKey}>
                <h4 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                  📅 {formatMonthYear(monthKey)}
                  <Badge variant="outline" className="ml-2 text-xs">
                    {monthEntries.length} anotaç{monthEntries.length === 1 ? 'ão' : 'ões'}
                  </Badge>
                </h4>
                
                <div className="space-y-4">
                  {monthEntries.map((entry) => (
                    <div key={entry.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {formatDate(entry.date)}
                            </Badge>
                            {entry.date === getTodayDateString() && (
                              <Badge variant="secondary" className="text-xs">
                                Hoje
                              </Badge>
                            )}
                          </div>
                          
                          <div className="bg-gray-50 border-l-4 border-[#A78BFA] p-3 rounded">
                            <p className="text-gray-700 whitespace-pre-wrap">{entry.note}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => editEntry(entry)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteEntry(entry.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </GradientCard>

      {/* Entry Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingEntry ? '✏️ Editar Anotação' : '📝 Nova Anotação'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="date">📅 Data</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                required
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="note">📝 Anotação</Label>
              <Textarea
                id="note"
                value={formData.note}
                onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                placeholder="Descreva o que aconteceu no salão hoje..."
                required
                className="mt-1"
                rows={6}
              />
              <p className="text-xs text-gray-500 mt-1">
                Registre cortes especiais, novos produtos utilizados, observações sobre clientes, etc.
              </p>
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
              <CustomButton 
                type="submit" 
                variant="primary" 
                className="flex-1"
                disabled={!formData.note.trim()}
              >
                {editingEntry ? 'Salvar Alterações' : 'Criar Anotação'}
              </CustomButton>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
