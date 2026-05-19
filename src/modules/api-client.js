// src/modules/api-client.js
// Cliente HTTP com retry automático e exponential backoff

import axios from 'axios';
import { config } from '../config/supabase.js';

class APIClient {
  constructor() {
    this.maxRetries = 3;
    this.baseDelay = 1000; // 1 segundo
    this.timeout = config.api.timeoutMs;
  }

  // Fazer requisição com retry automático
  async request(method, url, data = null, options = {}) {
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await axios({
          method,
          url,
          data,
          timeout: this.timeout,
          ...options,
        });

        if (config.features.debugMode) {
          console.log(`✅ ${method.toUpperCase()} ${url} - Tentativa ${attempt}`);
        }

        return response.data;
      } catch (error) {
        const shouldRetry = this._shouldRetry(error, attempt);

        if (!shouldRetry) {
          this._logError(error, method, url, attempt);
          throw error;
        }

        const delay = this._calculateDelay(attempt);
        if (config.features.debugMode) {
          console.warn(
            `⚠️ Erro em ${method.toUpperCase()} ${url}. ` +
            `Tentativa ${attempt}/${this.maxRetries}. ` +
            `Aguardando ${delay}ms...`
          );
        }

        await this._sleep(delay);
      }
    }
  }

  // GET
  async get(url, options = {}) {
    return this.request('GET', url, null, options);
  }

  // POST
  async post(url, data, options = {}) {
    return this.request('POST', url, data, options);
  }

  // PATCH
  async patch(url, data, options = {}) {
    return this.request('PATCH', url, data, options);
  }

  // DELETE
  async delete(url, options = {}) {
    return this.request('DELETE', url, null, options);
  }

  // Determinar se deve fazer retry
  _shouldRetry(error, attempt) {
    if (attempt >= this.maxRetries) return false;

    // Erros de rede ou timeout - retry
    if (!error.response) return true;

    // Erros 408, 429, 5xx - retry
    const retryableCodes = [408, 429, 500, 502, 503, 504];
    return retryableCodes.includes(error.response.status);
  }

  // Calcular delay com exponential backoff
  _calculateDelay(attempt) {
    return this.baseDelay * Math.pow(2, attempt - 1);
  }

  // Log de erros
  _logError(error, method, url, attempt) {
    const errorInfo = {
      metodo: method.toUpperCase(),
      url,
      tentativa: attempt,
      status: error.response?.status,
      mensagem: error.response?.data?.message || error.message,
      timestamp: new Date().toISOString(),
    };

    console.error('❌ Erro na requisição:', errorInfo);

    // Aqui você pode enviar para Sentry ou outro serviço de logging
    if (window.__reportError) {
      window.__reportError(errorInfo);
    }
  }

  // Sleep helper
  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const apiClient = new APIClient();