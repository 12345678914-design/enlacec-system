/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AttendanceCalendar } from '../AttendanceCalendar';
import { AIBoardSandbox } from '../AIBoardSandbox';
import { AISystemReview } from '../AISystemReview';
import { Student, Teacher, ResourceItem, FinancialTransaction, AccentColor } from '../../types';
import { getThemeClasses, ACCENT_COLORS_METADATA } from '../../lib/themeUtils';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { 
  GraduationCap, 
  Users, 
  Folder, 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownRight, 
  Plus, 
  Search, 
  Trash2, 
  ChevronRight, 
  File, 
  Coins, 
  DollarSign, 
  LogOut, 
  CheckCircle2, 
  X, 
  Percent, 
  MapPin, 
  Phone, 
  Mail, 
  Star,
  Settings,
  FolderPlus,
  ArrowRight,
  UserPlus,
  GripVertical,
  Edit
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AdminDashboardProps {
  activeTab: string;
  onChangeTab?: (tab: any) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ activeTab, onChangeTab }) => {
  const { 
    students, addStudent, updateStudent, deleteStudent,
    teachers, addTeacher, updateTeacher, deleteTeacher,
    resources, addResource, deleteResource,
    transactions, addTransaction, balance,
    attendance,
    theme, updateTheme, news
  } = useApp();

  const cl = getThemeClasses(theme.accentColor);

  // Active module sub-state variables
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentModalTab, setStudentModalTab] = useState<'notas' | 'asistencias'>('notas');
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [newStudentData, setNewStudentData] = useState({
    nombre: '', apellido: '', contacto: 987654321, grado: 10, nivel: 'Secundaria', observacion: '', estado: true
  });
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editStudentData, setEditStudentData] = useState({
    nombre: '', apellido: '', contacto: 987654321, grado: 10, nivel: 'Secundaria', observacion: '', estado: true
  });

  const [teacherSearch, setTeacherSearch] = useState('');
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  const [newTeacherData, setNewTeacherData] = useState({
    nombre: '', apellido: '', edad: 35, dni: '', telefono: 954123456, codigo: '', foto_url: '', fecha_vencimiento: 2028, activado: true,
    subject: 'Matemáticas', salary: '1800', activeCourses: '10° Grado A'
  });

  // Resources state (Single click storage system)
  const [currentFolder, setCurrentFolder] = useState<ResourceItem | null>(null);
  const [showAddResourceModal, setShowAddResourceModal] = useState(false);
  const [newResourceName, setNewResourceName] = useState('');
  const [newResourceType, setNewResourceType] = useState<'file' | 'folder'>('file');
  const [newResourceSize, setNewResourceSize] = useState('1.5 MB');

  // Finances actions
  const [showFinanceModal, setShowFinanceModal] = useState<'ingreso' | 'egreso' | null>(null);
  const [financeForm, setFinanceForm] = useState({
    amount: '', concept: '', category: 'Colegiatura' as any, targetId: ''
  });

  // Quick actions widget state
  const [adminWidgets, setAdminWidgets] = useState<string[]>(() => {
    const saved = localStorage.getItem('edu_admin_widgets');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return ['add-student', 'add-teacher', 'add-income', 'add-expense', 'upload-resource', 'view-finances'];
  });
  const [showWidgetConfig, setShowWidgetConfig] = useState(false);
  const [draggedWidgetIdx, setDraggedWidgetIdx] = useState<number | null>(null);
  const [activeStatsTab, setActiveStatsTab] = useState<'financial' | 'enrollment'>('financial');

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

  // Handler: Add Student
  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    addStudent({
      nombre: newStudentData.nombre,
      apellido: newStudentData.apellido,
      contacto: Number(newStudentData.contacto),
      grado: Number(newStudentData.grado),
      nivel: newStudentData.nivel,
      observacion: newStudentData.observacion,
      estado: newStudentData.estado,
      
      // compatibility mappings
      name: `${newStudentData.nombre} ${newStudentData.apellido}`.trim(),
      email: `${newStudentData.nombre.toLowerCase().replace(/\s+/g, '')}.${newStudentData.apellido.toLowerCase().replace(/\s+/g, '')}@sistema.edu`,
      grade: `${newStudentData.grado}° Grado`,
      section: 'A',
      parentName: `Apoderado de ${newStudentData.nombre}`,
      parentPhone: `+51 ${newStudentData.contacto}`,
      balance: 0,
      grades: [
        { subject: 'Matemáticas', score: Math.round(11 + Math.random() * 9) },
        { subject: 'Ciencias', score: Math.round(11 + Math.random() * 9) },
        { subject: 'Historia', score: Math.round(11 + Math.random() * 9) },
      ],
      attendanceRate: 95,
      avatarUrl: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 999999)}?auto=format&fit=crop&q=80&w=120`,
      status: newStudentData.estado ? 'active' : 'inactive'
    });
    // Reset form
    setNewStudentData({
      nombre: '', apellido: '', contacto: 987654321, grado: 10, nivel: 'Secundaria', observacion: '', estado: true
    });
    setShowAddStudentModal(false);
  };

  const startEditStudent = (student: Student) => {
    setEditingStudent(student);
    setEditStudentData({
      nombre: student.nombre || student.name?.split(' ')[0] || '',
      apellido: student.apellido || student.name?.split(' ').slice(1).join(' ') || '',
      contacto: student.contacto || 987654321,
      grado: student.grado || 10,
      nivel: student.nivel || 'Secundaria',
      observacion: student.observacion || '',
      estado: student.estado !== undefined ? student.estado : student.status === 'active'
    });
  };

  const handleEditStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    updateStudent({
      ...editingStudent,
      nombre: editStudentData.nombre,
      apellido: editStudentData.apellido,
      contacto: Number(editStudentData.contacto),
      grado: Number(editStudentData.grado),
      nivel: editStudentData.nivel,
      observacion: editStudentData.observacion,
      estado: editStudentData.estado,
      
      // compatibility update
      name: `${editStudentData.nombre} ${editStudentData.apellido}`.trim(),
      status: editStudentData.estado ? 'active' : 'inactive',
      grade: `${editStudentData.grado}° Grado`
    });
    setEditingStudent(null);
  };

  // Handler: Add Teacher
  const handleAddTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    addTeacher({
      nombre: newTeacherData.nombre,
      apellido: newTeacherData.apellido,
      edad: Number(newTeacherData.edad),
      dni: newTeacherData.dni,
      telefono: Number(newTeacherData.telefono),
      codigo: newTeacherData.codigo || `DOC-${Math.floor(100 + Math.random() * 900)}`,
      foto_url: newTeacherData.foto_url || `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 999999)}?auto=format&fit=crop&q=80&w=120`,
      fecha_vencimiento: Number(newTeacherData.fecha_vencimiento),
      activado: newTeacherData.activado,
      si_pass: true,
      rol: 'docente',

      // compatibility mappings
      name: `Prof. ${newTeacherData.nombre} ${newTeacherData.apellido}`,
      email: `${newTeacherData.nombre.toLowerCase().replace(/\s+/g, '')}.${newTeacherData.apellido.toLowerCase().replace(/\s+/g, '')}@sistema.edu`,
      subject: newTeacherData.subject,
      phone: `+51 ${newTeacherData.telefono}`,
      salary: parseFloat(newTeacherData.salary) || 1800,
      paymentStatus: 'paid',
      activeCourses: newTeacherData.activeCourses.split(',').map(c => c.trim()),
      avatarUrl: newTeacherData.foto_url || `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 999999)}?auto=format&fit=crop&q=80&w=120`,
      rating: 4.5
    });
    setNewTeacherData({
      nombre: '', apellido: '', edad: 35, dni: '', telefono: 954123456, codigo: '', foto_url: '', fecha_vencimiento: 2028, activado: true,
      subject: 'Matemáticas', salary: '1800', activeCourses: '10° Grado A'
    });
    setShowAddTeacherModal(false);
  };

  // Handler: Create simulated resource folder/file (Single click manager with structural constraint)
  const handleAddResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResourceName) return;

    // Outer root level can ONLY create folders, Inner folder level can ONLY create files/resources
    const forcedType = currentFolder ? 'file' : 'folder';
    
    addResource(currentFolder ? currentFolder.id : null, {
      name: newResourceName,
      type: forcedType,
      size: forcedType === 'file' ? newResourceSize : undefined,
    });
    
    // Refresh folder view reference if we added inside a subfolder
    if (currentFolder) {
      const refreshedFolder = resources.find(r => r.id === currentFolder.id);
      if (refreshedFolder) {
        setCurrentFolder(refreshedFolder);
      } else {
        setCurrentFolder(null); // Return to root
      }
    }

    setNewResourceName('');
    setShowAddResourceModal(false);
  };

  // Handler: Action financially (Insert or withdraw money)
  const handleFinanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(financeForm.amount);
    if (!parsedAmount || parsedAmount <= 0 || !financeForm.concept) return;

    addTransaction({
      type: showFinanceModal!,
      amount: parsedAmount,
      concept: financeForm.concept,
      category: financeForm.category,
      studentId: financeForm.targetId && financeForm.category === 'Colegiatura' ? financeForm.targetId : undefined,
      teacherId: financeForm.targetId && financeForm.category === 'Salario Docente' ? financeForm.targetId : undefined,
    });

    setFinanceForm({ amount: '', concept: '', category: 'Colegiatura', targetId: '' });
    setShowFinanceModal(null);
  };


  /* =========================================================================
     MODULE: INICIO (HOME DASHBOARD)
     ========================================================================= */
  const renderInicioValue = () => {
    const totalEstudios = students.length;
    const totalProfes = teachers.length;
    const pendingCollection = students.reduce((acc, curr) => acc + curr.balance, 0);
    
    return (
      <div className="space-y-6">
        
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 flex items-center gap-4 shadow-sm interactive-hover-lift">
            <div className={`p-3.5 rounded-xl ${cl.lightBg}`}>
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400">Total Estudiantes</p>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-zinc-150 mt-0.5">{totalEstudios}</h3>
              <p className="text-[10px] text-emerald-500 font-semibold flex items-center mt-0.5">
                <TrendingUp className="w-3 h-3 mr-0.5" /> +2 nuevos este mes
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 flex items-center gap-4 shadow-sm interactive-hover-lift">
            <div className="p-3.5 rounded-xl bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400">Planta Docente</p>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-zinc-150 mt-0.5">{totalProfes}</h3>
              <p className="text-[10px] text-gray-500 font-semibold flex items-center mt-0.5">
                100% Calificados
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 flex items-center gap-4 shadow-sm interactive-hover-lift">
            <div className={`p-3.5 rounded-xl ${cl.lightBg}`}>
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400">Balance Escolar</p>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-zinc-150 mt-0.5">
                ${balance.toLocaleString('es-ES')}
              </h3>
              <p className="text-[10px] text-emerald-500 font-semibold flex items-center mt-0.5">
                <TrendingUp className="w-3 h-3 mr-0.5" /> Cuenta principal
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 flex items-center gap-4 shadow-sm interactive-hover-lift">
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400">Debido Mensualidades</p>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-zinc-150 mt-0.5">
                ${pendingCollection.toLocaleString('es-ES')}
              </h3>
              <p className="text-[10px] text-amber-500 font-semibold flex items-center mt-0.5">
                Cobro pendiente
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions Widget Area */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-gray-850 dark:text-zinc-200 flex items-center gap-1.5 font-sans">
                <span>⚡ Acciones Rápidas Personalizables</span>
              </h3>
              <p className="text-[11px] text-gray-400">Ordena tus accesos arrastrándolos y soltándolos, o pulsa "Ajustar Accesos" para quitarlos/ponerlos.</p>
            </div>
            
            <button
              id="admin-widget-config-toggle"
              type="button"
              onClick={() => setShowWidgetConfig(!showWidgetConfig)}
              className="self-start text-xs font-semibold px-3 py-1.5 bg-gray-50 hover:bg-gray-100 dark:bg-zinc-800 dark:hover:bg-zinc-750 border border-gray-150 dark:border-zinc-700 rounded-lg text-gray-650 dark:text-zinc-300 transition-all select-none"
            >
              {showWidgetConfig ? 'Cerrar Ajustes' : '🔧 Ajustar Accesos'}
            </button>
          </div>

          {/* Configuration Grid */}
          <AnimatePresence>
            {showWidgetConfig && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden border-b border-gray-100 dark:border-zinc-850 pb-4"
              >
                <div className="bg-gray-50/50 dark:bg-zinc-950/30 p-4 rounded-xl border border-gray-150/70 dark:border-zinc-800 space-y-3">
                  <p className="text-xs font-extrabold text-gray-600 dark:text-zinc-400">Selecciona qué accesos rápidos tener disponibles en tu panel principal:</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                    {[
                      { id: 'add-student', title: 'Matricular Alumno', desc: 'Registra un nuevo estudiante', icon: UserPlus },
                      { id: 'add-teacher', title: 'Contratar Docente', desc: 'Registra un nuevo profesor', icon: Plus },
                      { id: 'add-income', title: 'Registrar Ingreso', desc: 'Registra cobro administrativo', icon: TrendingUp },
                      { id: 'add-expense', title: 'Registrar Egreso', desc: 'Desembolso o pago de materiales', icon: TrendingDown },
                      { id: 'upload-resource', title: 'Añadir Recurso', desc: 'Fichero o carpeta digital', icon: FolderPlus },
                      { id: 'view-finances', title: 'Caja y Transacciones', desc: 'Ver estado general de caja', icon: Coins },
                      { id: 'view-students', title: 'Ver Estudiantes', desc: 'Directorio y boletas escolares', icon: GraduationCap },
                      { id: 'system-config', title: 'Propiedades Visuales', desc: 'Gestor de temática y color', icon: Settings },
                    ].map(widget => {
                      const isChecked = adminWidgets.includes(widget.id);
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
                                next = adminWidgets.filter(id => id !== widget.id);
                              } else {
                                next = [...adminWidgets, widget.id];
                              }
                              setAdminWidgets(next);
                              localStorage.setItem('edu_admin_widgets', JSON.stringify(next));
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

          {/* Active Widgets Drag and Drop Grid */}
          {(() => {
            const ALL_ADMIN_WIDGETS = [
              { id: 'add-student', title: 'Matricular Alumno', desc: 'Registra un nuevo estudiante', icon: UserPlus, color: 'text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-950/30', action: () => setShowAddStudentModal(true) },
              { id: 'add-teacher', title: 'Contratar Docente', desc: 'Registra un nuevo profesor', icon: Plus, color: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/30', action: () => setShowAddTeacherModal(true) },
              { id: 'add-income', title: 'Registrar Ingreso', desc: 'Registra cobro administrativo', icon: TrendingUp, color: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/30', action: () => setShowFinanceModal('ingreso') },
              { id: 'add-expense', title: 'Registrar Egreso', desc: 'Desembolso o pago de materiales', icon: TrendingDown, color: 'text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/30', action: () => setShowFinanceModal('egreso') },
              { id: 'upload-resource', title: 'Añadir Recurso', desc: 'Fichero o carpeta digital', icon: FolderPlus, color: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/30', action: () => setShowAddResourceModal(true) },
              { id: 'view-finances', title: 'Caja y Transacciones', desc: 'Ver estado general de caja', icon: Coins, color: 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-950/30', action: () => onChangeTab?.('finanzas') },
              { id: 'view-students', title: 'Ver Estudiantes', desc: 'Directorio y boletas escolares', icon: GraduationCap, color: 'text-pink-600 bg-pink-50 dark:text-pink-400 dark:bg-pink-950/30', action: () => onChangeTab?.('estudiantes') },
              { id: 'system-config', title: 'Propiedades Visuales', desc: 'Gestor de temática y color', icon: Settings, color: 'text-slate-600 bg-slate-50 dark:text-slate-400 dark:bg-slate-950/30', action: () => onChangeTab?.('configuracion') },
            ];

            const activeWidgetData = adminWidgets
              .map(id => ALL_ADMIN_WIDGETS.find(w => w.id === id))
              .filter((w): w is typeof ALL_ADMIN_WIDGETS[0] => !!w);

            const handleDragStartLocal = (idx: number) => {
              setDraggedWidgetIdx(idx);
            };

            const handleDragOverLocal = (e: React.DragEvent) => {
              e.preventDefault();
            };

            const handleDropLocal = (targetIdx: number) => {
              if (draggedWidgetIdx === null || draggedWidgetIdx === targetIdx) return;
              const reordered = [...adminWidgets];
              const [draggedItem] = reordered.splice(draggedWidgetIdx, 1);
              reordered.splice(targetIdx, 0, draggedItem);
              setAdminWidgets(reordered);
              localStorage.setItem('edu_admin_widgets', JSON.stringify(reordered));
              setDraggedWidgetIdx(null);
            };

            if (activeWidgetData.length === 0) {
              return (
                <div className="text-center py-6 border border-dashed border-gray-200 dark:border-zinc-800 rounded-xl text-xs text-gray-400">
                  No tienes accesos rápidos configurados en este momento. Pulsa en "Ajustar Accesos" de arriba.
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
                      className="group bg-white dark:bg-zinc-900 border border-gray-150/70 dark:border-zinc-800 rounded-xl p-3.5 flex items-center justify-between gap-2 border-l-3 border-l-indigo-500 dark:border-l-indigo-400 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing hover:border-gray-350 dark:hover:border-zinc-700"
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
                          <h4 className="text-xs font-extrabold text-gray-800 dark:text-zinc-200 group-hover:text-indigo-650 dark:group-hover:text-indigo-400 transition-colors truncate">
                            {widget.title}
                          </h4>
                          <p className="text-[10px] text-gray-400 truncate mt-0.5">{widget.desc}</p>
                        </div>
                      </button>

                      {/* Drag Handle block */}
                      <div className="flex items-center text-gray-300 dark:text-zinc-700 group-hover:text-gray-450 dark:group-hover:text-zinc-500 transition-colors px-1 cursor-grab">
                        <GripVertical className="w-4 h-4 shrink-0" />
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>

        {/* Financial Flow Performance Tracker Graphics using Recharts */}
        {(() => {
          const liveIncomes = transactions.filter(t => t.type === 'ingreso').reduce((a, b) => a + b.amount, 0);
          const liveExpenses = transactions.filter(t => t.type === 'egreso').reduce((a, b) => a + b.amount, 0);

          const getThemeColorHex = (accent: AccentColor) => {
            switch (accent) {
              case 'emerald': return '#10b981';
              case 'purple': return '#a855f7';
              case 'rose': return '#f43f5e';
              case 'amber': return '#f59e0b';
              case 'blue': return '#3b82f6';
              case 'indigo': return '#6366f1';
              default: return '#4f46e5';
            }
          };
          const activeColorHex = getThemeColorHex(theme.accentColor);

          const financialData = [
            { name: 'Ene', Ingresos: 4200, Egresos: 3100 },
            { name: 'Feb', Ingresos: 4800, Egresos: 2800 },
            { name: 'Mar', Ingresos: 5400, Egresos: 3500 },
            { name: 'Abr', Ingresos: 3800, Egresos: 3200 },
            { name: 'May', Ingresos: 5900, Egresos: 3500 },
            { name: 'Jun', Ingresos: 6100 + liveIncomes, Egresos: 3800 + liveExpenses },
          ];

          const enrollmentData = [
            { name: 'Ene', Estudiantes: Math.max(80, totalEstudios - 30) },
            { name: 'Feb', Estudiantes: Math.max(92, totalEstudios - 20) },
            { name: 'Mar', Estudiantes: Math.max(104, totalEstudios - 12) },
            { name: 'Abr', Estudiantes: Math.max(115, totalEstudios - 6) },
            { name: 'May', Estudiantes: Math.max(122, totalEstudios - 2) },
            { name: 'Jun', Estudiantes: totalEstudios },
          ];

          const CustomTooltip = ({ active, payload, label }: any) => {
            if (active && payload && payload.length) {
              return (
                <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-gray-150 dark:border-zinc-800 p-3 rounded-xl shadow-xl text-left select-none text-xs">
                  <p className="font-extrabold text-gray-800 dark:text-zinc-200 mb-1.5">{label}</p>
                  <div className="space-y-1 font-semibold">
                    {payload.map((pld: any, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <span 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: pld.color || pld.fill }} 
                        />
                        <span className="text-gray-500 dark:text-zinc-450">{pld.name}:</span>
                        <span className="text-gray-800 dark:text-zinc-100 font-mono">
                          ${(pld.value || 0).toLocaleString('es-ES')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }
            return null;
          };

          const EnrollmentTooltip = ({ active, payload, label }: any) => {
            if (active && payload && payload.length) {
              return (
                <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-gray-150 dark:border-zinc-800 p-3 rounded-xl shadow-xl text-left select-none text-xs">
                  <p className="font-extrabold text-gray-800 dark:text-zinc-200 mb-1.5">{label}</p>
                  <div className="flex items-center gap-2 font-semibold">
                    <span 
                      className="w-2.5 h-2.5 rounded-full" 
                      style={{ backgroundColor: payload[0].color }} 
                    />
                    <span className="text-gray-500 dark:text-zinc-450">Matrícula:</span>
                    <span className="text-gray-800 dark:text-zinc-100 font-mono font-extrabold">
                      {payload[0].value} Alumnos
                    </span>
                  </div>
                </div>
              );
            }
            return null;
          };

          return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 lg:col-span-2 shadow-sm flex flex-col justify-between">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                  <div>
                    <h3 className="text-sm font-bold text-gray-850 dark:text-zinc-200">Estadísticas del Colegio</h3>
                    <p className="text-xs text-gray-400">Rendimiento financiero e histórico de ingreso estudiantil</p>
                  </div>

                  {/* Tab Selector Button Area */}
                  <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-zinc-950 p-1 rounded-xl border border-gray-150/70 dark:border-zinc-850 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setActiveStatsTab('financial')}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        activeStatsTab === 'financial'
                          ? `${cl.primaryBg} text-white shadow-sm`
                          : 'text-gray-500 dark:text-zinc-450 hover:text-gray-850 dark:hover:text-zinc-250'
                      }`}
                    >
                      Flujo de Caja
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveStatsTab('enrollment')}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        activeStatsTab === 'enrollment'
                          ? `${cl.primaryBg} text-white shadow-sm`
                          : 'text-gray-500 dark:text-zinc-450 hover:text-gray-850 dark:hover:text-zinc-250'
                      }`}
                    >
                      Tendencias de Matrícula
                    </button>
                  </div>
                </div>

                {/* Animated Chart Display */}
                <div className="h-64 w-full select-none">
                  <AnimatePresence mode="wait">
                    {activeStatsTab === 'financial' ? (
                      <motion.div
                        key="financial-chart"
                        initial={{ opacity: 0, scale: 0.99 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.99 }}
                        transition={{ duration: 0.2 }}
                        className="w-full h-full"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={financialData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.mode === 'dark' ? '#27272a' : '#f4f4f5'} />
                            <XAxis 
                              dataKey="name" 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{ fill: theme.mode === 'dark' ? '#a1a1aa' : '#71717a', fontSize: 10, fontWeight: 600 }} 
                            />
                            <YAxis 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{ fill: theme.mode === 'dark' ? '#a1a1aa' : '#71717a', fontSize: 10, fontWeight: 600 }}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: theme.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }} />
                            <Legend 
                              verticalAlign="top" 
                              height={36} 
                              iconType="circle" 
                              iconSize={8}
                              wrapperStyle={{ fontSize: 11, fontWeight: 600, paddingBottom: 15 }}
                            />
                            <Bar 
                              dataKey="Ingresos" 
                              fill={activeColorHex} 
                              radius={[4, 4, 0, 0]} 
                              name="Ingresos"
                            />
                            <Bar 
                              dataKey="Egresos" 
                              fill="#f43f5e" 
                              radius={[4, 4, 0, 0]} 
                              name="Egresos"
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="enrollment-chart"
                        initial={{ opacity: 0, scale: 0.99 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.99 }}
                        transition={{ duration: 0.2 }}
                        className="w-full h-full"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={enrollmentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={activeColorHex} stopOpacity={0.3}/>
                                <stop offset="95%" stopColor={activeColorHex} stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.mode === 'dark' ? '#27272a' : '#f4f4f5'} />
                            <XAxis 
                              dataKey="name" 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{ fill: theme.mode === 'dark' ? '#a1a1aa' : '#71717a', fontSize: 10, fontWeight: 600 }} 
                            />
                            <YAxis 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{ fill: theme.mode === 'dark' ? '#a1a1aa' : '#71717a', fontSize: 10, fontWeight: 600 }}
                            />
                            <Tooltip content={<EnrollmentTooltip />} />
                            <Legend 
                              verticalAlign="top" 
                              height={36} 
                              iconType="circle" 
                              iconSize={8}
                              wrapperStyle={{ fontSize: 11, fontWeight: 600, paddingBottom: 15 }}
                            />
                            <Area 
                              type="monotone" 
                              dataKey="Estudiantes" 
                              stroke={activeColorHex} 
                              strokeWidth={3} 
                              fillOpacity={1} 
                              fill="url(#colorStudents)" 
                              name="Alumnos Registrados"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

          {/* Quick Recent News Feed widget */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-850 dark:text-zinc-200 mb-4">Anuncios Recientes</h3>
              <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1">
                {news.map(item => (
                  <div key={item.id} className="border-b border-gray-150/70 dark:border-zinc-850 pb-3 last:border-b-0">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="text-[9px] font-bold px-1.5 py-0.2 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 rounded uppercase">
                        {item.category}
                      </span>
                      <span className="text-[10px] text-gray-400">{item.date}</span>
                    </div>
                    <h4 className="text-xs font-bold text-gray-800 dark:text-zinc-300 line-clamp-1 leading-snug">{item.title}</h4>
                    <p className="text-[11px] text-gray-500 dark:text-zinc-400 line-clamp-2 mt-0.5 leading-normal">{item.content}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="pt-2 border-t border-gray-100 dark:border-zinc-850 text-center mt-3">
              <button 
                id="news-admin-trigger"
                type="button" 
                className={`text-xs font-semibold ${cl.primaryText} hover:underline flex items-center gap-1.5 mx-auto`}
              >
                Escribir comunicado <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      );
    })()}

        {/* EnlaceC AI system auditor and pending tasks checks */}
        <AISystemReview />

      </div>
    );
  };


  /* =========================================================================
     MODULE: ESTUDIANTES (STUDENT CONTROL + REPORT CARD)
     ========================================================================= */
  const renderEstudiantesValue = () => {
    // Filtered students
    const filtered = students.filter(s => 
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.email.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.grade.toLowerCase().includes(studentSearch.toLowerCase())
    );

    return (
      <div className="space-y-6">
        
        {/* Actions header bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-gray-100 dark:border-zinc-810 shadow-sm">
          <div className="relative w-full sm:w-80">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              id="search-students"
              type="text"
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              placeholder="Buscar por nombre, curso..."
              className={`w-full pl-9 pr-4 py-2 text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white rounded-xl outline-none transition-all ${cl.ring}`}
            />
          </div>
          
          <button
            id="btn-add-student-trigger"
            type="button"
            onClick={() => setShowAddStudentModal(true)}
            className={`w-full sm:w-auto px-4 py-2 text-xs font-bold text-white rounded-xl ${cl.primaryBg} ${cl.primaryHoverBg} transition-all flex items-center justify-center gap-2 shadow-sm`}
          >
            <UserPlus className="w-4 h-4" />
            Matricular Estudiante
          </button>
        </div>

        {/* Tabular Directory with custom items */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50/75 dark:bg-zinc-950/60 border-b border-gray-100 dark:border-zinc-850">
                  <th className="px-4 py-3.5 text-[10px] font-extrabold uppercase tracking-widest text-gray-500 dark:text-zinc-400 select-none whitespace-nowrap">ID (UUID)</th>
                  <th className="px-4 py-3.5 text-[10px] font-extrabold uppercase tracking-widest text-gray-500 dark:text-zinc-400 select-none whitespace-nowrap">Estudiante</th>
                  <th className="px-4 py-3.5 text-[10px] font-extrabold uppercase tracking-widest text-gray-500 dark:text-zinc-400 select-none whitespace-nowrap">Contacto</th>
                  <th className="px-4 py-3.5 text-[10px] font-extrabold uppercase tracking-widest text-gray-500 dark:text-zinc-400 select-none whitespace-nowrap">Grado / Nivel</th>
                  <th className="px-4 py-3.5 text-[10px] font-extrabold uppercase tracking-widest text-gray-500 dark:text-zinc-400 select-none whitespace-nowrap">Observación</th>
                  <th className="px-4 py-3.5 text-[10px] font-extrabold uppercase tracking-widest text-gray-500 dark:text-zinc-400 select-none whitespace-nowrap">Estatus</th>
                  <th className="px-4 py-3.5 text-[10px] font-extrabold uppercase tracking-widest text-gray-500 dark:text-zinc-400 select-none whitespace-nowrap">Fecha Registro</th>
                  <th className="px-4 py-3.5 text-[10px] font-extrabold uppercase tracking-widest text-gray-500 dark:text-zinc-400 select-none whitespace-nowrap text-right">Reporte & Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-855">
                {filtered.map(student => (
                  <tr key={student.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                    <td className="p-4 font-mono text-[10px] text-gray-400 select-all" title={student.id}>
                      {student.id.substring(0, 8)}...
                    </td>
                    <td className="p-4 flex items-center gap-3">
                      <img
                        src={student.avatarUrl || `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 999999)}?auto=format&fit=crop&q=80&w=120`}
                        alt={student.nombre || student.name}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-xl object-cover ring-1 ring-gray-100"
                      />
                      <div>
                        <p className="font-bold text-gray-800 dark:text-zinc-200">
                          {student.nombre ? `${student.nombre} ${student.apellido || ''}` : student.name}
                        </p>
                        <p className="text-[10px] text-gray-400 font-mono mt-0.5">{student.email || `${student.id.substring(0,6)}@sistema.edu`}</p>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-gray-650 dark:text-zinc-300">
                      <p className="text-[10px] text-gray-400 font-mono flex items-center mt-0.5">
                        <Phone className="w-3 h-3 mr-1 inline" /> {student.contacto || student.parentPhone || 'No registrado'}
                      </p>
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-gray-700 dark:text-zinc-300">{student.grado || student.grade || '10'}° Grado</p>
                      <p className="text-[10px] text-gray-400 font-semibold mt-0.5">{student.nivel || 'Secundaria'}</p>
                    </td>
                    <td className="p-4 max-w-[150px] truncate" title={student.observacion}>
                      <span className="text-gray-500 dark:text-zinc-400 font-medium">
                        {student.observacion || 'Sin observaciones'}
                      </span>
                    </td>
                    <td className="p-4">
                      {(student.estado !== undefined ? student.estado : (student.status === 'active')) ? (
                        <span className="px-2 py-1 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                          Activo
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded text-[10px] font-bold uppercase bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-zinc-400">
                          Inactivo
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-gray-400 dark:text-zinc-500 font-mono text-[10px]">
                      {student.created_at ? new Date(student.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'No registrado'}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end items-center gap-1.5">
                        <button
                          id={`btn-report-${student.id}`}
                          type="button"
                          onClick={() => { setSelectedStudent(student); setStudentModalTab('notas'); }}
                          className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-bold transition-all ${cl.lightBg} border-transparent hover:brightness-105`}
                        >
                          Ver
                        </button>
                        <button
                          id={`btn-edit-student-trigger-${student.id}`}
                          type="button"
                          onClick={() => startEditStudent(student)}
                          className="p-1.5 text-gray-400 hover:text-indigo-500 hover:bg-gray-105 dark:hover:bg-zinc-800 rounded-lg transition-colors flex items-center justify-center"
                          title="Editar Estudiante"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          id={`btn-del-student-${student.id}`}
                          type="button"
                          onClick={() => deleteStudent(student.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-gray-105 dark:hover:bg-zinc-800 rounded-lg transition-colors flex items-center justify-center"
                          title="Eliminar Estudiante"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-gray-400">
                      Ningún estudiante coincide con el criterio de búsqueda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* POPUP MODAL: ESTUDIANTE FOLDER REPORT (BOLETÍN ACADÉMICO COHERENTE CON REQUISITO) */}
        <AnimatePresence>
          {selectedStudent && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedStudent(null)}
                className="fixed inset-0 bg-black/25 backdrop-blur-[5px]"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-2xl w-full max-w-xl p-6 relative z-10 shadow-2xl overflow-y-auto max-h-[90vh]"
              >
                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  className="absolute top-4 right-4 p-1.5 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-start gap-4 pb-5 border-b border-gray-100 dark:border-zinc-850">
                  <img
                    src={selectedStudent.avatarUrl}
                    alt={selectedStudent.name}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-gray-100 dark:ring-zinc-800"
                  />
                  <div>
                    <span className="text-[10px] font-bold uppercase py-0.5 px-2 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                      ID: {selectedStudent.id}
                    </span>
                    <h3 className="text-base font-bold text-gray-800 dark:text-zinc-150 mt-1">{selectedStudent.name}</h3>
                    <p className="text-xs text-gray-450">{selectedStudent.grade} • Sección {selectedStudent.section}</p>
                  </div>
                </div>

                {/* Sub-tab navigation bar */}
                <div className="flex border-b border-gray-100 dark:border-zinc-850/65 mt-4 text-xs font-bold gap-4 select-none">
                  <button
                    type="button"
                    onClick={() => setStudentModalTab('notas')}
                    className={`pb-2.5 px-1 relative transition-colors ${
                      studentModalTab === 'notas' 
                        ? 'text-indigo-650 dark:text-indigo-400 font-extrabold' 
                        : 'text-gray-400 hover:text-gray-600 dark:text-zinc-500'
                    }`}
                  >
                    <span>Boletín de Notas</span>
                    {studentModalTab === 'notas' && (
                      <motion.div layoutId="student_tab_indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStudentModalTab('asistencias')}
                    className={`pb-2.5 px-1 relative transition-colors ${
                      studentModalTab === 'asistencias' 
                        ? 'text-indigo-650 dark:text-indigo-400 font-extrabold' 
                        : 'text-gray-400 hover:text-gray-600 dark:text-zinc-500'
                    }`}
                  >
                    <span>Calendario de Asistencias</span>
                    {studentModalTab === 'asistencias' && (
                      <motion.div layoutId="student_tab_indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
                    )}
                  </button>
                </div>

                {/* Tab content swapping */}
                {studentModalTab === 'notas' ? (
                  <div className="mt-5 space-y-4 animate-in fade-in duration-200">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-450">Boletín Oficial de Notas</h4>
                    
                    <div className="bg-gray-50 dark:bg-zinc-950 rounded-xl p-4.5 border border-gray-100 dark:border-zinc-850/40 divide-y divide-gray-100 dark:divide-zinc-850">
                      {selectedStudent.grades.map((g, idx) => (
                        <div key={idx} className="flex justify-between items-center py-2.5 first:pt-0 last:pb-0">
                          <span className="text-xs font-semibold text-gray-650 dark:text-zinc-300">{g.subject}</span>
                          <div className="flex items-center gap-2.5">
                            {/* visual progress bar */}
                            <div className="w-20 h-1.5 bg-gray-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                              <div 
                                style={{ width: `${(g.score / 20) * 100}%` }} 
                                className={`h-full ${g.score >= 15 ? 'bg-emerald-500' : g.score >= 12 ? 'bg-blue-500' : 'bg-red-500'}`}
                              />
                            </div>
                            <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${g.score >= 15 ? 'bg-emerald-50 dark:bg-emerald-955/40 text-emerald-600' : 'bg-red-50 dark:bg-red-955/40 text-red-650'}`}>
                              {g.score}/20
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Summary performance stats block */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Card: Promedio general */}
                      <div id="card-report-promedio" className="relative overflow-hidden bg-gradient-to-br from-indigo-50/60 via-indigo-50/20 to-transparent dark:from-indigo-950/25 dark:via-indigo-950/10 dark:to-transparent p-4 rounded-2xl border border-indigo-100/50 dark:border-indigo-900/30 transition-all duration-300 hover:shadow-md hover:shadow-indigo-500/5">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                            <GraduationCap className="w-4 h-4" />
                          </div>
                          <span className="text-[11px] text-gray-500 dark:text-zinc-400 font-bold uppercase tracking-wider">Promedio General</span>
                        </div>
                        <div className="mt-3 flex items-baseline gap-1.5">
                          <span className="text-2xl font-extrabold text-indigo-750 dark:text-indigo-300 tracking-tight">
                            {(selectedStudent.grades.reduce((a, b) => a + b.score, 0) / selectedStudent.grades.length).toFixed(1)}
                          </span>
                          <span className="text-xs text-gray-400 dark:text-zinc-500 font-bold">/ 20</span>
                        </div>
                        <div className="mt-1.5 text-[10px] font-bold text-indigo-600/80 dark:text-indigo-400/80">
                          {(selectedStudent.grades.reduce((a, b) => a + b.score, 0) / selectedStudent.grades.length) >= 15 ? 'Excelente Rendimiento' : 'Rendimiento Regular'}
                        </div>
                      </div>

                      {/* Card: Tasa Asistencia */}
                      <div id="card-report-asistencia" className="relative overflow-hidden bg-gradient-to-br from-emerald-50/60 via-emerald-50/20 to-transparent dark:from-emerald-950/25 dark:via-emerald-950/10 dark:to-transparent p-4 rounded-2xl border border-emerald-100/50 dark:border-emerald-900/30 transition-all duration-300 hover:shadow-md hover:shadow-emerald-500/5">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                          <span className="text-[11px] text-gray-500 dark:text-zinc-400 font-bold uppercase tracking-wider">Tasa Asistencia</span>
                        </div>
                        <div className="mt-3 flex items-baseline gap-1.5">
                          <span className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400 tracking-tight">
                            {selectedStudent.attendanceRate}%
                          </span>
                        </div>
                        <div className="mt-1.5 text-[10px] font-bold text-emerald-650/80 dark:text-emerald-400/80">
                          {selectedStudent.attendanceRate >= 90 ? 'Asistencia Sobresaliente' : 'Requiere Seguimiento'}
                        </div>
                      </div>
                    </div>

                    <div className="p-3.5 bg-blue-50/30 dark:bg-blue-950/10 border border-blue-100/40 rounded-xl">
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase">Observación Pedagógica</span>
                      <p className="text-xs text-slate-550 dark:text-zinc-400 mt-1 leading-normal italic">
                        "El estudiante demuestra un {selectedStudent.grades.reduce((a, b) => a + b.score, 0)/3 >= 15 ? 'sobresaliente interés y proactividad' : 'progreso básico, requiriendo reforzar conceptos extracurriculares'} en las horas de clase. Cumple con el reglamento y asiste de manera oportuna."
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-5 animate-in fade-in duration-200">
                    <AttendanceCalendar 
                      studentId={selectedStudent.id}
                      studentName={selectedStudent.name}
                      attendance={attendance}
                    />
                  </div>
                )}

                <div className="mt-6 flex justify-end gap-2.5 border-t border-gray-150 dark:border-zinc-850 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      alert('Descarga de Boletín simulada en formato PDF de alta fidelidad.');
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold text-white ${cl.primaryBg} ${cl.primaryHoverBg} transition-all`}
                  >
                    Exportar PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedStudent(null)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-gray-700 dark:text-zinc-300 rounded-xl text-xs font-semibold transition-all"
                  >
                    Cerrar Boleta
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* POPUP MODAL: ADD STUDENT FORM */}
        <AnimatePresence>
          {showAddStudentModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowAddStudentModal(false)}
                className="fixed inset-0 bg-black/25 backdrop-blur-[5px]"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl w-full max-w-md p-6 relative z-10 shadow-2xl"
              >
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-zinc-850 mb-5">
                  <h3 className="text-sm font-bold text-gray-800 dark:text-zinc-200">Matricular Estudiante Nuevo</h3>
                  <button type="button" onClick={() => setShowAddStudentModal(false)} className="p-1 hover:bg-gray-150 rounded text-gray-400">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleAddStudent} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">Nombre</label>
                      <input
                        required
                        type="text"
                        placeholder="Ej. Sofía"
                        value={newStudentData.nombre}
                        onChange={(e) => setNewStudentData({ ...newStudentData, nombre: e.target.value })}
                        className={`w-full p-2 py-2.5 text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white rounded-xl outline-none transition-all ${cl.ring}`}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">Apellido</label>
                      <input
                        required
                        type="text"
                        placeholder="Ej. Valentino"
                        value={newStudentData.apellido}
                        onChange={(e) => setNewStudentData({ ...newStudentData, apellido: e.target.value })}
                        className={`w-full p-2 py-2.5 text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white rounded-xl outline-none transition-all ${cl.ring}`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">Grado Escolar</label>
                      <select
                        value={newStudentData.grado}
                        onChange={(e) => setNewStudentData({ ...newStudentData, grado: Number(e.target.value) })}
                        className={`w-full p-2 py-2.5 text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white rounded-xl outline-none transition-all ${cl.ring}`}
                      >
                        <option value={10}>10° Grado</option>
                        <option value={11}>11° Grado</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">Nivel</label>
                      <select
                        value={newStudentData.nivel}
                        onChange={(e) => setNewStudentData({ ...newStudentData, nivel: e.target.value })}
                        className={`w-full p-2 py-2.5 text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white rounded-xl outline-none transition-all ${cl.ring}`}
                      >
                        <option value="Primaria">Primaria</option>
                        <option value="Secundaria">Secundaria</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">Celular de Contacto</label>
                      <input
                        required
                        type="number"
                        placeholder="Ej. 987654321"
                        value={newStudentData.contacto}
                        onChange={(e) => setNewStudentData({ ...newStudentData, contacto: Number(e.target.value) })}
                        className={`w-full p-2 py-2.5 text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white rounded-xl outline-none transition-all ${cl.ring}`}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">Estado</label>
                      <select
                        value={newStudentData.estado ? "true" : "false"}
                        onChange={(e) => setNewStudentData({ ...newStudentData, estado: e.target.value === "true" })}
                        className={`w-full p-2 py-2.5 text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white rounded-xl outline-none transition-all ${cl.ring}`}
                      >
                        <option value="true">Activo</option>
                        <option value="false">Inactivo</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">Observación</label>
                    <textarea
                      placeholder="Ej. Estudiante destaca en matemáticas..."
                      value={newStudentData.observacion}
                      onChange={(e) => setNewStudentData({ ...newStudentData, observacion: e.target.value })}
                      className={`w-full p-2 py-2 text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white rounded-xl outline-none transition-all ${cl.ring} h-16 resize-none`}
                    />
                  </div>

                  <div className="pt-4 border-t border-gray-150 dark:border-zinc-850 flex justify-end gap-2 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setShowAddStudentModal(false)}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 rounded-xl"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className={`px-4 py-2 text-white font-bold rounded-xl ${cl.primaryBg} ${cl.primaryHoverBg}`}
                    >
                      Matricular e Inscribir
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* POPUP MODAL: EDIT STUDENT FORM */}
        <AnimatePresence>
          {editingStudent && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setEditingStudent(null)}
                className="fixed inset-0 bg-black/25 backdrop-blur-[5px]"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl w-full max-w-md p-6 relative z-10 shadow-2xl"
              >
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-zinc-850 mb-5">
                  <h3 className="text-sm font-bold text-gray-800 dark:text-zinc-200">Editar Información del Estudiante</h3>
                  <button type="button" onClick={() => setEditingStudent(null)} className="p-1 hover:bg-gray-150 rounded text-gray-400">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleEditStudentSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">Nombre</label>
                      <input
                        required
                        type="text"
                        placeholder="Ej. Sofía"
                        value={editStudentData.nombre}
                        onChange={(e) => setEditStudentData({ ...editStudentData, nombre: e.target.value })}
                        className={`w-full p-2 py-2.5 text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white rounded-xl outline-none transition-all ${cl.ring}`}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">Apellido</label>
                      <input
                        required
                        type="text"
                        placeholder="Ej. Valentino"
                        value={editStudentData.apellido}
                        onChange={(e) => setEditStudentData({ ...editStudentData, apellido: e.target.value })}
                        className={`w-full p-2 py-2.5 text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white rounded-xl outline-none transition-all ${cl.ring}`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">Grado Escolar</label>
                      <select
                        value={editStudentData.grado}
                        onChange={(e) => setEditStudentData({ ...editStudentData, grado: Number(e.target.value) })}
                        className={`w-full p-2 py-2.5 text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white rounded-xl outline-none transition-all ${cl.ring}`}
                      >
                        <option value={10}>10° Grado</option>
                        <option value={11}>11° Grado</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">Nivel</label>
                      <select
                        value={editStudentData.nivel}
                        onChange={(e) => setEditStudentData({ ...editStudentData, nivel: e.target.value })}
                        className={`w-full p-2 py-2.5 text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white rounded-xl outline-none transition-all ${cl.ring}`}
                      >
                        <option value="Primaria">Primaria</option>
                        <option value="Secundaria">Secundaria</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">Celular de Contacto</label>
                      <input
                        required
                        type="number"
                        placeholder="Ej. 987654321"
                        value={editStudentData.contacto}
                        onChange={(e) => setEditStudentData({ ...editStudentData, contacto: Number(e.target.value) })}
                        className={`w-full p-2 py-2.5 text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white rounded-xl outline-none transition-all ${cl.ring}`}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">Estado</label>
                      <select
                        value={editStudentData.estado ? "true" : "false"}
                        onChange={(e) => setEditStudentData({ ...editStudentData, estado: e.target.value === "true" })}
                        className={`w-full p-2 py-2.5 text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white rounded-xl outline-none transition-all ${cl.ring}`}
                      >
                        <option value="true">Activo</option>
                        <option value="false">Inactivo</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">Observación</label>
                    <textarea
                      placeholder="Ej. Estudiante destaca en matemáticas..."
                      value={editStudentData.observacion}
                      onChange={(e) => setEditStudentData({ ...editStudentData, observacion: e.target.value })}
                      className={`w-full p-2 py-2 text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white rounded-xl outline-none transition-all ${cl.ring} h-16 resize-none`}
                    />
                  </div>

                  <div className="pt-4 border-t border-gray-150 dark:border-zinc-850 flex justify-end gap-2 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setEditingStudent(null)}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 rounded-xl"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className={`px-4 py-2 text-white font-bold rounded-xl ${cl.primaryBg} ${cl.primaryHoverBg}`}
                    >
                      Guardar Cambios
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
     MODULE: DOCENTES (TEACHERS DIRECTORY CONTROL)
     ========================================================================= */
  const renderDocentesValue = () => {
    const filtered = teachers.filter(t => 
      t.name.toLowerCase().includes(teacherSearch.toLowerCase()) ||
      t.subject.toLowerCase().includes(teacherSearch.toLowerCase())
    );

    return (
      <div className="space-y-6">
        
        {/* Actions bar for teachers */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-gray-100 dark:border-zinc-810 shadow-sm">
          <div className="relative w-full sm:w-80">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              id="search-teachers"
              type="text"
              value={teacherSearch}
              onChange={(e) => setTeacherSearch(e.target.value)}
              placeholder="Buscar docente o especialidad..."
              className={`w-full pl-9 pr-4 py-2 text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white rounded-xl outline-none transition-all ${cl.ring}`}
            />
          </div>
          
          <button
            id="btn-add-teacher-trigger"
            type="button"
            onClick={() => setShowAddTeacherModal(true)}
            className={`w-full sm:w-auto px-4 py-2 text-xs font-bold text-white rounded-xl ${cl.primaryBg} ${cl.primaryHoverBg} transition-all flex items-center justify-center gap-2 shadow-sm`}
          >
            <Plus className="w-4 h-4" />
            Registrar Nuevo Docente
          </button>
        </div>

        {/* Teachers List cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(teacher => (
            <div 
              key={teacher.id}
              className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
            >
              <button
                id={`btn-del-teacher-${teacher.id}`}
                type="button"
                onClick={() => deleteTeacher(teacher.id)}
                className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                title="Dar de baja docente"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-4.5 mb-4">
                <img
                  src={teacher.avatarUrl}
                  alt={teacher.name}
                  referrerPolicy="no-referrer"
                  className="w-13 h-13 rounded-2xl object-cover ring-2 ring-gray-50"
                />
                <div>
                  <h4 className="font-bold text-sm text-gray-850 dark:text-zinc-200 leading-tight">{teacher.name}</h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${cl.lightBg} inline-block mt-1`}>
                    Espec: {teacher.subject}
                  </span>
                </div>
              </div>

              {/* Specs detailed block */}
              <div className="space-y-2 border-t border-gray-100 dark:border-zinc-850/60 pt-3.5 text-xs text-slate-650 dark:text-zinc-400">
                <div className="flex justify-between">
                  <span className="text-gray-400">Cursos Asignados:</span>
                  <span className="font-bold text-gray-800 dark:text-zinc-300">{teacher.activeCourses.join(', ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Contacto:</span>
                  <span className="font-semibold font-mono">{teacher.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Remuneración Mensual:</span>
                  <span className="font-bold text-emerald-600">${teacher.salary.toLocaleString('es-ES')}</span>
                </div>
                <div className="flex justify-between items-center pb-1">
                  <span className="text-gray-400">Aprobación Alumnos:</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                    <span className="font-bold underline">{teacher.rating} / 5</span>
                  </div>
                </div>
              </div>

              {/* Actions & Payment Trigger */}
              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-zinc-850/60 flex items-center justify-between">
                <span className="text-[10px] text-gray-400 font-mono">ID: {teacher.id}</span>
                <button
                  id={`btn-view-teacher-details-${teacher.id}`}
                  type="button"
                  onClick={() => {
                    alert(`Detalles del docente: ${teacher.name}\nCorreo: ${teacher.email}\nSueldo: $${teacher.salary}\nTotal Clases: ${teacher.activeCourses.length}`);
                  }}
                  className={`text-xs font-bold ${cl.primaryText} hover:underline flex items-center gap-1`}
                >
                  Ver Ficha <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-full bg-white dark:bg-zinc-900 p-8 rounded-xl border border-gray-100 text-center text-gray-400">
              Ningún docente se encuentra registrado en el sistema bajo ese nombre.
            </div>
          )}
        </div>

        {/* MODAL: ADD TEACHER FORM */}
        <AnimatePresence>
          {showAddTeacherModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowAddTeacherModal(false)}
                className="fixed inset-0 bg-black/25 backdrop-blur-[5px]"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl w-full max-w-md p-6 relative z-10 shadow-2xl"
              >
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-zinc-850 mb-5">
                  <h3 className="text-sm font-bold text-gray-800 dark:text-zinc-200">Contratar y Registrar Docente</h3>
                  <button type="button" onClick={() => setShowAddTeacherModal(false)} className="p-1 hover:bg-gray-150 rounded text-gray-400">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleAddTeacher} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">Nombre</label>
                      <input
                        required
                        type="text"
                        placeholder="Ej. Fernando"
                        value={newTeacherData.nombre}
                        onChange={(e) => setNewTeacherData({ ...newTeacherData, nombre: e.target.value })}
                        className={`w-full p-2 py-2.5 text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white rounded-xl outline-none transition-all ${cl.ring}`}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">Apellido</label>
                      <input
                        required
                        type="text"
                        placeholder="Ej. Paz"
                        value={newTeacherData.apellido}
                        onChange={(e) => setNewTeacherData({ ...newTeacherData, apellido: e.target.value })}
                        className={`w-full p-2 py-2.5 text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white rounded-xl outline-none transition-all ${cl.ring}`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">Edad</label>
                      <input
                        required
                        type="number"
                        placeholder="Ej. 35"
                        value={newTeacherData.edad}
                        onChange={(e) => setNewTeacherData({ ...newTeacherData, edad: Number(e.target.value) })}
                        className={`w-full p-2 py-2.5 text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white rounded-xl outline-none transition-all ${cl.ring}`}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">DNI</label>
                      <input
                        required
                        type="text"
                        placeholder="Documento de identidad"
                        value={newTeacherData.dni}
                        onChange={(e) => setNewTeacherData({ ...newTeacherData, dni: e.target.value })}
                        className={`w-full p-2 py-2.5 text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white rounded-xl outline-none transition-all ${cl.ring}`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">Teléfono</label>
                      <input
                        required
                        type="number"
                        placeholder="9 dígitos"
                        value={newTeacherData.telefono}
                        onChange={(e) => setNewTeacherData({ ...newTeacherData, telefono: Number(e.target.value) })}
                        className={`w-full p-2 py-2.5 text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white rounded-xl outline-none transition-all ${cl.ring}`}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">Código de Docente</label>
                      <input
                        type="text"
                        placeholder="Ej. DOC-123"
                        value={newTeacherData.codigo}
                        onChange={(e) => setNewTeacherData({ ...newTeacherData, codigo: e.target.value })}
                        className={`w-full p-2 py-2.5 text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white rounded-xl outline-none transition-all ${cl.ring}`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">Materia Especialidad</label>
                      <select
                        value={newTeacherData.subject}
                        onChange={(e) => setNewTeacherData({ ...newTeacherData, subject: e.target.value })}
                        className={`w-full p-2 py-2.5 text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white rounded-xl outline-none transition-all ${cl.ring}`}
                      >
                        <option value="Matemáticas">Matemáticas</option>
                        <option value="Ciencias">Ciencias</option>
                        <option value="Historia">Historia</option>
                        <option value="Idiomas">Idiomas</option>
                        <option value="Otros">Otros</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">Sueldo Asignado ($)</label>
                      <input
                        required
                        type="number"
                        placeholder="1800"
                        value={newTeacherData.salary}
                        onChange={(e) => setNewTeacherData({ ...newTeacherData, salary: e.target.value })}
                        className={`w-full p-2 py-2.5 text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white rounded-xl outline-none transition-all ${cl.ring}`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">Fecha Vencimiento (Año)</label>
                      <input
                        required
                        type="number"
                        placeholder="Ej. 2028"
                        value={newTeacherData.fecha_vencimiento}
                        onChange={(e) => setNewTeacherData({ ...newTeacherData, fecha_vencimiento: Number(e.target.value) })}
                        className={`w-full p-2 py-2.5 text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white rounded-xl outline-none transition-all ${cl.ring}`}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">Estado de Cuenta</label>
                      <select
                        value={newTeacherData.activado ? "true" : "false"}
                        onChange={(e) => setNewTeacherData({ ...newTeacherData, activado: e.target.value === "true" })}
                        className={`w-full p-2 py-2.5 text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white rounded-xl outline-none transition-all ${cl.ring}`}
                      >
                        <option value="true">Activado / Habilitado</option>
                        <option value="false">Desactivado</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">Cursos Asignados (Separados por coma)</label>
                    <input
                      required
                      type="text"
                      placeholder="Ej. 10° Grado A, 11° Grado B"
                      value={newTeacherData.activeCourses}
                      onChange={(e) => setNewTeacherData({ ...newTeacherData, activeCourses: e.target.value })}
                      className={`w-full p-2 py-2.5 text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white rounded-xl outline-none transition-all ${cl.ring}`}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">Foto URL (Opcional)</label>
                    <input
                      type="text"
                      placeholder="https://..."
                      value={newTeacherData.foto_url}
                      onChange={(e) => setNewTeacherData({ ...newTeacherData, foto_url: e.target.value })}
                      className={`w-full p-2 py-2.5 text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white rounded-xl outline-none transition-all ${cl.ring}`}
                    />
                  </div>

                  <div className="pt-4 border-t border-gray-150 dark:border-zinc-850 flex justify-end gap-2 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setShowAddTeacherModal(false)}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 rounded-xl"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className={`px-4 py-2 text-white font-bold rounded-xl ${cl.primaryBg} ${cl.primaryHoverBg}`}
                    >
                      Dar de alta
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
     MODULE: RECURSOS (FILE MANAGER STYLE WITH SINGLE CLIK OPENING - REQUISITO)
     ========================================================================= */
  const renderRecursosValue = () => {
    // Current folder resources inside
    const currentDirectoryItems = currentFolder 
      ? (currentFolder.children || []) 
      : resources;

    const handleSingleClickResource = (item: ResourceItem) => {
      // If folder, open it in single click
      if (item.type === 'folder') {
        setCurrentFolder(item);
      } else {
        // If file, simulated viewing/download
        alert(`Visualizando archivo de alta resolución: ${item.name}\nTamaño: ${item.size || 'Desconocido'}\nEstatus escolar: Protegido`);
      }
    };

    const handleGoBack = () => {
      // Return to root drive folder
      setCurrentFolder(null);
    };

    return (
      <div className="space-y-6 animate-fade-in">
        
         {/* Drive directory controls header */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-white/40 dark:bg-zinc-900/45 backdrop-blur-xl p-4.5 rounded-2xl border border-white/40 dark:border-white/10 shadow-lg shadow-black/[0.03] dark:shadow-black/20 transition-all duration-300">
          <div className="flex items-center gap-3.5">
            <span className="p-2.5 bg-yellow-50 dark:bg-yellow-950/20 text-yellow-600 rounded-xl shadow-inner shrink-0">
              <Folder className="w-5 h-5 fill-yellow-250/20" />
            </span>
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none">Navegador Unificado de Recursos</h3>
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

          <div className="flex items-center gap-3 w-full lg:w-auto shrink-0 justify-end">
            {currentFolder && (
              <button
                id="btn-drive-back"
                type="button"
                onClick={handleGoBack}
                className="px-4 py-2.5 text-xs bg-white/40 hover:bg-white/60 dark:bg-zinc-800/40 dark:hover:bg-zinc-750/50 text-gray-700 dark:text-zinc-300 rounded-xl font-bold transition-all border border-white/40 dark:border-white/10 shadow-sm"
              >
                Subir de nivel
              </button>
            )}
            <button
              id="btn-drive-add-trigger"
              type="button"
              onClick={() => {
                setNewResourceType(currentFolder ? 'file' : 'folder');
                setShowAddResourceModal(true);
              }}
              className={`px-4.5 py-2.5 text-xs font-extrabold text-white rounded-xl ${cl.primaryBg} ${cl.primaryHoverBg} transition-all flex items-center justify-center gap-2 shadow-md hover:scale-[1.02] active:scale-95`}
            >
              {currentFolder ? (
                <>
                  <FileText className="w-4 h-4" />
                  Crear Recurso
                </>
              ) : (
                <>
                  <FolderPlus className="w-4 h-4" />
                  Crear Carpeta
                </>
              )}
            </button>
          </div>
        </div>

        {/* Dynamic Warning Helper (Outer folders, Inner files requirement) */}
        <div className="transition-all duration-300">
          {currentFolder ? (
            <div className="bg-blue-50/20 dark:bg-blue-955/5 backdrop-blur-lg border border-blue-100/40 dark:border-blue-900/20 p-4 rounded-2xl flex items-start gap-3.5 shadow-sm">
              <div className="p-2 bg-blue-100/50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl shrink-0">
                <FileText className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-blue-800 dark:text-blue-300">Nivel de Almacenamiento (Carpeta: {currentFolder.name})</p>
                <p className="text-[11px] text-blue-600/90 dark:text-blue-400/80 mt-1 font-semibold leading-relaxed">
                  Estás operando dentro de una carpeta creada. Para respetar la política de guardado unificado, en este nivel solo puedes crear <span className="underline font-bold">Recursos Académicos (Archivos)</span>. La creación de subcarpetas está inhabilitada aquí.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50/25 dark:bg-amber-955/5 backdrop-blur-lg border border-amber-100/30 dark:border-amber-900/10 p-4 rounded-2xl flex items-start gap-3.5 shadow-sm">
              <div className="p-2 bg-amber-100/50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 rounded-xl shrink-0">
                <Folder className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-amber-800 dark:text-amber-300">Nivel Raíz Educativa (Directorio)</p>
                <p className="text-[11px] text-amber-600/90 dark:text-amber-400/80 mt-1 font-semibold leading-relaxed">
                  Estás en la base modular de recursos escolares. Para mantener un portal limpio y consistente, aquí solo puedes iniciar y crear <span className="underline font-bold">Carpetas Temáticas principales</span>. La subida directa de archivos huérfanos está restringida en la raíz.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Drive Directory files list */}
        <div className="bg-white/40 dark:bg-zinc-900/45 backdrop-blur-xl rounded-2xl border border-white/40 dark:border-white/10 shadow-lg shadow-black/[0.02] dark:shadow-black/15 overflow-hidden p-6 transition-all">
          <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider mb-5">
            {currentFolder ? 'Recursos Compartidos en esta sección' : 'Carpetas Unificadas del Colegio'}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {currentDirectoryItems.map(item => (
              <div
                key={item.id}
                id={`drive-item-${item.id}`}
                onClick={() => handleSingleClickResource(item)}
                className="group border border-white/30 dark:border-white/5 bg-white/20 dark:bg-zinc-900/15 backdrop-blur-md hover:bg-white/40 dark:hover:bg-zinc-800/30 hover:border-white/45 dark:hover:border-white/15 hover:shadow-xl rounded-2xl p-4.5 flex flex-col items-center text-center cursor-pointer relative transition-all duration-300 hover:-translate-y-1"
              >
                <button
                  id={`btn-del-drive-item-${item.id}`}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation(); // Avoid opening
                    deleteResource(item.id);
                    if (currentFolder && item.id === currentFolder.id) {
                      setCurrentFolder(null);
                    }
                  }}
                  className="absolute top-2.5 right-2.5 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-955/40 rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                  title="Eliminar recurso permanentemente"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

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
                  <span className="text-[9px] text-gray-450 mt-1.5 font-bold px-1.5 py-0.5 bg-gray-100/50 dark:bg-zinc-800 rounded-md">{item.size}</span>
                ) : (
                  <span className="text-[9px] text-teal-650 dark:text-teal-400 mt-1.5 font-extrabold px-1.5 py-0.5 bg-teal-50 dark:bg-teal-950/40 rounded-md">
                    {(item.children || []).length} items
                  </span>
                )}
                
                <span className="text-[8px] text-gray-400 mt-2.5 font-mono text-center tracking-wider">{item.updatedAt.split(' ')[0]}</span>
              </div>
            ))}

            {currentDirectoryItems.length === 0 && (
              <div className="col-span-full py-20 text-center text-gray-450 flex flex-col items-center justify-center gap-4">
                <Folder className="w-12 h-12 text-gray-300 dark:text-zinc-700" />
                <div>
                  <p className="text-xs font-bold text-gray-600 dark:text-zinc-400">Esta sección se encuentra vacía</p>
                  <p className="text-[10px] text-gray-400 mt-1 font-medium max-w-xs mx-auto">
                    {currentFolder 
                      ? 'No hay archivos guardados aquí. Crea uno nuevo usando el botón de la parte superior.'
                      : 'No hay carpetas creadas en la raíz. Inicializa tu estructura organizadora escolar.'
                    }
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* DRIVE CREATION MODAL */}
        <AnimatePresence>
          {showAddResourceModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowAddResourceModal(false)}
                className="fixed inset-0 bg-black/25 backdrop-blur-[5px]"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl w-full max-w-sm p-6 relative z-10 shadow-2xl"
              >
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-zinc-850 mb-5">
                  <h3 className="text-sm font-bold text-gray-800 dark:text-zinc-200">
                    {currentFolder ? 'Crear Nuevo Archivo/Recurso' : 'Crear Nueva Carpeta'}
                  </h3>
                  <button type="button" onClick={() => setShowAddResourceModal(false)} className="p-1 hover:bg-gray-150 rounded text-gray-400">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleAddResource} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                      {currentFolder ? 'Nombre del Archivo / Material' : 'Nombre de la Carpeta'}
                    </label>
                    <input
                      required
                      type="text"
                      placeholder={currentFolder ? "Ej. Guia_Examen_Fisica.pdf" : "Ej. Ciencias Naturales"}
                      value={newResourceName}
                      onChange={(e) => setNewResourceName(e.target.value)}
                      className={`w-full p-2 py-2.5 text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white rounded-xl outline-none transition-all ${cl.ring}`}
                    />
                  </div>

                  {/* RESTRICTION DISPLAY COHERENT WITH USER MANDATE */}
                  <div className="bg-gray-50 dark:bg-zinc-950 p-4 rounded-2xl border border-gray-150 dark:border-zinc-800 text-xs shadow-sm">
                    <span className="block text-[10px] font-extrabold text-gray-400 dark:text-zinc-505 uppercase tracking-wider mb-2">
                      Tipo de Carga Habilitado
                    </span>
                    {currentFolder ? (
                      <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold">
                        <FileText className="w-4 h-4" />
                        <span>Recurso / Archivo de Estudio (Forzado)</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-550 font-bold">
                        <Folder className="w-4 h-4" />
                        <span>Carpeta de Organización (Forzado en Raíz)</span>
                      </div>
                    )}
                    <p className="text-[9.5px] text-gray-450 dark:text-zinc-500 mt-2.5 leading-relaxed font-semibold">
                      {currentFolder 
                        ? 'Estás dentro de una sección organizada. Solamente se adjuntan recursos legibles o descargables.'
                        : 'Estás en la base principal. Solamente se permite instaurar carpetas maestras por orden temático.'
                      }
                    </p>
                  </div>

                  {currentFolder && (
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Tamaño Estimado</label>
                      <select
                        value={newResourceSize}
                        onChange={(e) => setNewResourceSize(e.target.value)}
                        className={`w-full p-2 py-2.5 text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white rounded-xl outline-none transition-all ${cl.ring}`}
                      >
                        <option value="1.2 MB">1.2 MB (Pequeño)</option>
                        <option value="4.8 MB">4.8 MB (Medio)</option>
                        <option value="15.4 MB">15.4 MB (Grande)</option>
                      </select>
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-150 dark:border-zinc-850 flex justify-end gap-2 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setShowAddResourceModal(false)}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 text-gray-700 dark:text-zinc-350/85 rounded-xl"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className={`px-4 py-2 text-white font-bold rounded-xl ${cl.primaryBg} ${cl.primaryHoverBg} shadow-md transition-all`}
                    >
                      Crear Elemento
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
     MODULE: FINANZAS (CASH FLOW REGISTER + DEPOSITS / WITHDRAWAL - REQUISITO)
     ========================================================================= */
  const renderFinanzasValue = () => {
    return (
      <div className="space-y-6">
        
        {/* Dynamic global metrics sheet */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl text-white shadow-md relative overflow-hidden">
            <h4 className="text-xs uppercase font-bold tracking-widest text-white/70">Saldo Escolar Neto</h4>
            <h2 className="text-3xl font-extrabold mt-1 leading-none tracking-tight">${balance.toLocaleString('es-ES')} USD</h2>
            <p className="text-[10px] text-white/80 mt-2 font-medium">Actualizado hace instantes</p>
            <div className="absolute top-1/2 right-4 -translate-y-1/2 opacity-10">
              <Coins className="w-24 h-24 stroke-white stroke-1" />
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Acumulado Ingresos</p>
              <h3 className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">
                +${transactions.filter(t => t.type === 'ingreso').reduce((a, b) => a + b.amount, 0).toLocaleString('es-ES')}
              </h3>
              <p className="text-[10px] text-gray-450 mt-1 font-medium">Cuotas de Colegiatura, Subvenciones</p>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Acumulado Egresos</p>
              <h3 className="text-2xl font-bold mt-1 text-rose-600 dark:text-rose-400">
                -${transactions.filter(t => t.type === 'egreso').reduce((a, b) => a + b.amount, 0).toLocaleString('es-ES')}
              </h3>
              <p className="text-[10px] text-gray-450 mt-1 font-medium">Sueldos profesores, Gastos Operativos</p>
            </div>
            <div className="p-3 bg-rose-50 dark:bg-rose-950/30 text-rose-600 rounded-xl">
              <TrendingDown className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Operations cash flow trigger panel */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <h3 className="text-sm font-bold text-gray-800 dark:text-zinc-200">Terminal de Caja Escolar</h3>
            <p className="text-xs text-gray-500">Agrega ingresos por donación/pagos o retira dinero para pagos a docentes u operacionales.</p>
          </div>
          <div className="flex gap-3">
            <button
              id="btn-withdraw-money"
              type="button"
              onClick={() => {
                setShowFinanceModal('egreso');
                setFinanceForm({ amount: '', concept: '', category: 'Salario Docente', targetId: '' });
              }}
              className="px-5 py-2.5 text-xs font-bold bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/40 rounded-xl transition-all flex items-center gap-2"
            >
              <ArrowDownRight className="w-4 h-4" />
              Retirar / Registrar Egreso
            </button>
            <button
              id="btn-deposit-money"
              type="button"
              onClick={() => {
                setShowFinanceModal('ingreso');
                setFinanceForm({ amount: '', concept: '', category: 'Colegiatura', targetId: '' });
              }}
              className={`px-5 py-2.5 text-xs font-bold text-white ${cl.primaryBg} ${cl.primaryHoverBg} rounded-xl transition-all flex items-center gap-2 shadow-sm`}
            >
              <ArrowUpRight className="w-4 h-4" />
              Ingresar / Registrar Ingreso
            </button>
          </div>
        </div>

        {/* Transactions log sheet */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 dark:border-zinc-850">
            <h3 className="text-xs font-bold text-gray-450 uppercase tracking-widest">Historial de Transacciones Coherentes</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50/75 dark:bg-zinc-950/60 border-b border-gray-100 dark:border-zinc-850">
                  <th className="px-4 py-3.5 text-[10px] font-extrabold uppercase tracking-widest text-gray-500 dark:text-zinc-400 select-none whitespace-nowrap">ID</th>
                  <th className="px-4 py-3.5 text-[10px] font-extrabold uppercase tracking-widest text-gray-500 dark:text-zinc-400 select-none whitespace-nowrap">Fecha</th>
                  <th className="px-4 py-3.5 text-[10px] font-extrabold uppercase tracking-widest text-gray-500 dark:text-zinc-400 select-none whitespace-nowrap">Concepto</th>
                  <th className="px-4 py-3.5 text-[10px] font-extrabold uppercase tracking-widest text-gray-500 dark:text-zinc-400 select-none whitespace-nowrap">Categoría</th>
                  <th className="px-4 py-3.5 text-[10px] font-extrabold uppercase tracking-widest text-gray-500 dark:text-zinc-400 select-none whitespace-nowrap">Monto</th>
                  <th className="px-4 py-3.5 text-[10px] font-extrabold uppercase tracking-widest text-gray-500 dark:text-zinc-400 select-none whitespace-nowrap text-right">Estatus contable</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-850">
                {transactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-gray-50/20 dark:hover:bg-zinc-800/20 transition-colors">
                    <td className="p-4 font-mono text-[10px] text-gray-400">{tx.id}</td>
                    <td className="p-4 text-gray-550 dark:text-zinc-350">{tx.date}</td>
                    <td className="p-4">
                      <p className="font-bold text-gray-800 dark:text-zinc-200">{tx.concept}</p>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 dark:bg-zinc-800 text-gray-650 dark:text-zinc-300">
                        {tx.category}
                      </span>
                    </td>
                    <td className="p-4">
                      {tx.type === 'ingreso' ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center font-mono">
                          <ArrowUpRight className="w-3.5 h-3.5 mr-0.5 shrink-0" />
                          +${tx.amount.toLocaleString('es-ES')} USD
                        </span>
                      ) : (
                        <span className="text-rose-600 dark:text-rose-450 font-bold flex items-center font-mono">
                          <ArrowDownRight className="w-3.5 h-3.5 mr-0.5 shrink-0" />
                          -${tx.amount.toLocaleString('es-ES')} USD
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/25 px-2 py-0.5 rounded-full">
                        Consolidado
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CASH REGISTRATION FINANCE FORM DIALOG BOX */}
        <AnimatePresence>
          {showFinanceModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowFinanceModal(null)}
                className="fixed inset-0 bg-black/25 backdrop-blur-[5px]"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl w-full max-w-sm p-6 relative z-10 shadow-2xl"
              >
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-zinc-850 mb-5">
                  <h3 className="text-sm font-bold text-gray-800 dark:text-zinc-200">
                    {showFinanceModal === 'ingreso' ? 'Registrar Entrada de Dinero' : 'Registrar Salida / Gasto'}
                  </h3>
                  <button type="button" onClick={() => setShowFinanceModal(null)} className="p-1 hover:bg-gray-150 rounded text-gray-400">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleFinanceSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">Monto en USD ($)</label>
                    <input
                      required
                      type="number"
                      placeholder="150"
                      value={financeForm.amount}
                      onChange={(e) => setFinanceForm({ ...financeForm, amount: e.target.value })}
                      className={`w-full p-2 py-2.5 text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white rounded-xl outline-none transition-all ${cl.ring}`}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">Concepto o Descripción</label>
                    <input
                      required
                      type="text"
                      placeholder={showFinanceModal === 'ingreso' ? 'Ej. Donativo o Pago Subvención' : 'Ej. Compra de tizas o Servicios de luz'}
                      value={financeForm.concept}
                      onChange={(e) => setFinanceForm({ ...financeForm, concept: e.target.value })}
                      className={`w-full p-2 py-2.5 text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white rounded-xl outline-none transition-all ${cl.ring}`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">Categoría contable</label>
                      <select
                        value={financeForm.category}
                        onChange={(e) => setFinanceForm({ ...financeForm, category: e.target.value as any })}
                        className={`w-full p-2 py-2.5 text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white rounded-xl outline-none transition-all ${cl.ring}`}
                      >
                        {showFinanceModal === 'ingreso' ? (
                          <>
                            <option value="Colegiatura">Colegiatura</option>
                            <option value="Otros">Subvención / Donativo</option>
                          </>
                        ) : (
                          <>
                            <option value="Salario Docente">Salario Docente</option>
                            <option value="Material Educativo">Material Educativo</option>
                            <option value="Servicios">Servicios Operativos</option>
                            <option value="Otros">Otros Egresos</option>
                          </>
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">Entidad Conectada</label>
                      <select
                        value={financeForm.targetId}
                        onChange={(e) => setFinanceForm({ ...financeForm, targetId: e.target.value })}
                        className={`w-full p-2 py-2.5 text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white rounded-xl outline-none transition-all ${cl.ring}`}
                      >
                        <option value="">Ninguno / General</option>
                        {showFinanceModal === 'ingreso' 
                          ? students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.id})</option>)
                          : teachers.map(t => <option key={t.id} value={t.id}>{t.name} ({t.id})</option>)
                        }
                      </select>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-150 dark:border-zinc-850 flex justify-end gap-2 text-xs font-semibold animate-none">
                    <button
                      type="button"
                      onClick={() => setShowFinanceModal(null)}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 rounded-xl"
                    >
                      Cerrar
                    </button>
                    <button
                      type="submit"
                      className={`px-4 py-3 text-white font-bold rounded-xl ${cl.primaryBg} ${cl.primaryHoverBg}`}
                    >
                      Procesar Transacción
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
     MODULE: CONFIGURACION (INTERFACE CUSTOMIZER)
     ========================================================================= */
  const renderConfiguracionValue = () => {
    return (
      <div className="max-w-xl mx-auto bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-sm p-6 space-y-6">
        <div>
          <h3 className="text-sm font-bold text-gray-800 dark:text-zinc-150">Ajustes del Sistema</h3>
          <p className="text-xs text-gray-400">Modifica la apariencia del portal para ajustarse a tu estilo preferido.</p>
        </div>

        {/* Accent colour picker circles */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Esquema de Colores (Marca)</label>
          <div className="grid grid-cols-2 gap-3">
            {ACCENT_COLORS_METADATA.map((color) => {
              const classes = getThemeClasses(color.value);
              const isSelected = theme.accentColor === color.value;
              return (
                <button
                  id={`config-color-${color.value}`}
                  key={color.value}
                  type="button"
                  onClick={() => updateTheme({ accentColor: color.value })}
                  className={`p-3 rounded-xl border flex items-center gap-3 text-left transition-all outline-none ${
                    isSelected
                      ? 'border-gray-900 bg-gray-50 dark:border-white dark:bg-zinc-800 font-bold'
                      : 'border-gray-100 hover:border-gray-200 dark:border-zinc-800 dark:hover:border-zinc-750'
                  }`}
                >
                  <span 
                    style={{ backgroundColor: color.hex }}
                    className="w-4 h-4 rounded-full ring-2 ring-white dark:ring-zinc-900 shadow-sm"
                  />
                  <span className="text-xs text-gray-750 dark:text-zinc-200">{color.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Style selection */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Estilo y Filosofía Visual</label>
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
                  id={`config-style-${st.value}`}
                  key={st.value}
                  type="button"
                  onClick={() => updateTheme({ layoutStyle: st.value as any })}
                  className={`p-3 rounded-xl border text-left transition-all outline-none flex flex-col gap-1 items-start ${
                    isSelected
                      ? 'border-gray-900 bg-gray-50/50 dark:border-white dark:bg-zinc-800/80 font-bold'
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

        {/* Dark Light mode */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Modo de Apariencia</label>
          <div className="grid grid-cols-3 gap-2 bg-gray-50 dark:bg-zinc-950 p-1 rounded-xl">
            {(['light', 'dark', 'system'] as const).map((mode) => (
              <button
                id={`config-mode-${mode}`}
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
          <p className="text-[10px] text-gray-400 leading-normal">
            El tema del sistema por defecto respetará automáticamente la configuración de brillo de tu dispositivo corporativo.
          </p>
        </div>

        {/* Sidebar Mini-Icons option */}
        <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-zinc-800/60">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Barra Lateral (Escritorio)</label>
          <div className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-zinc-950 rounded-xl border border-gray-200/50 dark:border-zinc-800">
            <div className="space-y-1 pr-4">
              <span className="text-xs font-bold block text-gray-800 dark:text-zinc-200">Ocultar de todo al Colapsar</span>
              <p className="text-[10px] text-gray-400 dark:text-zinc-500 leading-tight">
                Si se activa, el panel colapsado se reduce a una línea fina de adorno y solo se despliega por completo al pasar el mouse.
              </p>
            </div>
            <button
              id="config-sidebar-toggle-button"
              type="button"
              onClick={() => handleToggleSidebarHideIcons(!sidebarHideIcons)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                sidebarHideIcons ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-zinc-800'
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
          <span>Licenciado para: Directiva Colegio</span>
          <span className="font-bold text-gray-400">ENLACEC Prod</span>
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
      case 'estudiantes':
        return renderEstudiantesValue();
      case 'docentes':
        return renderDocentesValue();
      case 'recursos':
        return renderRecursosValue();
      case 'finanzas':
        return renderFinanzasValue();
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
