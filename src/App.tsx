/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Login } from './components/Login';
import { Presentation } from './components/Presentation';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { AdminDashboard } from './components/views/AdminDashboard';
import { DocenteDashboard } from './components/views/DocenteDashboard';
import { motion, AnimatePresence } from 'motion/react';
import { Bell } from 'lucide-react';
import { getThemeClasses } from './lib/themeUtils';
import { ChatBotWidget } from './components/ChatBotWidget';

function AppContent() {
  const { currentUser, theme } = useApp();
  const cl = getThemeClasses(theme.accentColor);
  const [activeTab, setActiveTab] = useState<'inicio' | 'estudiantes' | 'docentes' | 'recursos' | 'finanzas' | 'configuracion' | 'asistencias' | 'pizarra'>('inicio');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });
  const [showLoginScreen, setShowLoginScreen] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  // Reset tab when role changes to avoid mismatched menus
  useEffect(() => {
    setActiveTab('inicio');
  }, [currentUser?.role]);

  // Reset scroll of main container to top when changing tabs to prevent floating header visibility glitches
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
  }, [activeTab]);

  useEffect(() => {
    // Intercept standard alert dialogs with a beautifully animated React modal toast
    const originalAlert = window.alert;
    window.alert = (msg: string) => {
      setToast({ message: msg, visible: true });
    };
    return () => {
      window.alert = originalAlert;
    };
  }, []);

  if (!currentUser) {
    return (
      <AnimatePresence mode="wait">
        {!showLoginScreen ? (
          <motion.div
            key="presentation-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="w-full text-zinc-950 dark:text-zinc-50"
          >
            <Presentation onStartLogin={() => setShowLoginScreen(true)} />
          </motion.div>
        ) : (
          <motion.div
            key="login-screen"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-full text-zinc-950 dark:text-zinc-50"
          >
            <Login onBackToWelcome={() => setShowLoginScreen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Get human friendly label of active tab for header info
  const getActiveTabLabel = () => {
    const labels: Record<string, string> = {
      inicio: 'Inicio Panel',
      estudiantes: 'Matrícula de Estudiantes',
      docentes: 'Catálogo de Docentes',
      recursos: 'Carpeta de Recursos',
      pizarra: 'Laboratorio Científico de IA',
      finanzas: currentUser.role === 'admin' ? 'Caja / Flujo de Efectivo' : 'Tus Honorarios y Pagos',
      configuracion: 'Ajustes del Sistema',
      asistencias: 'Asistencias del Docente'
    };
    return labels[activeTab] || 'ENLACEC';
  };

  return (
    <div className={`flex h-screen ${cl.appBg} text-gray-900 dark:text-zinc-100 transition-colors duration-300 overflow-hidden relative font-sans`}>
      {/* Background Mesh Gradients */}
      <div className={`absolute top-[-150px] left-[-150px] w-[600px] h-[600px] ${cl.meshBg1} rounded-full blur-[120px] pointer-events-none z-0`}></div>
      <div className={`absolute bottom-[-150px] right-[-150px] w-[600px] h-[600px] ${cl.meshBg2} rounded-full blur-[120px] pointer-events-none z-0`}></div>
      <div className={`absolute top-1/2 left-1/4 w-[400px] h-[400px] ${cl.meshBg3} rounded-full blur-[100px] pointer-events-none z-0`}></div>

      {/* Sidebar Navigation Panel */}
      <Sidebar 
        isOpen={mobileSidebarOpen} 
        onClose={() => setMobileSidebarOpen(false)} 
        activeTab={activeTab} 
        onChangeTab={setActiveTab} 
      />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative z-20">
        <Header 
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)} 
          activeTabLabel={getActiveTabLabel()} 
        />

        <main ref={mainRef} className={`flex-1 ${activeTab === 'pizarra' ? 'overflow-hidden flex flex-col h-full' : 'overflow-y-auto'} bg-white/5 dark:bg-slate-900/30 transition-colors duration-300`}>
          {currentUser.role === 'admin' ? (
            <AdminDashboard activeTab={activeTab} onChangeTab={setActiveTab} />
          ) : (
            <DocenteDashboard activeTab={activeTab} onChangeTab={setActiveTab} />
          )}
        </main>
      </div>

      {/* Dynamic Animated System Toast Dialog */}
      <AnimatePresence>
        {toast.visible && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl max-w-md w-full relative overflow-hidden"
            >
              {/* Decorative accent top line matching active theme accent */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600" />
              
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5">
                  <Bell className="w-5 h-5 animate-bounce" />
                </div>
                <div className="flex-1 space-y-1.5 select-none text-left">
                  <h4 className="text-xs font-bold text-gray-400/80 dark:text-zinc-500 uppercase tracking-widest">Aviso del Sistema</h4>
                  <p className="text-sm font-semibold text-gray-700 dark:text-zinc-200 leading-relaxed whitespace-pre-line">
                    {toast.message}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  id="btn-system-toast-close"
                  type="button"
                  onClick={() => setToast(prev => ({ ...prev, visible: false }))}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/20 active:scale-95 cursor-pointer"
                >
                  Entendido
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating EnlaceC AI Chatbot Widget */}
      {activeTab !== 'pizarra' && <ChatBotWidget />}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
