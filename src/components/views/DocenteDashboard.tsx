/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AIBoardSandbox } from '../AIBoardSandbox';
import { AISystemReview } from '../AISystemReview';
import { AttendanceRecord, StudentAttendanceInstance, AccentColor, ResourceItem } from '../../types';
import { getThemeClasses } from '../../lib/themeUtils';
import { 
  Calendar, 
  CalendarClock, 
  CheckSquare, 
  Wallet, 
  Folder, 
  FileText, 
  Plus, 
  Search, 
  File, 
  ArrowUpRight, 
  CheckCircle,
  XCircle, 
  X, 
  MessageSquare,
  Sparkles,
  BookOpen,
  DollarSign,
  TrendingUp,
  UserCheck,
  ChevronRight,
  GripVertical,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DocenteDashboardProps {
  activeTab: string;
  onChangeTab?: (tab: any) => void;
}

export const DocenteDashboard: React.FC<DocenteDashboardProps> = ({ activeTab, onChangeTab }) => {
  const { 
    currentUser, students, teachers, resources, 
    transactions, attendance, registerAttendance, 
    theme, updateTheme, news 
  } = useApp();

  const cl = getThemeClasses(theme.accentColor);

  // Match current logged in docente spec details
  const matchedDocente = teachers.find(t => t.email.toLowerCase() === currentUser?.email.toLowerCase());
  const teacherId = matchedDocente?.id || 'DOC-001';
  const teacherName = matchedDocente?.name || currentUser?.name || 'Prof. Carlos Fuentes';
  const teacherSubject = matchedDocente?.subject || 'Matemáticas';

  // Sub-state for Mis Asistencias
  const [showRegisterAttendance, setShowRegisterAttendance] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('10° Grado A');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [comments, setComments] = useState('');
  
  // Initialize checklist for students of the selected grade/course
  const [studentCheckerList, setStudentCheckerList] = useState<{ id: string; name: string; present: boolean }[]>(() => {
    // Initialise based on default 10° Grado students
    return students
      .filter(s => s.grade === '10° Grado')
      .map(s => ({ id: s.id, name: s.name, present: true }));
  });

  // Resources state (Docente read only)
  const [currentFolder, setCurrentFolder] = useState<ResourceItem | null>(null);
  const [resourceSearch, setResourceSearch] = useState('');

  // Quick actions widget state for Docente
  const [docenteWidgets, setDocenteWidgets] = useState<string[]>(() => {
    const saved = localStorage.getItem('edu_docente_widgets');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return ['mark-attendance', 'view-materials', 'view-salary', 'system-config'];
  });
  const [showWidgetConfig, setShowWidgetConfig] = useState(false);
  const [draggedWidgetIdx, setDraggedWidgetIdx] = useState<number | null>(null);

  // Real-time Sidebar collapse settings
  const [sidebarHideIcons, setSidebarHideIcons] = useState(() => {
    return localStorage.getItem('edu_sidebar_hide_icons') === 'true';
  });

  React.useEffect(() => {
    const handleSync = () => {
      setSidebarHideIcons(localStorage.getItem('edu_sidebar_hide_icons') === 'true');
    };
    window.addEventListener('sidebar-config-changed', handleSync);
    return () => {
      window.removeEventListener('sidebar-config-changed', handleSync);
    };
  }, []);

  const handleToggleSidebarHideIcons = (hide: boolean) => {
    setSidebarHideIcons(hide);
    localStorage.setItem('edu_sidebar_hide_icons', String(hide));
    window.dispatchEvent(new Event('sidebar-config-changed'));
  };

  // When class course changes, reload student checklist mapping their grade
  const handleCourseChange = (course: string) => {
    setSelectedCourse(course);
    const gradeString = course.includes('10°') ? '10° Grado' : '11° Grado';
    const studentsInGrade = students
      .filter(s => s.grade === gradeString)
      .map(s => ({ id: s.id, name: s.name, present: true }));
    setStudentCheckerList(studentsInGrade);
  };

  const handleTogglePresent = (index: number) => {
    setStudentCheckerList(prev => prev.map((s, idx) => {
      if (idx === index) {
        return { ...s, present: !s.present };
      }
      return s;
    }));
  };

  // Submit recorded classroom attendance checklist
  const handleSaveAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    
    const checklist: StudentAttendanceInstance[] = studentCheckerList.map(item => ({
      studentId: item.id,
      studentName: item.name,
      present: item.present
    }));

    registerAttendance({
      teacherId,
      teacherName,
      course: `${selectedCourse} - ${teacherSubject}`,
      date: attendanceDate,
      students: checklist,
      comments: comments || undefined
    });

    // Reset checklist state
    setComments('');
    setShowRegisterAttendance(false);
    alert(`Asistencia registrada con éxito para ${selectedCourse}. ¡Se han actualizado las tasas académicas!`);
  };


  /* =========================================================================
     MODULE: INICIO (TEACHER PORTAL HERO BOARD WITH NOTICES & CALENDAR)
     ========================================================================= */
  const renderInicioValue = () => {
    // Lead classes list
    const leadClasses = matchedDocente?.activeCourses || ['10° Grado A', '11° Grado B'];
    
    return (
      <div className="space-y-6">
        
        {/* Welcome branding hero card */}
        <div className={`p-6 bg-gradient-to-r ${cl.gradient} rounded-2xl text-white shadow-sm flex flex-col md:flex-row items-center justify-between gap-5`}>
          <div className="space-y-1 text-center md:text-left">
            <div className="flex justify-center md:justify-start items-center gap-2">
              <span className="bg-white/20 font-bold tracking-wider rounded-full px-2 py-0.5 text-[9px] uppercase">Docente Titular</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300"></span>
            </div>
            <h2 className="text-xl font-bold tracking-tight mt-1">¡Qué gusto verte, {teacherName}!</h2>
            <p className="text-xs text-white/85 max-w-md">
              Hoy dictas clases de <strong className="underline">{teacherSubject}</strong>. Revisa tu agenda periódica y comparte recursos con tus alumnos.
            </p>
          </div>

          <div className="flex gap-4">
            <div className="px-4 py-3 bg-white/10 backdrop-blur-md rounded-xl text-center border border-white/10">
              <p className="text-[10px] text-white/70 uppercase font-semibold">Tus clases</p>
              <h3 className="text-xl font-extrabold mt-0.5">{leadClasses.length}</h3>
            </div>
            <div className="px-4 py-3 bg-white/10 backdrop-blur-md rounded-xl text-center border border-white/10">
              <p className="text-[10px] text-white/70 uppercase font-semibold">Puntaje</p>
              <h3 className="text-xl font-extrabold mt-0.5">{matchedDocente?.rating || '4.8'}/5</h3>
            </div>
          </div>
        </div>

        {/* Quick Actions Widget Area */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-gray-850 dark:text-zinc-200 flex items-center gap-1.5 font-sans">
                <span>⚡ Panel de Accesos Rápidos</span>
              </h3>
              <p className="text-[11px] text-gray-400">Reorganiza arrastrando la barra lateral de las tarjetas, o pulsa "Ajustar Accesos" para configurarlas.</p>
            </div>
            
            <button
              id="docente-widget-config-toggle"
              type="button"
              onClick={() => setShowWidgetConfig(!showWidgetConfig)}
              className="self-start text-xs font-semibold px-3 py-1.5 bg-gray-50 hover:bg-gray-100 dark:bg-zinc-800 dark:hover:bg-zinc-750 border border-gray-150 dark:border-zinc-700 rounded-lg text-gray-650 dark:text-zinc-300 transition-all select-none"
            >
              {showWidgetConfig ? 'Cerrar Ajustes' : '🔧 Ajustar Accesos'}
            </button>
          </div>

          {/* Configuration Selection */}
          <AnimatePresence>
            {showWidgetConfig && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden border-b border-gray-100 dark:border-zinc-850 pb-4"
              >
                <div className="bg-gray-50/50 dark:bg-zinc-950/30 p-4 rounded-xl border border-gray-150/70 dark:border-zinc-800 space-y-3">
                  <p className="text-xs font-extrabold text-gray-600 dark:text-zinc-400">Habilita los accesos dinámicos que utilizarás más seguido:</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                    {[
                      { id: 'mark-attendance', title: 'Tomar Asistencia', desc: 'Control diario de asistencia', icon: CheckSquare },
                      { id: 'view-materials', title: 'Recursos Digitales', desc: 'Tareas, guías y carpetas', icon: Folder },
                      { id: 'view-salary', title: 'Consultar Honorarios', desc: 'Visualizar depósitos y salarios', icon: DollarSign },
                      { id: 'system-config', title: 'Estilo Visual', desc: 'Modifica color y apariencias', icon: Settings },
                      { id: 'quick-register', title: 'Lista Express', desc: 'Panel de registro inmediato', icon: UserCheck },
                    ].map(widget => {
                      const isChecked = docenteWidgets.includes(widget.id);
                      return (
                        <label 
                          key={widget.id}
                          className={`flex items-start gap-2 p-2.5 rounded-xl border cursor-pointer select-none transition-all ${
                            isChecked 
                              ? 'border-indigo-500/30 bg-indigo-500/5 text-indigo-700 dark:text-indigo-400' 
                              : 'border-gray-200 dark:border-zinc-800 text-gray-450 hover:border-gray-300'
                          }`}
                        >
                          <input 
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              let next;
                              if (isChecked) {
                                next = docenteWidgets.filter(id => id !== widget.id);
                              } else {
                                next = [...docenteWidgets, widget.id];
                              }
                              setDocenteWidgets(next);
                              localStorage.setItem('edu_docente_widgets', JSON.stringify(next));
                            }}
                            className="mt-0.5 shrink-0"
                          />
                          <div className="text-[11px] leading-tight font-extrabold">
                            <div>{widget.title}</div>
                            <div className="text-[9px] text-gray-400 font-normal mt-0.5">{widget.desc}</div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active Cards Grid */}
          {(() => {
            const ALL_DOCENTE_WIDGETS = [
              { id: 'mark-attendance', title: 'Tomar Asistencia', desc: 'Control diario de asistencia', icon: CheckSquare, color: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/30', action: () => onChangeTab?.('asistencias') },
              { id: 'view-materials', title: 'Recursos Digitales', desc: 'Tareas, guías y carpetas', icon: Folder, color: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/30', action: () => onChangeTab?.('recursos') },
              { id: 'view-salary', title: 'Consultar Honorarios', desc: 'Visualizar depósitos y salarios', icon: DollarSign, color: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/30', action: () => onChangeTab?.('finanzas') },
              { id: 'system-config', title: 'Estilo Visual', desc: 'Modifica color y apariencias', icon: Settings, color: 'text-slate-600 bg-slate-50 dark:text-slate-400 dark:bg-slate-950/30', action: () => onChangeTab?.('configuracion') },
              { id: 'quick-register', title: 'Lista Express', desc: 'Registro inmediato', icon: UserCheck, color: 'text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-950/30', action: () => { onChangeTab?.('asistencias'); setShowRegisterAttendance(true); } },
            ];

            const activeWidgetData = docenteWidgets
              .map(id => ALL_DOCENTE_WIDGETS.find(w => w.id === id))
              .filter((w): w is typeof ALL_DOCENTE_WIDGETS[0] => !!w);

            const handleDragStartLocal = (idx: number) => {
              setDraggedWidgetIdx(idx);
            };

            const handleDragOverLocal = (e: React.DragEvent) => {
              e.preventDefault();
            };

            const handleDropLocal = (targetIdx: number) => {
              if (draggedWidgetIdx === null || draggedWidgetIdx === targetIdx) return;
              const reordered = [...docenteWidgets];
              const [draggedItem] = reordered.splice(draggedWidgetIdx, 1);
              reordered.splice(targetIdx, 0, draggedItem);
              setDocenteWidgets(reordered);
              localStorage.setItem('edu_docente_widgets', JSON.stringify(reordered));
              setDraggedWidgetIdx(null);
            };

            if (activeWidgetData.length === 0) {
              return (
                <div className="text-center py-6 border border-dashed border-gray-200 dark:border-zinc-800 rounded-xl text-xs text-gray-400">
                  Ninguno habilitado. Haz clic en "Ajustar Accesos" para agregar algunos.
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 select-none">
                {activeWidgetData.map((widget, idx) => {
                  const IconComp = widget.icon;
                  return (
                    <div
                      key={widget.id}
                      draggable="true"
                      onDragStart={() => handleDragStartLocal(idx)}
                      onDragOver={handleDragOverLocal}
                      onDrop={() => handleDropLocal(idx)}
                      className="group bg-white dark:bg-zinc-900 border border-gray-150/70 dark:border-zinc-800 rounded-xl p-3.5 flex items-center justify-between gap-2 border-l-3 border-l-purple-500 dark:border-l-purple-400 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing hover:border-gray-350 dark:hover:border-zinc-700"
                    >
                      <button
                        type="button"
                        onClick={widget.action}
                        className="flex items-center gap-3 min-w-0 text-left cursor-pointer flex-1"
                      >
                        <div className={`p-2.5 rounded-xl ${widget.color} shrink-0`}>
                          <IconComp className="w-4 h-4 shrink-0" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-extrabold text-gray-800 dark:text-zinc-200 group-hover:text-purple-650 dark:group-hover:text-purple-400 transition-colors truncate">
                            {widget.title}
                          </h4>
                          <p className="text-[10px] text-gray-400 truncate mt-0.5">{widget.desc}</p>
                        </div>
                      </button>

                      {/* Drag Handle block */}
                      <div className="flex items-center text-gray-300 dark:text-zinc-700 group-hover:text-gray-450 dark:group-hover:text-zinc-500 transition-colors px-1 cursor-grab mt-0.5">
                        <GripVertical className="w-4 h-4 shrink-0" />
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>

        {/* Dashboard grid: Courses Schedule & General Institutional News (NOTICIAS - REQUISITO) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Courses Schedule */}
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm lg:col-span-1 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-450 flex items-center gap-2">
              <CalendarClock className="w-4 h-4 text-gray-450" />
              Tus Clases Activas
            </h3>
            
            <div className="space-y-3">
              {leadClasses.map((clase, i) => (
                <div key={i} className="p-3.5 bg-gray-50/50 dark:bg-zinc-950/40 border border-gray-100 dark:border-zinc-850/60 rounded-xl hover:translate-x-1 transition-transform">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-gray-800 dark:text-zinc-200 text-xs">{clase}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${cl.lightBg}`}>
                      {teacherSubject}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-gray-500">
                    <span>Horario: {i === 0 ? '08:00 - 09:30' : '10:00 - 11:30'}</span>
                    <span className="underline">Aula {i === 0 ? 'E-12' : 'B-04'}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 text-center border-t border-gray-100 dark:border-zinc-850">
              <p className="text-[10px] text-gray-400">¿Requieres cambios de salón? Solicítalo en Dirección.</p>
            </div>
          </div>

          {/* Institutional News (NOTICIAS - REQUISITO EXPLICITO) */}
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm lg:col-span-2 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-450">Últimas Noticias Institucionales</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {news.map(item => (
                <div key={item.id} className="border border-gray-100 dark:border-zinc-850 bg-white dark:bg-zinc-900/40 rounded-xl overflow-hidden shadow-sm flex flex-col justify-between">
                  {item.imageUrl && (
                    <img 
                      src={item.imageUrl} 
                      alt={item.title}
                      className="w-full h-28 object-cover object-center"
                    />
                  )}
                  <div className="p-3.5 space-y-1.5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[8px] font-extrabold px-1.5 py-0.2 bg-emerald-50 dark:bg-emerald-990 text-emerald-600 dark:text-emerald-300 rounded uppercase">
                          {item.category}
                        </span>
                        <span className="text-[9px] text-gray-400">{item.date}</span>
                      </div>
                      <h4 className="text-xs font-bold text-gray-800 dark:text-zinc-250 mt-1 leading-snug">{item.title}</h4>
                      <p className="text-[11px] text-gray-500 dark:text-zinc-400 line-clamp-3 mt-1 leading-relaxed">{item.content}</p>
                    </div>
                    <div className="pt-2 border-t border-gray-100 dark:border-zinc-850 text-[10px] text-gray-400 font-medium">
                      Autor: {item.author}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* EnlaceC AI system auditor and pending tasks review */}
        <AISystemReview />

      </div>
    );
  };


  /* =========================================================================
     MODULE: ASISTENCIAS (CHECKLIST AND LIST LOGS - REQUISITO EXPLICITO)
     ========================================================================= */
  const renderAsistenciasValue = () => {
    // Filter instructor specific logs
    const classLogs = attendance.filter(log => log.teacherId === teacherId);

    return (
      <div className="space-y-6">
        
        {/* Dynamic header for attendance actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-gray-100 dark:border-zinc-810 shadow-sm">
          <div>
            <h3 className="text-sm font-bold text-gray-800 dark:text-zinc-200">Bitácora de Asistencias Diarias</h3>
            <p className="text-xs text-gray-500">Mantén el registro de asistencia actualizado para fines de promedio e informes.</p>
          </div>
          
          <button
            id="btn-register-attendance-trigger"
            type="button"
            onClick={() => {
              // Reset list based on default grade
              handleCourseChange('10° Grado A');
              setShowRegisterAttendance(true);
            }}
            className={`w-full sm:w-auto px-4.5 py-2.5 text-xs font-bold text-white rounded-xl ${cl.primaryBg} ${cl.primaryHoverBg} transition-all flex items-center justify-center gap-2 shadow-sm`}
          >
            <Plus className="w-4 h-4" />
            Registrar Nueva Asistencia
          </button>
        </div>

        {/* Existing logs list */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 dark:border-zinc-850">
            <h3 className="text-xs font-bold text-gray-450 uppercase tracking-widest">Historial de Clases Registradas</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50/75 dark:bg-zinc-950/60 border-b border-gray-100 dark:border-zinc-850">
                  <th className="px-4 py-3.5 text-[10px] font-extrabold uppercase tracking-widest text-gray-500 dark:text-zinc-400 select-none whitespace-nowrap">Fecha / Hora</th>
                  <th className="px-4 py-3.5 text-[10px] font-extrabold uppercase tracking-widest text-gray-500 dark:text-zinc-400 select-none whitespace-nowrap">Clase / Curso</th>
                  <th className="px-4 py-3.5 text-[10px] font-extrabold uppercase tracking-widest text-gray-500 dark:text-zinc-400 select-none whitespace-nowrap">Estudiantes Registrados</th>
                  <th className="px-4 py-3.5 text-[10px] font-extrabold uppercase tracking-widest text-gray-500 dark:text-zinc-400 select-none whitespace-nowrap">Presentes / Ausentes</th>
                  <th className="px-4 py-3.5 text-[10px] font-extrabold uppercase tracking-widest text-gray-500 dark:text-zinc-400 select-none whitespace-nowrap">Comentarios</th>
                  <th className="px-4 py-3.5 text-[10px] font-extrabold uppercase tracking-widest text-gray-500 dark:text-zinc-400 select-none whitespace-nowrap text-right">Estatus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-850">
                {classLogs.map(log => {
                  const presentCount = log.students.filter(s => s.present).length;
                  const absentCount = log.students.length - presentCount;
                  return (
                    <tr key={log.id} className="hover:bg-gray-50/20 dark:hover:bg-zinc-800/10 transition-colors">
                      <td className="p-4">
                        <p className="font-bold text-gray-800 dark:text-zinc-200">{log.date}</p>
                        <p className="text-[10px] text-gray-450 font-mono mt-0.5">{log.time} Hrs</p>
                      </td>
                      <td className="p-4 font-semibold text-gray-750 dark:text-zinc-300">
                        {log.course}
                      </td>
                      <td className="p-4 text-gray-500">
                        {log.students.length} alumnos matriculados
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded text-[10px] font-bold">
                            Presentes: {presentCount}
                          </span>
                          {absentCount > 0 && (
                            <span className="px-2 py-0.5 bg-rose-50 dark:bg-rose-950/20 text-rose-650 dark:text-rose-400 rounded text-[10px] font-bold">
                              Faltas: {absentCount}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-gray-500 italic max-w-xs truncate" title={log.comments}>
                        {log.comments || 'Sin comentarios adicionales'}
                      </td>
                      <td className="p-4 text-right">
                        <span className="px-2 py-0.5 bg-emerald-500 text-white rounded-full text-[9px] font-bold uppercase">
                          Sincronizado
                        </span>
                      </td>
                    </tr>
                  );
                })}

                {classLogs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-450 font-medium">
                      Aún no has registrado ninguna clase en este ciclo. Usa "Registrar Nueva Asistencia" arriba.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL PORTAL FORM: CREAR ASISTENCIA (FORMULARIO CHECKLIST MARCADOR DE ASISTENCIAS) */}
        <AnimatePresence>
          {showRegisterAttendance && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowRegisterAttendance(false)}
                className="fixed inset-0 bg-black/25 backdrop-blur-[5px]"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl w-full max-w-lg p-6 relative z-10 shadow-2xl max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between pb-3.5 border-b border-gray-150 dark:border-zinc-850 mb-4">
                  <div className="flex items-center gap-2">
                    <UserCheck className={`w-5 h-5 ${cl.primaryText}`} />
                    <h3 className="text-sm font-bold text-gray-800 dark:text-zinc-205">Generar Registro de Asistencia</h3>
                  </div>
                  <button type="button" onClick={() => setShowRegisterAttendance(false)} className="p-1 hover:bg-gray-150 rounded text-gray-450">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveAttendance} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">Clase dictada</label>
                      <select
                        value={selectedCourse}
                        onChange={(e) => handleCourseChange(e.target.value)}
                        className={`w-full p-2 py-2.5 text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white rounded-xl outline-none transition-all ${cl.ring}`}
                      >
                        {matchedDocente?.activeCourses.map((c, idx) => (
                          <option key={idx} value={c}>{c}</option>
                        )) || (
                          <>
                            <option value="10° Grado A">10° Grado A</option>
                            <option value="11° Grado B">11° Grado B</option>
                          </>
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">Fecha</label>
                      <input
                        required
                        type="date"
                        value={attendanceDate}
                        onChange={(e) => setAttendanceDate(e.target.value)}
                        className={`w-full p-2 py-2.5 text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white rounded-xl outline-none transition-all ${cl.ring}`}
                      />
                    </div>
                  </div>

                  {/* Dynamic checklist header */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-gray-400">
                      <span>Nombre del Alumno</span>
                      <span>Estatus</span>
                    </div>

                    <div className="bg-gray-50/50 dark:bg-zinc-950/20 border border-gray-150 dark:border-zinc-850/60 rounded-xl divide-y divide-gray-100 dark:divide-zinc-850 max-h-[220px] overflow-y-auto p-2">
                      {studentCheckerList.map((st, i) => (
                        <div key={st.id} className="flex justify-between items-center py-2.5 px-1.5 hover:bg-white dark:hover:bg-zinc-850 rounded-lg transition-colors">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-gray-400">{st.id}</span>
                            <span className="text-xs font-bold text-gray-800 dark:text-zinc-200">{st.name}</span>
                          </div>

                          <button
                            id={`checker-switch-${st.id}`}
                            type="button"
                            onClick={() => handleTogglePresent(i)}
                            className={`px-3 py-1 text-[10px] font-extrabold uppercase rounded-lg transition-colors flex items-center gap-1 ${
                              st.present 
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' 
                                : 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300'
                            }`}
                          >
                            {st.present ? (
                              <>
                                <CheckCircle className="w-3.5 h-3.5" />
                                Presente
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3.5 h-3.5" />
                                Ausente
                              </>
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">Notas / Temario dictado (Comentarios)</label>
                    <textarea
                      rows={2}
                      placeholder="Ej. Se resolvió la guía n°3 de binomios. Examen programado."
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      className={`w-full p-2.5 text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white rounded-xl outline-none transition-all ${cl.ring}`}
                    />
                  </div>

                  <div className="pt-4 border-t border-gray-150 dark:border-zinc-850 flex justify-end gap-2 text-xs font-semibold select-none">
                    <button
                      type="button"
                      onClick={() => setShowRegisterAttendance(false)}
                      className="px-4 py-2 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300/80 rounded-xl"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className={`px-4 py-2 text-white font-bold rounded-xl ${cl.primaryBg} ${cl.primaryHoverBg}`}
                    >
                      Sincronizar Asistencia
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    );
  };


  /* =========================================================================
     MODULE: FINANZAS (DOCENTE EARNINGS ONLY - REQUISITO EXPLICITO)
     ========================================================================= */
  const renderFinanzasValue = () => {
    // Collect payments made to this teacher specifically
    const paysReceived = transactions.filter(tx => 
      tx.teacherId === teacherId && tx.category === 'Salario Docente'
    );

    return (
      <div className="space-y-6">
        
        {/* Earnings Card & status info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
            <h4 className="text-xs uppercase font-bold text-gray-450 tracking-wide">Tu Sueldo Mensual Establecido</h4>
            <h2 className={`text-3xl font-extrabold mt-1 tracking-tight ${cl.primaryText}`}>
              ${matchedDocente?.salary.toLocaleString('es-ES') || '1.800'} USD
            </h2>
            <p className="text-[10px] text-gray-400 mt-2 font-medium">Asignado por Dirección directiva</p>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Estatus Pago Actual</p>
              <h3 className="text-xl font-bold mt-1 text-gray-800 dark:text-zinc-200">
                {matchedDocente?.paymentStatus === 'paid' ? 'Liquidado / Pagado' : 'Pendiente Liberación'}
              </h3>
              <p className="text-[10px] text-gray-450 mt-1 font-medium">Ciclo Corriente: Mayo-Junio</p>
            </div>
            
            <div className={`p-3 rounded-full ${
              matchedDocente?.paymentStatus === 'paid' 
                ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600' 
                : 'bg-amber-50 dark:bg-amber-950/30 text-amber-600'
            }`}>
              {matchedDocente?.paymentStatus === 'paid' ? (
                <CheckSquare className="w-6 h-6" />
              ) : (
                <CalendarClock className="w-6 h-6" />
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
            <h4 className="text-xs uppercase font-bold text-gray-450 tracking-wide">Total Recibido Año</h4>
            <h2 className="text-2xl font-bold mt-1 text-gray-800 dark:text-zinc-200">
              ${(paysReceived.reduce((acc, curr) => acc + curr.amount, 0)).toLocaleString('es-ES')} USD
            </h2>
            <span className="text-[10px] text-gray-400 mt-2 block font-medium">Basado en comprobantes contables</span>
          </div>

        </div>

        {/* Quick payroll request */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <h3 className="text-sm font-bold text-gray-800 dark:text-zinc-200">Adelanto o Consulta de Remuneración</h3>
            <p className="text-xs text-gray-500">¿Requieres el desglose en PDF de tus comprobantes de pago? Solicítalo de manera instantánea.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              alert('Petición de boleta de pago enviada a la sección de contabilidad escolar. Recibirás tu PDF vía e-mail.');
            }}
            className={`px-5 py-2.5 text-xs font-bold text-white ${cl.primaryBg} ${cl.primaryHoverBg} rounded-xl transition-all shadow-sm`}
          >
            Descargar Desglose Pagos
          </button>
        </div>

        {/* Specific payroll history logs */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 dark:border-zinc-850">
            <h3 className="text-xs font-bold text-gray-450 uppercase tracking-widest">Historial Comprobantes Depositos</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50/75 dark:bg-zinc-950/60 border-b border-gray-100 dark:border-zinc-850">
                  <th className="px-4 py-3.5 text-[10px] font-extrabold uppercase tracking-widest text-gray-500 dark:text-zinc-400 select-none whitespace-nowrap">Recibo ID</th>
                  <th className="px-4 py-3.5 text-[10px] font-extrabold uppercase tracking-widest text-gray-500 dark:text-zinc-400 select-none whitespace-nowrap">Fecha de Liquidación</th>
                  <th className="px-4 py-3.5 text-[10px] font-extrabold uppercase tracking-widest text-gray-500 dark:text-zinc-400 select-none whitespace-nowrap">Detalle / Concepto</th>
                  <th className="px-4 py-3.5 text-[10px] font-extrabold uppercase tracking-widest text-gray-500 dark:text-zinc-400 select-none whitespace-nowrap">Categoría</th>
                  <th className="px-4 py-3.5 text-[10px] font-extrabold uppercase tracking-widest text-gray-500 dark:text-zinc-400 select-none whitespace-nowrap">Monto Depositado</th>
                  <th className="px-4 py-3.5 text-[10px] font-extrabold uppercase tracking-widest text-gray-500 dark:text-zinc-400 select-none whitespace-nowrap text-right">Estatus Bancario</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-850">
                {paysReceived.map(rec => (
                  <tr key={rec.id} className="hover:bg-gray-50/10 dark:hover:bg-zinc-850/10 transition-colors">
                    <td className="p-4 font-mono text-[10px] text-gray-400">{rec.id}</td>
                    <td className="p-4 text-gray-650 dark:text-zinc-350">{rec.date}</td>
                    <td className="p-4 font-bold text-gray-800 dark:text-zinc-250">{rec.concept}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300">
                        {rec.category}
                      </span>
                    </td>
                    <td className="p-4 text-emerald-600 dark:text-emerald-400 font-bold font-mono">
                      +${rec.amount.toLocaleString('es-ES')} USD
                    </td>
                    <td className="p-4 text-right">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 rounded font-bold text-[10px]">
                        Efectuado
                      </span>
                    </td>
                  </tr>
                ))}

                {paysReceived.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-450 font-medium">
                      Contabilidad aún no reporta transferencias bancarias directas para tu ID.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    );
  };


  /* =========================================================================
     MODULE: RECURSOS (READ ONLY FROM ADMIN AS REQUIRED)
     ========================================================================= */
  const renderRecursosValue = () => {
    const handleSingleClickResource = (item: ResourceItem) => {
      if (item.type === 'folder') {
        setCurrentFolder(item);
      } else {
        alert(`Abriendo archivo académico del colegio:\n${item.name}\nTamaño: ${item.size || 'Desconocido'}\n(Estás en modo Solo Lectura)`);
      }
    };

    const handleGoBack = () => {
      setCurrentFolder(null);
    };

    const itemsOnScreen = currentFolder ? (currentFolder.children || []) : resources;

    return (
      <div className="space-y-6 animate-fade-in">
        
        {/* Drive directory controls header (READ ONLY PROMPT COHERENT WITH USER REQ) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/40 dark:bg-zinc-900/45 backdrop-blur-xl p-4.5 rounded-2xl border border-white/40 dark:border-white/10 shadow-lg shadow-black/[0.03] dark:shadow-black/20 transition-all duration-300">
          <div className="flex items-center gap-3.5">
            <span className="p-2.5 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 rounded-xl shadow-inner shrink-0">
              <Folder className="w-5 h-5 fill-indigo-250/20" />
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none">Archivero Escolar</h3>
                <span className="text-[9px] font-extrabold text-blue-600 dark:text-blue-400 bg-blue-100/50 dark:bg-blue-955/30 px-1.5 py-0.5 rounded-md border border-blue-200/30">SOLO LECTURA</span>
              </div>
              <div className="flex items-center gap-2 mt-2 text-sm font-bold text-gray-800 dark:text-zinc-200">
                <button type="button" onClick={handleGoBack} className="hover:underline text-gray-500 dark:text-zinc-400 transition-colors">
                  Raíz Drive
                </button>
                {currentFolder && (
                  <>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-800 dark:text-zinc-150 font-extrabold px-2 py-0.5 bg-white/60 dark:bg-zinc-850/60 backdrop-blur-md rounded-lg border border-white/40 dark:border-white/10">{currentFolder.name}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {currentFolder && (
            <button
              id="btn-drive-teacher-back"
              type="button"
              onClick={handleGoBack}
              className="px-4 py-2.5 text-xs bg-white/40 hover:bg-white/60 dark:bg-zinc-800/40 dark:hover:bg-zinc-750/50 text-gray-705 dark:text-zinc-350 rounded-xl font-bold transition-all border border-white/40 dark:border-white/10 shadow-sm"
            >
              Regresar
            </button>
          )}
        </div>

        {/* Read-only resources list */}
        <div className="bg-white/40 dark:bg-zinc-900/45 backdrop-blur-xl rounded-2xl border border-white/40 dark:border-white/10 shadow-lg shadow-black/[0.02] dark:shadow-black/15 p-6 overflow-hidden">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-5 leading-none">
            Material didáctico compartido por Directiva (Un clic para abrir)
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {itemsOnScreen.map(item => (
              <div
                key={item.id}
                id={`drive-item-teacher-${item.id}`}
                onClick={() => handleSingleClickResource(item)}
                className="group border border-white/30 dark:border-white/5 bg-white/20 dark:bg-zinc-900/15 backdrop-blur-md hover:bg-white/40 dark:hover:bg-zinc-800/30 hover:border-white/45 dark:hover:border-white/15 hover:shadow-xl rounded-2xl p-4.5 flex flex-col items-center text-center cursor-pointer relative transition-all duration-300 hover:-translate-y-1"
              >
                {item.type === 'folder' ? (
                  <div className="w-12 h-12 bg-yellow-50 dark:bg-yellow-950/20 rounded-2xl flex items-center justify-center text-yellow-600 mb-3.5 group-hover:scale-105 transition-transform duration-300 shadow-sm">
                    <Folder className="w-7 h-7 fill-yellow-250 animate-scale" />
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/20 rounded-2xl flex items-center justify-center text-blue-600 mb-3.5 group-hover:scale-105 transition-transform duration-300 shadow-sm">
                    <FileText className="w-7 h-7 animate-scale" />
                  </div>
                )}

                <h4 className="text-xs font-bold text-gray-800 dark:text-zinc-250 truncate w-full leading-tight pr-1 pl-1" title={item.name}>
                  {item.name}
                </h4>
                
                {item.size ? (
                  <span className="text-[9px] text-gray-450 mt-1.5 font-bold px-1.5 py-0.5 bg-gray-105/50 dark:bg-zinc-805 rounded-md">{item.size}</span>
                ) : (
                  <span className="text-[9px] text-teal-650 dark:text-teal-400 mt-1.5 font-extrabold px-1.5 py-0.5 bg-teal-50 dark:bg-teal-950/40 rounded-md">
                    {(item.children || []).length} items
                  </span>
                )}
                
                <span className="text-[8px] text-gray-400 mt-2.5 font-mono text-center tracking-wider">{item.updatedAt.split(' ')[0]}</span>
              </div>
            ))}

            {itemsOnScreen.length === 0 && (
              <div className="col-span-full py-12 text-center text-gray-400">
                Esta sección de recursos del administrador no cuenta con elementos o carpetas para mostrar.
              </div>
            )}
          </div>
        </div>

      </div>
    );
  };


  /* =========================================================================
     MODULE: CONFIGURACION (DASHBOARD ADJUSTMENTS)
     ========================================================================= */
  const renderConfiguracionValue = () => {
    return (
      <div className="max-w-xl mx-auto bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-6">
        <div>
          <h3 className="text-sm font-bold text-gray-800 dark:text-zinc-150">Ajustes de Perfil & Interfaz</h3>
          <p className="text-xs text-gray-400">Configura la paleta de colores y el comportamiento de visualización.</p>
        </div>

        {/* Accent switcher matching custom configs */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Gama Cromática Personalizada</label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'blue' as AccentColor, label: 'Azul Inteligente', hex: '#3b82f6' },
              { value: 'emerald' as AccentColor, label: 'Verde Orgánico', hex: '#10b981' },
              { value: 'purple' as AccentColor, label: 'Púrpura Creativo', hex: '#8b5cf6' },
              { value: 'amber' as AccentColor, label: 'Ámbar Cálido', hex: '#f59e0b' },
              { value: 'rose' as AccentColor, label: 'Rosa Vital', hex: '#f43f5e' },
              { value: 'indigo' as AccentColor, label: 'Índigo Real', hex: '#6366f1' },
            ].map((color) => {
              const isSelected = theme.accentColor === color.value;
              return (
                <button
                  id={`config-color-docente-${color.value}`}
                  key={color.value}
                  type="button"
                  onClick={() => updateTheme({ accentColor: color.value })}
                  className={`p-3 rounded-xl border flex items-center gap-3 text-left transition-all ${
                    isSelected
                      ? 'border-gray-900 bg-gray-55 dark:border-white dark:bg-zinc-850 font-bold'
                      : 'border-gray-100 hover:border-gray-150 dark:border-zinc-800 dark:hover:border-zinc-750'
                  }`}
                >
                  <span 
                    style={{ backgroundColor: color.hex }}
                    className="w-4 h-4 rounded-full ring-2 ring-white dark:ring-zinc-950 shadow-sm"
                  />
                  <span className="text-xs text-gray-750 dark:text-zinc-200">{color.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Style selection */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Estilo y Filosofía Visual</label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'windows-fluent', label: 'Windows Fluent UI', desc: 'Mica y Acrílico Windows 11 con bordes sutiles y alta gama' },
              { value: 'frosted-glass', label: 'Cristal Esmerilado', desc: 'Diseño moderno translúcido con desenfoque' },
              { value: 'neo-brutalist', label: 'Neo Brutalista', desc: 'Bordes negros gruesos, sombras retro y relieves' },
              { value: 'minimalist', label: 'Mínimalista Clásico', desc: 'Líneas finas, fondos sólidos y pulcritud absoluta' },
              { value: 'cosmic-dark', label: 'Cósmico Profundo', desc: 'Ambiente espacial oscuro con resplandores violetas' }
            ].map((st) => {
              const isSelected = (theme.layoutStyle || 'windows-fluent') === st.value;
              return (
                <button
                  id={`config-style-docente-${st.value}`}
                  key={st.value}
                  type="button"
                  onClick={() => updateTheme({ layoutStyle: st.value as any })}
                  className={`p-3 rounded-xl border text-left transition-all outline-none flex flex-col gap-1 items-start ${
                    isSelected
                      ? 'border-gray-900 bg-gray-50/50 dark:border-white dark:bg-zinc-850 font-bold'
                      : 'border-gray-100/50 hover:border-gray-200 dark:border-zinc-800/50 dark:hover:border-zinc-750'
                  }`}
                >
                  <span className="text-xs text-gray-850 dark:text-zinc-100 font-extrabold">{st.label}</span>
                  <span className="text-[10px] text-gray-400 dark:text-zinc-500 leading-tight font-medium">{st.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Luminosity picker */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Luminosidad</label>
          <div className="grid grid-cols-3 gap-2 bg-gray-105 dark:bg-zinc-950 p-1 rounded-xl">
            {(['light', 'dark', 'system'] as const).map((mode) => (
              <button
                id={`config-mode-docente-${mode}`}
                key={mode}
                type="button"
                onClick={() => updateTheme({ mode })}
                className={`py-2 text-xs font-semibold rounded-lg transition-all capitalize ${
                  theme.mode === mode
                    ? `${cl.primaryBg} text-white shadow-sm`
                    : 'text-gray-500 hover:text-gray-950 dark:text-zinc-400 dark:hover:text-zinc-200'
                }`}
              >
                {mode === 'system' ? 'Sistema' : mode === 'light' ? 'Claro' : 'Oscuro'}
              </button>
            ))}
          </div>
        </div>

        {/* Sidebar Mini-Icons option */}
        <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-zinc-800/60">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Barra Lateral (Escritorio)</label>
          <div className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-zinc-950 rounded-xl border border-gray-200/50 dark:border-zinc-800">
            <div className="space-y-1 pr-4">
              <span className="text-xs font-bold block text-gray-800 dark:text-zinc-200">Ocultar de todo al Colapsar</span>
              <p className="text-[10px] text-gray-400 dark:text-zinc-500 leading-tight">
                Si se activa, el panel colapsado se reduce a una línea fina de adorno y solo se despliega por completo al pasar el mouse.
              </p>
            </div>
            <button
              id="docente-config-sidebar-toggle-button"
              type="button"
              onClick={() => handleToggleSidebarHideIcons(!sidebarHideIcons)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                sidebarHideIcons ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-zinc-850'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  sidebarHideIcons ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 dark:border-zinc-850 flex items-center justify-between text-xs text-gray-450 font-mono">
          <span>Suscripción: Aula Unificada Docente</span>
          <span className="font-bold text-gray-400">ENLACEC v1.2</span>
        </div>
      </div>
    );
  };


  /* =========================================================================
     ROUTER FOR SELECTED TAB
     ========================================================================= */
  const renderViewContent = () => {
    switch (activeTab) {
      case 'inicio':
        return renderInicioValue();
      case 'pizarra':
        return <AIBoardSandbox />;
      case 'asistencias':
        return renderAsistenciasValue();
      case 'finanzas':
        return renderFinanzasValue();
      case 'recursos':
        return renderRecursosValue();
      case 'configuracion':
        return renderConfiguracionValue();
      default:
        return renderInicioValue();
    }
  };

  return (
    <div className={activeTab === 'pizarra' ? "w-full h-full p-2 md:p-4 flex flex-col overflow-hidden" : "p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6"}>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className={activeTab === 'pizarra' ? "w-full h-full flex flex-col flex-1 min-h-0" : ""}
        >
          {renderViewContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
