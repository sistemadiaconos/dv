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
        const [
            { count: total },
            { count: confirmed },
            { count: absent },
            { count: pending },
            { count: checkins },
            { data: recentCheckins },
            { data: recentAbsences },
            { data: recentConfirmations }
        ] = await Promise.all([
            // Counts (Lightweight)
            supabase.from('confirmacoes').select('*', { count: 'exact', head: true }).eq('id_reuniao', meetingId),
            supabase.from('confirmacoes').select('*', { count: 'exact', head: true }).eq('id_reuniao', meetingId).eq('presenca', 'Confirmado'),
            supabase.from('confirmacoes').select('*', { count: 'exact', head: true }).eq('id_reuniao', meetingId).eq('presenca', 'Ausente'),
            supabase.from('confirmacoes').select('*', { count: 'exact', head: true }).eq('id_reuniao', meetingId).eq('presenca', 'Pendente'),
            supabase.from('confirmacoes').select('*', { count: 'exact', head: true }).eq('id_reuniao', meetingId).not('checkin_em', 'is', null),

            // Lists (Limited)
            supabase.from('confirmacoes')
                .select('*, participantes (nome, departamento)')
                .eq('id_reuniao', meetingId)
                .not('checkin_em', 'is', null)
                .order('checkin_em', { ascending: false })
                .limit(10),

            supabase.from('confirmacoes')
                .select('*, participantes (nome, departamento)')
                .eq('id_reuniao', meetingId)
                .eq('presenca', 'Ausente')
                .limit(5),

            supabase.from('confirmacoes')
                .select('*, participantes (nome, departamento)')
                .eq('id_reuniao', meetingId)
                .eq('presenca', 'Confirmado')
                .is('checkin_em', null)
                .order('data_confirmacao', { ascending: false })
                .limit(5)
        ]);

        return {
            total: total || 0,
            confirmed: confirmed || 0,
            absent: absent || 0,
            pending: pending || 0,
            checkins: checkins || 0,
            recentCheckins: recentCheckins || [],
            recentAbsences: recentAbsences || [],
            recentConfirmations: recentConfirmations || [],
            confirmations: [] // Deprecated: Returning empty to signal optimized mode
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
