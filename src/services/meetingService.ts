import { supabase } from "../lib/supabase";
import type { Database } from "../types/database.types";

export type Reuniao = Database['public']['Tables']['reunioes']['Row'];
export type Confirmacao = Database['public']['Tables']['confirmacoes']['Row'];

export const meetingService = {
    async getActiveMeeting(): Promise<Reuniao | null> {
        const { data, error } = await supabase
            .from('reunioes')
            .select('*')
            .eq('status', 'Agendada')
            .order('data', { ascending: true })
            .limit(1)
            .single();

        if (error) {
            // If no rows found, it's not a critical error, just no meeting
            if (error.code === 'PGRST116') return null;
            console.error('Error searching meeting:', error);
            return null;
        }

        return data;
    },

    async confirmPresence(
        id_participante: string,
        id_reuniao: string,
        presenca: 'Confirmado' | 'Ausente',
        justificativa?: string
    ): Promise<{ success: boolean; error?: any }> {

        // Check if already confirmed (Upsert logic)
        const { error } = await supabase
            .from('confirmacoes')
            .upsert({
                id_participante,
                id_reuniao,
                presenca,
                justificativa: presenca === 'Ausente' ? justificativa : null,
                data_confirmacao: new Date().toISOString()
            }, { onConflict: 'id_participante,id_reuniao' });

        if (!error) {
            // MVP: Simulate Email Notification
            console.log(`[EMAIL-STUB] Sending confirmation email to participant ${id_participante} for meeting ${id_reuniao}. Status: ${presenca}`);
            if (presenca === 'Ausente' && justificativa) {
                console.log(`[EMAIL-STUB] Sending absence alert to admin. Reason: ${justificativa}`);
            }
        }

        if (error) {
            console.error('Error confirming:', error);
            return { success: false, error };
        }

        return { success: true };
    },

    async getMeetingStats(meetingId: string) {
        const { data: confirmations, error } = await supabase
            .from('confirmacoes')
            .select('*, participantes (nome, departamento)')
            .eq('id_reuniao', meetingId);

        if (error) return null;

        const total = confirmations.length;
        const confirmed = confirmations.filter(c => c.presenca === 'Confirmado').length;
        const absent = confirmations.filter(c => c.presenca === 'Ausente').length;
        const pending = confirmations.filter(c => c.presenca === 'Pendente').length;
        const checkins = confirmations.filter(c => (c as any).checkin_em).length; // Cast as any because checkin_em might not be in generated types yet

        return {
            total,
            confirmed,
            absent,
            pending,
            checkins,
            confirmations // Return raw data for detailed lists if needed
        };
    },

    async removeConfirmation(id: string) {
        const { error } = await supabase
            .from('confirmacoes')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    }
};
