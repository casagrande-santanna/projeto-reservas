// src/modules/reservas.js
// Módulo de reservas - versão simplificada

export const reservasModule = {
  async obterDisponibilidade(espaco_id, data) {
    try {
      // Gerar horários disponíveis (06:00 até 22:00)
      const horarios = [];
      for (let h = 6; h < 22; h++) {
        horarios.push(`${String(h).padStart(2, '0')}:00`);
      }

      return {
        sucesso: true,
        data: data,
        espaco_id: espaco_id,
        totalDisponivel: horarios.length,
        disponibilidade: horarios.map(h => ({
          horario: h,
          disponivel: true,
        })),
      };
    } catch (error) {
      return {
        sucesso: false,
        mensagem: `Erro: ${error.message}`,
        disponibilidade: [],
      };
    }
  },
};