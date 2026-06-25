/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getThemeClasses } from '../lib/themeUtils';
import { EnlaceCIcon } from './EnlaceCIcon';
import { Shield, BookOpen, Key, Mail, LogIn, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface LoginProps {
  onBackToWelcome?: () => void;
}

export const Login: React.FC<LoginProps> = ({ onBackToWelcome }) => {
  const { login, theme } = useApp();
  const cl = getThemeClasses(theme.accentColor);
  
  const [role, setRole] = useState<'admin' | 'docente'>('admin');
  const [email, setEmail] = useState('admin@sistema.edu');
  const [password, setPassword] = useState('admin123'); // Just for layout fidelity
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRoleChange = (selectedRole: 'admin' | 'docente') => {
    setRole(selectedRole);
    if (selectedRole === 'admin') {
      setEmail('admin@sistema.edu');
      setPassword('admin123');
    } else {
      // Default docente listed in AppContext
      setEmail('carlos.fuentes@sistema.edu');
      setPassword('docente123');
    }
    setError('');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError('Por favor, ingresa tu correo electrónico.');
      return;
    }

    setLoading(true);
    
    // Create a realistic delay for beautiful loading spinner effect
    setTimeout(() => {
      const success = login(email, role);
      setLoading(false);
      if (!success) {
        setError('Credenciales inválidas. Verifica tu correo o usa los accesos rápidos.');
      }
    }, 600);
  };

  const quickAccess = (selectedEmail: string, selectedRole: 'admin' | 'docente') => {
    setRole(selectedRole);
    setEmail(selectedEmail);
    setPassword(selectedRole === 'admin' ? 'admin123' : 'docente123');
    setError('');
    
    setLoading(true);
    setTimeout(() => {
      login(selectedEmail, selectedRole);
      setLoading(false);
    }, 450);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${cl.appBg} p-4 transition-colors duration-300 relative overflow-hidden font-sans`}>
      
      {/* Dynamic background accents (mesh gradients) */}
      <div className={`absolute top-[-150px] left-[-150px] w-[500px] h-[500px] ${cl.meshBg1} rounded-full blur-[110px] pointer-events-none z-0`}></div>
      <div className={`absolute bottom-[-150px] right-[-150px] w-[500px] h-[500px] ${cl.meshBg2} rounded-full blur-[110px] pointer-events-none z-0`}></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 35 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden relative z-10"
      >
        {/* Top brand header */}
        <div className={`bg-gradient-to-r ${cl.gradient} p-7 text-white relative`}>
          {onBackToWelcome && (
            <button
              id="login-btn-back-to-welcome"
              type="button"
              onClick={onBackToWelcome}
              className="absolute top-4 left-4 bg-white/10 hover:bg-white/25 active:scale-95 transition-all border border-white/15 backdrop-blur-md px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 select-none cursor-pointer"
            >
              ← Volver
            </button>
          )}
          <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-mono flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>v1.2</span>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-1 bg-white/20 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg shadow-black/5 flex items-center justify-center">
              <EnlaceCIcon className="w-10 h-10" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">ENLACEC</h1>
          </div>
          <p className="text-white/80 text-xs leading-normal">
            Portal administrativo y docente unificado para instituciones de vanguardia.
          </p>
        </div>

        <div className="p-6">
          {/* Custom Tab Selector */}
          <div className="flex bg-gray-200/50 dark:bg-white/5 backdrop-blur-md p-1 rounded-2xl mb-5 border border-gray-200/30 dark:border-white/5">
            <button
              id="btn-tab-admin"
              type="button"
              onClick={() => handleRoleChange('admin')}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all flex items-center justify-center gap-2 ${
                role === 'admin'
                  ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm border border-white/50 dark:border-white/10'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Shield className={`w-4 h-4 ${role === 'admin' ? cl.primaryText : ''}`} />
              Administrativo
            </button>
            <button
              id="btn-tab-teacher"
              type="button"
              onClick={() => handleRoleChange('docente')}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all flex items-center justify-center gap-2 ${
                role === 'docente'
                  ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm border border-white/50 dark:border-white/10'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <BookOpen className={`w-4 h-4 ${role === 'docente' ? cl.primaryText : ''}`} />
              Docentes
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 text-xs text-red-650 dark:text-red-400 bg-red-500/10 backdrop-blur-md rounded-xl border border-red-500/20 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-550 dark:text-gray-300 uppercase tracking-widest mb-1.5 pl-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  id="login-email-input"
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={role === 'admin' ? 'admin@sistema.edu' : 'nombre.apellido@sistema.edu'}
                  className={`w-full pl-10 pr-4 py-2.5 text-xs bg-white/50 dark:bg-white/5 backdrop-blur-md border border-gray-250/20 dark:border-white/10 text-gray-900 dark:text-white rounded-xl outline-none transition-all ${cl.ring}`}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-550 dark:text-gray-300 uppercase tracking-widest mb-1.5 pl-1">
                Contraseña
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                  <Key className="w-4 h-4" />
                </span>
                <input
                  id="login-password-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-4 py-2.5 text-xs bg-white/50 dark:bg-white/5 backdrop-blur-md border border-gray-250/20 dark:border-white/10 text-gray-900 dark:text-white rounded-xl outline-none transition-all ${cl.ring}`}
                />
              </div>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className={`w-full py-3 h-11 rounded-xl text-xs font-bold uppercase tracking-wider text-white transition-all flex items-center justify-center gap-2 shadow-lg shadow-black/10 hover:shadow-xl hover:brightness-105 active:scale-98 ${cl.primaryBg}`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Iniciar Sesión
                </>
              )}
            </button>
          </form>

          {/* Quick Access Credentials Panel */}
          <div className="mt-6 border-t border-gray-200/50 dark:border-white/10 pt-4">
            <h3 className="text-[10px] font-bold text-gray-400 dark:text-gray-450 uppercase tracking-wider mb-2.5 pl-1">
              Acceso Rápido Demostrativo
            </h3>
            <div className="space-y-1.5">
              {role === 'admin' ? (
                <button
                  id="quick-login-admin"
                  type="button"
                  onClick={() => quickAccess('admin@sistema.edu', 'admin')}
                  className="w-full text-left p-2.5 rounded-xl bg-white/40 dark:bg-white/5 border border-gray-200/30 dark:border-white/5 hover:bg-white/60 dark:hover:bg-white/10 transition-all flex items-center justify-between group"
                >
                  <div>
                    <p className="text-xs font-bold text-gray-800 dark:text-zinc-200">Director Administrativo</p>
                    <p className="text-[9px] text-gray-500 dark:text-zinc-400 font-mono">admin@sistema.edu</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-300`}>
                    Auto-Entrar
                  </span>
                </button>
              ) : (
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  <button
                    id="quick-login-teacher-1"
                    type="button"
                    onClick={() => quickAccess('carlos.fuentes@sistema.edu', 'docente')}
                    className="w-full text-left p-2 rounded-xl bg-white/40 dark:bg-white/5 border border-gray-200/30 dark:border-white/5 hover:bg-white/60 dark:hover:bg-white/10 transition-all flex items-center justify-between group"
                  >
                    <div>
                      <p className="text-xs font-bold text-gray-800 dark:text-zinc-200">Prof. Carlos Fuentes (Mates)</p>
                      <p className="text-[9px] text-gray-500 dark:text-zinc-400 font-mono">carlos.fuentes@sistema.edu</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-300">
                      Entrar
                    </span>
                  </button>
                  <button
                    id="quick-login-teacher-2"
                    type="button"
                    onClick={() => quickAccess('ana.cecilia@sistema.edu', 'docente')}
                    className="w-full text-left p-2 rounded-xl bg-white/40 dark:bg-white/5 border border-gray-200/30 dark:border-white/5 hover:bg-white/60 dark:hover:bg-white/10 transition-all flex items-center justify-between group"
                  >
                    <div>
                      <p className="text-xs font-bold text-gray-800 dark:text-zinc-200">Dra. Ana Cecilia (Ciencias)</p>
                      <p className="text-[9px] text-gray-500 dark:text-zinc-400 font-mono">ana.cecilia@sistema.edu</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-300">
                      Entrar
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
