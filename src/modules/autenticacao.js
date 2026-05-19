// src/modules/autenticacao.js
// Módulo de autenticação com Supabase Auth

import { supabase } from '../config/supabase.js';
import { validators } from '../utils/validators.js';

export const autenticacaoModule = {
  // Estado global
  usuarioLogado: null,
  sessaoAtiva: false,

  // ========== REGISTRAR ==========
  async registrar(email, senha, nome) {
    try {
      // Validar entrada
      if (!validators.isValidEmail(email)) {
        throw new Error('Email inválido');
      }
      if (senha.length < 8) {
        throw new Error('Senha deve ter no mínimo 8 caracteres');
      }
      if (!validators.isValidName(nome)) {
        throw new Error('Nome inválido (mínimo 3 caracteres)');
      }

      // Criar usuário
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: senha,
        options: {
          data: {
            nome: nome,
            criado_em: new Date().toISOString(),
          },
        },
      });

      if (error) throw error;

      return {
        sucesso: true,
        mensagem: '✅ Conta criada com sucesso! Verifique seu email para confirmar.',
        usuario: data.user,
      };
    } catch (error) {
      return {
        sucesso: false,
        mensagem: `❌ Erro ao registrar: ${error.message}`,
      };
    }
  },

  // ========== LOGIN ==========
  async login(email, senha) {
    try {
      // Validar entrada
      if (!validators.isValidEmail(email)) {
        throw new Error('Email inválido');
      }
      if (!senha) {
        throw new Error('Senha é obrigatória');
      }

      // Autenticar
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: senha,
      });

      if (error) throw error;

      // Armazenar sessão
      this.usuarioLogado = {
        id: data.user.id,
        email: data.user.email,
        nome: data.user.user_metadata?.nome || 'Usuário',
      };
      this.sessaoAtiva = true;

      // Guardar no localStorage
      localStorage.setItem('usuario_logado', JSON.stringify(this.usuarioLogado));
      localStorage.setItem('sessao_token', data.session.access_token);

      return {
        sucesso: true,
        mensagem: `✅ Bem-vindo, ${this.usuarioLogado.nome}!`,
        usuario: this.usuarioLogado,
      };
    } catch (error) {
      return {
        sucesso: false,
        mensagem: `❌ Erro ao fazer login: ${error.message}`,
      };
    }
  },

  // ========== LOGOUT ==========
  async logout() {
    try {
      // Fazer logout no Supabase
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Limpar estado
      this.usuarioLogado = null;
      this.sessaoAtiva = false;

      // Limpar localStorage
      localStorage.removeItem('usuario_logado');
      localStorage.removeItem('sessao_token');

      return {
        sucesso: true,
        mensagem: '✅ Logout realizado com sucesso',
      };
    } catch (error) {
      return {
        sucesso: false,
        mensagem: `❌ Erro ao fazer logout: ${error.message}`,
      };
    }
  },

  // ========== OBTER USUÁRIO LOGADO ==========
  async obterUsuarioLogado() {
    try {
      // Tentar recuperar do estado
      if (this.usuarioLogado) {
        return {
          sucesso: true,
          usuario: this.usuarioLogado,
          logado: true,
        };
      }

      // Tentar recuperar do localStorage
      const usuarioSalvo = localStorage.getItem('usuario_logado');
      if (usuarioSalvo) {
        this.usuarioLogado = JSON.parse(usuarioSalvo);
        this.sessaoAtiva = true;
        return {
          sucesso: true,
          usuario: this.usuarioLogado,
          logado: true,
        };
      }

      // Verificar sessão no Supabase
      const { data, error } = await supabase.auth.getSession();

      if (error) throw error;

      if (data.session && data.session.user) {
        this.usuarioLogado = {
          id: data.session.user.id,
          email: data.session.user.email,
          nome: data.session.user.user_metadata?.nome || 'Usuário',
        };
        this.sessaoAtiva = true;
        localStorage.setItem('usuario_logado', JSON.stringify(this.usuarioLogado));
        return {
          sucesso: true,
          usuario: this.usuarioLogado,
          logado: true,
        };
      }

      return {
        sucesso: true,
        usuario: null,
        logado: false,
      };
    } catch (error) {
      return {
        sucesso: false,
        usuario: null,
        logado: false,
        mensagem: `Erro: ${error.message}`,
      };
    }
  },

  // ========== RECUPERAR SENHA ==========
  async recuperarSenha(email) {
    try {
      if (!validators.isValidEmail(email)) {
        throw new Error('Email inválido');
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) throw error;

      return {
        sucesso: true,
        mensagem: '✅ Email de recuperação enviado! Verifique sua caixa de entrada.',
      };
    } catch (error) {
      return {
        sucesso: false,
        mensagem: `❌ Erro: ${error.message}`,
      };
    }
  },

  // ========== VERIFICAR SE LOGADO ==========
estaLogado() {
    return this.sessaoAtiva && this.usuarioLogado !== null;
  },

  // ========== OBTER NOME DO USUÁRIO ==========
  obterNomeUsuario() {
    return this.usuarioLogado?.nome || 'Visitante';
  },
};