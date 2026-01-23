import { supabase } from "../lib/supabase";

export interface AppSettings {
    id: string;
    app_name: string;
    logo_url: string | null;
    registration_open: boolean;
}

export interface Departamento {
    id: string;
    nome: string;
    ativo: boolean;
}

export const settingsService = {
    // --- App Settings ---
    async getSettings(): Promise<AppSettings | null> {
        const { data, error } = await supabase
            .from('app_settings')
            .select('*')
            .single();

        if (error) {
            console.error('Error fetching settings:', error);
            // Return default fallback if not found
            return {
                id: 'default',
                app_name: 'Sistema MVP',
                logo_url: null,
                registration_open: true
            };
        }
        return data;
    },

    async updateLogo(url: string) {
        // ID is fixed for single tenant MVP
        const id = '00000000-0000-0000-0000-000000000001';
        const { error } = await supabase
            .from('app_settings')
            .upsert({ id, logo_url: url }) // Upsert ensures it creates if missing
            .eq('id', id);

        if (error) throw error;
        return true;
    },

    async uploadLogoFile(file: File): Promise<string> {
        const fileExt = file.name.split('.').pop();
        const fileName = `logo-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('logos')
            .upload(filePath, file);

        if (uploadError) {
            throw uploadError;
        }

        const { data } = supabase.storage
            .from('logos')
            .getPublicUrl(filePath);

        return data.publicUrl;
    },

    // --- Departments ---
    async getDepartments(): Promise<Departamento[]> {
        const { data, error } = await supabase
            .from('departamentos')
            .select('*')
            .eq('ativo', true)
            .order('nome', { ascending: true });

        if (error) {
            console.error('Error fetching departments:', error);
            return [];
        }
        return data || [];
    },

    async addDepartment(nome: string) {
        const { data, error } = await supabase
            .from('departamentos')
            .insert([{ nome }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async removeDepartment(id: string) {
        // Soft delete (set active = false) or hard delete?
        // Let's do hard delete for now to keep it simple, or soft if they want history.
        // Given constraints, hard delete might fail if used. Let's try soft delete typically, 
        // but for this MVP user asked to "edit/remove". Let's do DELETE and handle error if used.
        const { error } = await supabase
            .from('departamentos')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    },

    async getUsersList() {
        const { data, error } = await supabase.rpc('get_users_list');
        if (error) throw error;
        return data as { id: string; email: string; created_at: string; last_sign_in_at: string }[];
    }
};
