// src/modules/dashboard.js
// Módulo de Dashboard com estatísticas e visualizações

import { supabase } from '../config/supabase.js';
import { formatters } from '../utils/formatters.js';

export const dashboardModule = {
  // ========== OBTER ESTATÍSTICAS ==========
  async obterEstatisticas(unidade_id) {
    try {
      // Reservas confirmadas
      const { data: reservasConfirmadas } = await supabase
        .from('reservas')
        .select('id')
        .eq('unidade_id', unidade_id)
        .eq('status', 'confirmada');

      // Faltas do mês
      const mesAtual = new Date().toISOString().slice(0, 7);
      const { data: faltas } = await supabase
        .from('reservas')
        .select('id')
        .eq('unidade_id', unidade_id)
        .eq('status', 'expirada')
        .ilike('data_reserva', `${mesAtual}%`);

      // Taxa de ocupação
      const { data: totalReservas } = await supabase
        .from('reservas')
        .select('id')
        .eq('unidade_id', unidade_id);

      // Status do usuário
      const { data: usuario } = await supabase
        .from('moradores')
        .select('status, suspenso_ate')
        .eq('unidade_id', unidade_id)
        .single();

      return {
        sucesso: true,
        reservasAbertas: reservasConfirmadas?.length || 0,
        faltasMes: faltas?.length || 0,
        totalReservas: totalReservas?.length || 0,
        taxaOcupacao: totalReservas?.length ? Math.round((reservasConfirmadas?.length || 0) / totalReservas.length * 100) : 0,
        statusUsuario: usuario?.status || 'ativo',
        suspensoAte: usuario?.suspenso_ate || null,
      };
    } catch (error) {
      return {
        sucesso: false,
        mensagem: `Erro: ${error.message}`,
        reservasAbertas: 0,
        faltasMes: 0,
        totalReservas: 0,
        taxaOcupacao: 0,
      };
    }
  },

  // ========== OBTER PRÓXIMAS RESERVAS ==========
  async obterProximasReservas(unidade_id, limite = 5) {
    try {
      const hoje = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('reservas')
        .select(`
          id,
          data_reserva,
          slot_inicio,
          slot_fim,
          status,
          espacos:espaco_id(nome),
          modalidades:modalidade_id(nome)
        `)
        .eq('unidade_id', unidade_id)
        .eq('status', 'confirmada')
        .gte('data_reserva', hoje)
        .order('data_reserva', { ascending: true })
        .limit(limite);

      if (error) throw error;

      return {
        sucesso: true,
        reservas: (data || []).map(r => ({
          ...r,
          data_formatada: formatters.formatDate(r.data_reserva),
          horario: formatters.formatTimeRange(r.slot_inicio, r.slot_fim),
          espaco_nome: r.espacos?.nome || 'N/A',
          modalidade_nome: r.modalidades?.nome || 'N/A',
        })),
      };
    } catch (error) {
      return {
        sucesso: false,
        mensagem: `Erro: ${error.message}`,
        reservas: [],
      };
    }
  },

  // ========== OBTER DADOS PARA GRÁFICO ==========
  async obterDadosGrafico(unidade_id, tipo = 'ocupacao') {
    try {
      if (tipo === 'ocupacao') {
        // Horários mais usados
        const { data, error } = await supabase
          .from('reservas')
          .select('slot_inicio')
          .eq('unidade_id', unidade_id)
          .eq('status', 'confirmada');

        if (error) throw error;

        // Contar por hora
        const horarios = {};
        (data || []).forEach(r => {
          const hora = r.slot_inicio.split(':')[0];
          horarios[hora] = (horarios[hora] || 0) + 1;
        });

        // Formatar para gráfico
        const labels = Object.keys(horarios).sort();
        const valores = labels.map(h => horarios[h]);

        return {
          sucesso: true,
          labels: labels.map(h => `${h}:00`),
          datasets: [
            {
              label: 'Reservas por Hora',
              data: valores,
              backgroundColor: 'rgba(59, 130, 246, 0.5)',
              borderColor: 'rgba(59, 130, 246, 1)',
              borderWidth: 2,
            },
          ],
        };
      }

      if (tipo === 'diaria') {
        // Reservas por dia da semana
        const { data, error } = await supabase
          .from('reservas')
          .select('data_reserva')
          .eq('unidade_id', unidade_id)
          .eq('status', 'confirmada');

        if (error) throw error;

        // Contar por dia
        const dias = { 'Seg': 0, 'Ter': 0, 'Qua': 0, 'Qui': 0, 'Sex': 0, 'Sab': 0, 'Dom': 0 };
        const diasNomes = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

        (data || []).forEach(r => {
          const dia = new Date(r.data_reserva).getDay();
          dias[diasNomes[dia]]++;
        });

        return {
          sucesso: true,
          labels: Object.keys(dias),
          datasets: [
            {
              label: 'Reservas por Dia',
              data: Object.values(dias),
              backgroundColor: [
                'rgba(16, 185, 129, 0.5)',
                'rgba(59, 130, 246, 0.5)',
                'rgba(139, 92, 246, 0.5)',
                'rgba(245, 158, 11, 0.5)',
                'rgba(239, 68, 68, 0.5)',
                'rgba(34, 197, 94, 0.5)',
                'rgba(59, 130, 246, 0.5)',
              ],
              borderColor: [
                'rgba(16, 185, 129, 1)',
                'rgba(59, 130, 246, 1)',
                'rgba(139, 92, 246, 1)',
                'rgba(245, 158, 11, 1)',
                'rgba(239, 68, 68, 1)',
                'rgba(34, 197, 94, 1)',
                'rgba(59, 130, 246, 1)',
              ],
              borderWidth: 2,
            },
          ],
        };
      }

      return {
        sucesso: false,
        mensagem: 'Tipo de gráfico inválido',
      };
    } catch (error) {
      return {
        sucesso: false,
        mensagem: `Erro: ${error.message}`,
        labels: [],
        datasets: [],
      };
    }
  },

  // ========== OBTER RANKING ==========
  async obterRanking(limite = 10) {
    try {
      const { data, error } = await supabase
        .from('moradores')
        .select('id, nome, unidade_id')
        .limit(limite)
        .order('id');

      if (error) throw error;

      // Contar reservas por morador
      const ranking = await Promise.all((data || []).map(async (morador) => {
        const { data: reservas } = await supabase
          .from('reservas')
          .select('id')
          .eq('morador_id', morador.id)
          .eq('status', 'confirmada');

        return {
          ...morador,
          totalReservas: reservas?.length || 0,
        };
      }));

      // Ordenar por total de reservas
      ranking.sort((a, b) => b.totalReservas - a.totalReservas);

      return {
        sucesso: true,
        ranking: ranking.map((item, index) => ({
          posicao: index + 1,
          nome: item.nome,
          reservas: item.totalReservas,
          medal: index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '  ',
        })),
      };
    } catch (error) {
      return {
        sucesso: false,
        mensagem: `Erro: ${error.message}`,
        ranking: [],
      };
    }
  },
};