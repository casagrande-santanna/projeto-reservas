// src/utils/formatters.js
// Funções para formatar dados

export const formatters = {
  // Formatar data (YYYY-MM-DD para DD/MM/YYYY)
  formatDate(dateStr) {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('pt-BR');
    } catch {
      return dateStr;
    }
  },

  // Formatar horário (HH:MM)
  formatTime(timeStr) {
    if (!timeStr) return '';
    return timeStr.slice(0, 5);
  },

  // Formatar data e hora
  formatDateTime(dateStr, timeStr) {
    if (!dateStr || !timeStr) return '';
    return `${this.formatDate(dateStr)} ${this.formatTime(timeStr)}`;
  },

  // Formatar diferença de tempo (x dias atrás, x horas atrás, etc)
  formatRelativeTime(date) {
    if (!date) return '';
    
    const now = new Date();
    const diff = now - new Date(date);
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'agora mesmo';
    if (minutes < 60) return `${minutes}min atrás`;
    if (hours < 24) return `${hours}h atrás`;
    if (days < 7) return `${days}d atrás`;
    return this.formatDate(date);
  },

  // Formatar duração (minutos para "1h 30min")
  formatDuration(minutes) {
    if (!minutes) return '0min';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) return `${mins}min`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}min`;
  },

  // Formatar moeda (BRL)
  formatCurrency(value) {
    if (!value && value !== 0) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  },

  // Formatar número com separador de milhar
  formatNumber(value) {
    if (!value && value !== 0) return '0';
    return new Intl.NumberFormat('pt-BR').format(value);
  },

  // Formatar porcentagem
  formatPercentage(value, decimals = 1) {
    if (!value && value !== 0) return '0%';
    return `${parseFloat(value).toFixed(decimals)}%`;
  },

  // Formatar telefone
  formatPhone(phone) {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
    }
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
    return phone;
  },

  // Formatar CPF
  formatCPF(cpf) {
    if (!cpf) return '';
    const cleaned = cpf.replace(/\D/g, '');
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
  },

  // Capitalizar primeira letra
  capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  // Truncar texto
  truncate(text, length = 50) {
    if (!text) return '';
    return text.length > length ? `${text.slice(0, length)}...` : text;
  },

  // Formatar nome de usuário (apenas iniciais maiúsculas)
  formatName(name) {
    if (!name) return '';
    return name
      .split(' ')
      .map(word => this.capitalize(word))
      .join(' ');
  },

  // Formatar status em português
  formatStatus(status) {
    const statusMap = {
      'confirmada': '✅ Confirmada',
      'pendente': '⏳ Pendente',
      'cancelada': '❌ Cancelada',
      'expirada': '⚠️ Expirada',
      'ativo': '🟢 Ativo',
      'inativo': '🔴 Inativo',
      'suspenso': '🚫 Suspenso',
      'admin': '👨‍💼 Admin',
      'morador': '👤 Morador',
    };
    return statusMap[status] || status;
  },

  // Formatar intervalo de horário
  formatTimeRange(inicio, fim) {
    return `${this.formatTime(inicio)} - ${this.formatTime(fim)}`;
  },

  // Formatar intervalo de datas
  formatDateRange(dataInicio, dataFim) {
    return `${this.formatDate(dataInicio)} a ${this.formatDate(dataFim)}`;
  },
};