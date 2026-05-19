// src/config/supabase.js
// Este arquivo carrega as variáveis de ambiente de forma segura

import { createClient } from '@supabase/supabase-js';

// Validar se as variáveis de ambiente existem
if (!import.meta.env.VITE_SUPABASE_URL) {
  throw new Error('❌ Erro: VITE_SUPABASE_URL não encontrada no .env');
}

if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
  throw new Error('❌ Erro: VITE_SUPABASE_ANON_KEY não encontrada no .env');
}

// Criar cliente Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Exportar configurações também
export const config = {
  app: {
    name: import.meta.env.VITE_APP_NAME || 'Casa Grande',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  },
  api: {
    timeoutMs: parseInt(import.meta.env.VITE_API_TIMEOUT_MS || '30000'),
  },
  features: {
    fairPlayEnabled: import.meta.env.VITE_FAIR_PLAY_ENABLED === 'true',
    debugMode: import.meta.env.VITE_DEBUG_MODE === 'true',
  },
};

console.log('✅ Supabase configurado com sucesso');
console.log(`📱 App: ${config.app.name} v${config.app.version}`);