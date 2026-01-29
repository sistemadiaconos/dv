import { supabase } from "../lib/supabase";
import type { Database } from "../types/database.types";

export type Participante = Database['public']['Tables']['participantes']['Row'];

export const participantService = {
    async searchParticipants(query: string): Promise<Participante[]> {
        if (!query || query.length < 3) return [];

        const { data, error } = await supabase
            .from('participantes')
            .select('*')
            .or(`nome.ilike.%${query}%,telefone.ilike.%${query}%`)
            .limit(5);

        if (error) {
            console.error('Error searching participants:', error);
            return [];
        }

        return data || [];
    },

    async checkPhoneExists(telefone: string): Promise<boolean> {
        const { count, error } = await supabase
            .from('participantes')
            .select('*', { count: 'exact', head: true })
            .eq('telefone', telefone);

        if (error) {
            console.error('Error checking phone:', error);
            return false;
        }

        return (count || 0) > 0;
    },

    async getParticipantById(id: string): Promise<Participante | null> {
        const { data, error } = await supabase
            .from('participantes')
            .select('*')
            .eq('id', id)
            .single();

        if (error) return null;
        return data;
    },

    async createBulk(participantes: Database['public']['Tables']['participantes']['Insert'][]) {
        const { data, error } = await supabase
            .from('participantes')
            .insert(participantes)
            .select();

        if (error) throw error;
        return data;
    },

    async updateParticipant(id: string, updates: Partial<Database['public']['Tables']['participantes']['Update']>) {
        const { data, error } = await supabase
            .from('participantes')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deleteParticipant(id: string) {
        // Delete related confirmations first
        await supabase
            .from('confirmacoes')
            .delete()
            .eq('id_participante', id);

        const { error } = await supabase
            .from('participantes')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    },

    async deleteAll() {
        // First delete all confirmations to avoid foreign key constraints
        await supabase
            .from('confirmacoes')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000');

        // Then delete all participants
        const { error } = await supabase
            .from('participantes')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000');

        if (error) throw error;
        return true;
    }
};
