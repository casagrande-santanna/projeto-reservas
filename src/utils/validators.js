// src/utils/validators.js
// Validadores de entrada para segurança

export const validators = {
  // Validar email
  isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email) && email.length <= 255;
  },

  // Validar telefone
  isValidPhone(phone) {
    const regex = /^[\d\s\-\+\(\)]+$/;
    return regex.test(phone) && phone.length >= 10 && phone.length <= 20;
  },

  // Validar data (DD/MM/YYYY ou YYYY-MM-DD)
  isValidDate(dateStr) {
    const date = new Date(dateStr);
    return date instanceof Date && !isNaN(date);
  },

  // Validar horário (HH:MM)
  isValidTime(timeStr) {
    const regex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    return regex.test(timeStr);
  },

  // Validar UUID
  isValidUUID(uuid) {
    const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return regex.test(uuid);
  },

  // Validar duração mínima (em minutos)
  isValidDuration(minutos) {
    return typeof minutos === 'number' && minutos >= 60 && minutos <= 240;
  },

  // Validar antecedência (em horas)
  isValidAntecedencia(horas) {
    return typeof horas === 'number' && horas >= 0 && horas <= 720;
  },

  // Validar nome (não vazio, sem caracteres especiais perigosos)
  isValidName(name) {
    if (!name || typeof name !== 'string') return false;
    if (name.length < 3 || name.length > 255) return false;
    
    // Permitir apenas letras, números, espaços e alguns caracteres
    const regex = /^[a-záéíóúâêôãõç\s\-\.\']+$/i;
    return regex.test(name);
  },

  // Validar descrição
  isValidDescription(desc) {
    if (!desc || typeof desc !== 'string') return false;
    return desc.length >= 5 && desc.length <= 1000;
  },

  // Sanitizar entrada (remover caracteres perigosos)
  sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    
    return input
      .trim()
      .slice(0, 1000) // Limite de caracteres
      .replace(/[<>\"']/g, ''); // Remove caracteres perigosos
  },

  // Validar intervalo de datas
  isValidDateRange(dataInicio, dataFim) {
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    return inicio < fim && !isNaN(inicio) && !isNaN(fim);
  },

  // Validar horário está dentro de intervalo
  isTimeInRange(hora, horaInicio, horaFim) {
    if (!this.isValidTime(hora) || !this.isValidTime(horaInicio) || !this.isValidTime(horaFim)) {
      return false;
    }
    return hora >= horaInicio && hora < horaFim;
  },

  // Validar inteiro positivo
  isPositiveInteger(value) {
    return Number.isInteger(value) && value > 0;
  },

  // Validar boolean
  isValidBoolean(value) {
    return value === true || value === false;
  },
};

// Helper para validar múltiplos campos
export function validateFields(data, rules) {
  const errors = {};

  for (const [field, rule] of Object.entries(rules)) {
    const value = data[field];

    if (rule.required && (value === null || value === undefined || value === '')) {
      errors[field] = `${field} é obrigatório`;
      continue;
    }

    if (rule.type === 'email' && value && !validators.isValidEmail(value)) {
      errors[field] = 'Email inválido';
    }

    if (rule.type === 'uuid' && value && !validators.isValidUUID(value)) {
      errors[field] = 'ID inválido';
    }

    if (rule.type === 'date' && value && !validators.isValidDate(value)) {
      errors[field] = 'Data inválida';
    }

    if (rule.minLength && value && value.length < rule.minLength) {
      errors[field] = `${field} deve ter no mínimo ${rule.minLength} caracteres`;
    }

    if (rule.maxLength && value && value.length > rule.maxLength) {
      errors[field] = `${field} deve ter no máximo ${rule.maxLength} caracteres`;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}