
import { supabase } from '../lib/supabase';
import { Client, Appointment, AppConfig } from '../types';

// Client operations
export const clientService = {
  async getAll(): Promise<Client[]> {
    const { data, error } = await supabase
      .from('salao_clients')
      .select('*')
      .order('child_name');
    
    if (error) throw error;
    
    return data.map(client => ({
      id: client.id,
      childName: client.child_name,
      responsibleName: client.responsible_name,
      address: client.address,
      birthdate: client.birthdate,
      phone: client.phone,
      email: client.email,
      lastServiceDate: client.last_service_date,
      notes: client.notes,
      serviceCount: client.service_count,
      serviceType: client.service_type
    }));
  },

  async create(client: Omit<Client, 'id'>): Promise<Client> {
    const { data, error } = await supabase
      .from('salao_clients')
      .insert({
        child_name: client.childName,
        responsible_name: client.responsibleName,
        address: client.address,
        birthdate: client.birthdate,
        phone: client.phone,
        email: client.email,
        notes: client.notes,
        service_count: client.serviceCount,
        service_type: client.serviceType
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      childName: data.child_name,
      responsibleName: data.responsible_name,
      address: data.address,
      birthdate: data.birthdate,
      phone: data.phone,
      email: data.email,
      lastServiceDate: data.last_service_date,
      notes: data.notes,
      serviceCount: data.service_count,
      serviceType: data.service_type
    };
  },

  async update(id: string, client: Partial<Client>): Promise<Client> {
    const { data, error } = await supabase
      .from('salao_clients')
      .update({
        child_name: client.childName,
        responsible_name: client.responsibleName,
        address: client.address,
        birthdate: client.birthdate,
        phone: client.phone,
        email: client.email,
        notes: client.notes,
        service_count: client.serviceCount,
        service_type: client.serviceType
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      childName: data.child_name,
      responsibleName: data.responsible_name,
      address: data.address,
      birthdate: data.birthdate,
      phone: data.phone,
      email: data.email,
      lastServiceDate: data.last_service_date,
      notes: data.notes,
      serviceCount: data.service_count,
      serviceType: data.service_type
    };
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('salao_clients')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// Appointment operations
export const appointmentService = {
  async getAll(): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from('salao_appointments')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) throw error;
    
    return data.map(appointment => ({
      id: appointment.id,
      clientName: appointment.client_name,
      date: `${appointment.date} ${appointment.time || ''}`.trim(),
      location: appointment.location,
      status: appointment.status,
      notes: appointment.notes,
      serviceValue: appointment.service_value
    }));
  },

  async create(appointment: Omit<Appointment, 'id'>): Promise<Appointment> {
    // Split date and time
    const [date, time] = appointment.date.split(' ');
    
    const { data, error } = await supabase
      .from('salao_appointments')
      .insert({
        client_name: appointment.clientName,
        date: date,
        time: time,
        location: appointment.location,
        status: appointment.status,
        notes: appointment.notes,
        service_value: appointment.serviceValue
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      clientName: data.client_name,
      date: `${data.date} ${data.time || ''}`.trim(),
      location: data.location,
      status: data.status,
      notes: data.notes,
      serviceValue: data.service_value
    };
  },

  async update(id: string, appointment: Partial<Appointment>): Promise<Appointment> {
    const updateData: any = {};
    
    if (appointment.clientName) updateData.client_name = appointment.clientName;
    if (appointment.date) {
      const [date, time] = appointment.date.split(' ');
      updateData.date = date;
      updateData.time = time;
    }
    if (appointment.location) updateData.location = appointment.location;
    if (appointment.status) updateData.status = appointment.status;
    if (appointment.notes !== undefined) updateData.notes = appointment.notes;
    if (appointment.serviceValue !== undefined) updateData.service_value = appointment.serviceValue;

    const { data, error } = await supabase
      .from('salao_appointments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      clientName: data.client_name,
      date: `${data.date} ${data.time || ''}`.trim(),
      location: data.location,
      status: data.status,
      notes: data.notes,
      serviceValue: data.service_value
    };
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('salao_appointments')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// Gallery operations
export const galleryService = {
  async uploadImage(file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `gallery/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('salon-gallery')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('salon-gallery')
      .getPublicUrl(filePath);

    return data.publicUrl;
  },

  async getImages(): Promise<string[]> {
    const { data, error } = await supabase.storage
      .from('salon-gallery')
      .list('gallery');

    if (error) throw error;

    const urls = data.map(file => {
      const { data } = supabase.storage
        .from('salon-gallery')
        .getPublicUrl(`gallery/${file.name}`);
      return data.publicUrl;
    });

    return urls.filter(url => url);
  },

  async deleteImage(url: string): Promise<void> {
    const fileName = url.split('/').pop();
    if (!fileName) throw new Error('Invalid URL');

    const { error } = await supabase.storage
      .from('salon-gallery')
      .remove([`gallery/${fileName}`]);

    if (error) throw error;
  }
};

// Config operations
export const configService = {
  async getConfig(): Promise<AppConfig> {
    const { data, error } = await supabase
      .from('salao_app_config')
      .select('*');
    
    if (error) throw error;
    
    const config: any = {};
    data.forEach(item => {
      let value = item.value;
      
      // Parse JSON values
      if (item.key === 'home_service_days') {
        try {
          value = JSON.parse(value);
        } catch {
          value = [1, 2];
        }
      }
      
      config[item.key] = value;
    });

    // Load gallery images
    let galleryImages: string[] = [];
    try {
      const { data: files, error: storageError } = await supabase.storage
        .from('salon-gallery')
        .list('gallery');

      if (!storageError && files) {
        galleryImages = files.map(file => {
          const { data } = supabase.storage
            .from('salon-gallery')
            .getPublicUrl(`gallery/${file.name}`);
          return data.publicUrl;
        }).filter(url => url);
      }
    } catch (error) {
      console.error('Erro ao carregar imagens da galeria:', error);
    }

    return {
      stylistName: config.stylist_name || 'Tia Déa',
      serviceDescription: config.service_description || 'Cortes mágicos para crianças!',
      homeServiceDays: config.home_service_days || [1, 2],
      salonAddress: config.salon_address || 'Salvador, Bahia',
      whatsAppNumber: config.whatsapp_number || '5571988624093',
      instagramUrl: config.instagram_url || 'https://instagram.com/tiadeacorteinfantil',
      adminPassword: config.admin_password || '1234',
      galleryImages
    };
  },

  async updateConfig(newConfig: Partial<AppConfig>): Promise<void> {
    const updates = [];

    for (const [key, value] of Object.entries(newConfig)) {
      const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      let dbValue = value;
      
      if (Array.isArray(value)) {
        dbValue = JSON.stringify(value);
      }

      updates.push({
        key: dbKey,
        value: String(dbValue)
      });
    }

    for (const update of updates) {
      const { error } = await supabase
        .from('salao_app_config')
        .upsert(update, { onConflict: 'key' });

      if (error) throw error;
    }
  }
};
