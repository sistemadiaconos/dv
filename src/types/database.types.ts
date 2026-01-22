export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            participantes: {
                Row: {
                    id: string
                    nome: string
                    telefone: string | null
                    encargo?: string | null
                    departamento?: string | null
                    data_criacao: string
                    ativo: boolean
                }
                Insert: {
                    id?: string
                    nome: string
                    telefone?: string | null
                    encargo?: string | null
                    departamento?: string | null
                    data_criacao?: string
                    ativo?: boolean
                }
                Update: {
                    id?: string
                    nome?: string
                    telefone?: string | null
                    encargo?: string | null
                    departamento?: string | null
                    data_criacao?: string
                    ativo?: boolean
                }
            }
            reunioes: {
                Row: {
                    id: string
                    titulo: string
                    data: string
                    hora: string
                    local: string | null
                    descricao: string | null
                    status: 'Agendada' | 'Em Andamento' | 'Encerrada'
                    data_criacao: string
                    criado_por: string | null
                }
                Insert: {
                    id?: string
                    titulo: string
                    data: string
                    hora: string
                    local?: string | null
                    descricao?: string | null
                    status?: 'Agendada' | 'Em Andamento' | 'Encerrada'
                    data_criacao?: string
                    criado_por?: string | null
                }
                Update: {
                    id?: string
                    titulo?: string
                    data?: string
                    hora?: string
                    local?: string | null
                    descricao?: string | null
                    status?: 'Agendada' | 'Em Andamento' | 'Encerrada'
                    data_criacao?: string
                    criado_por?: string | null
                }
            }
            confirmacoes: {
                Row: {
                    id: string
                    id_participante: string
                    id_reuniao: string
                    presenca: 'Confirmado' | 'Ausente' | 'Pendente'
                    justificativa: string | null
                    data_confirmacao: string
                    ip_origem: string | null
                    editado_em: string | null
                }
                Insert: {
                    id?: string
                    id_participante: string
                    id_reuniao: string
                    presenca?: 'Confirmado' | 'Ausente' | 'Pendente'
                    justificativa?: string | null
                    data_confirmacao?: string
                    ip_origem?: string | null
                    editado_em?: string | null
                }
                Update: {
                    id?: string
                    id_participante?: string
                    id_reuniao?: string
                    presenca?: 'Confirmado' | 'Ausente' | 'Pendente'
                    justificativa?: string | null
                    data_confirmacao?: string
                    ip_origem?: string | null
                    editado_em?: string | null
                }
            }
        }
    }
}
