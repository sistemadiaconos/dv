import { supabase } from "../lib/supabase";
import { normalizePhone } from "../lib/utils";

export interface TelefoneAutorizado {
    id: string;
    celular: string;
    created_at: string;
}

export const authorizationService = {
    async getAuthorizedPhones(): Promise<TelefoneAutorizado[]> {
        const { data, error } = await supabase
            .from('telefones_autorizados')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching authorized phones:', error);
            return [];
        }
        return data || [];
    },

    async addPhone(celular: string) {
        // Normalize phone number (enforce 11 digits)
        const cleaned = normalizePhone(celular);
        const { data, error } = await supabase
            .from('telefones_autorizados')
            .insert([{ celular: cleaned }])
            .select();

        if (error) throw error;
        return data?.[0];
    },

    async bulkAddPhones(celulares: string[]) {
        const cleanedList = celulares
            .map(c => normalizePhone(c))
            .filter(c => c.length >= 10);

        // Remove duplicates within the list itself to avoid "ON CONFLICT" errors with the same row twice
        const uniqueList = [...new Set(cleanedList)];

        if (uniqueList.length === 0) return [];

        const inserts = uniqueList.map(celular => ({ celular }));

        const { data, error } = await supabase
            .from('telefones_autorizados')
            .upsert(inserts, { onConflict: 'celular' })
            .select();

        if (error) throw error;
        return data || [];
    },

    async updatePhone(id: string, celular: string) {
        const cleaned = normalizePhone(celular);
        const { error } = await supabase
            .from('telefones_autorizados')
            .update({ celular: cleaned })
            .eq('id', id);

        if (error) throw error;
        return true;
    },

    async deletePhone(id: string) {
        const { error } = await supabase
            .from('telefones_autorizados')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    },

    async checkPhone(celular: string): Promise<boolean> {
        const cleaned = normalizePhone(celular);
        if (cleaned.length < 10) return false;

        const { data, error } = await supabase
            .from('telefones_autorizados')
            .select('id')
            .eq('celular', cleaned)
            .maybeSingle();

        if (error) return false;
        return !!data;
    },

    async deleteAllPhones() {
        const { error } = await supabase
            .from('telefones_autorizados')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Dummy condition to delete all

        if (error) throw error;
        return true;
    }
};
