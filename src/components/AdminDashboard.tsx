/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Users, BookOpen, FileSpreadsheet, Award, Image as ImageIcon, Mail, Plus, Trash2, Edit, Save, X, Search, Landmark, AlertCircle, CheckCircle2, Printer, FileText 
} from 'lucide-react';
import { translations } from '../localization';
import { Course, Student, Enrollment, Certificate, GalleryItem, ContactMessage, DashboardStats } from '../types';

interface AdminDashboardProps {
  currentLang: 'en' | 'pa';
  adminToken: string;
  setView: (view: string) => void;
  setSelectedCertificateForPrint: (cert: Certificate | null) => void;
}

export default function AdminDashboard({ 
  currentLang, 
  adminToken, 
  setView, 
  setSelectedCertificateForPrint 
}: AdminDashboardProps) {
  const t = translations[currentLang];

  // Active Tab
  const [activeTab, setActiveTab] = useState<'stats' | 'students' | 'enrollments' | 'courses' | 'certificates' | 'gallery' | 'messages'>('stats');

  // Server Data Pools
  const [stats, setStats] = useState<DashboardStats>({ totalStudents: 0, totalEnrollments: 0, totalCourses: 0, totalMessages: 0, totalCertificates: 0 });
  const [students, setStudents] = useState<Student[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);

  // Search filter
  const [studentSearch, setStudentSearch] = useState('');

  // Modals active states
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);

  // Edit states
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);

  // Form Field States
  // 1. Student fields
  const [sfName, setSfName] = useState('');
  const [sfPhone, setSfPhone] = useState('');
  const [sfEmail, setSfEmail] = useState('');
  const [sfAddress, setSfAddress] = useState('');
  const [sfLang, setSfLang] = useState<'en' | 'pa'>('pa');

  // 2. Course fields
  const [cfNameEn, setCfNameEn] = useState('');
  const [cfNamePa, setCfNamePa] = useState('');
  const [cfDescEn, setCfDescEn] = useState('');
  const [cfDescPa, setCfDescPa] = useState('');
  const [cfPrice, setCfPrice] = useState('');
  const [cfDuration, setCfDuration] = useState('');

  // 3. Gallery fields
  const [gfTitleEn, setGfTitleEn] = useState('');
  const [gfTitlePa, setGfTitlePa] = useState('');
  const [gfUrl, setGfUrl] = useState('');

  // 4. Certificate generator fields
  const [certStudentId, setCertStudentId] = useState('');
  const [certCourseId, setCertCourseId] = useState('');
  const [certStatus, setCertStatus] = useState<'Completed' | 'Excellent' | 'Grade A' | 'Grade B'>('Completed');

  // Feedback trackers
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [dbLoading, setDbLoading] = useState(false);

  useEffect(() => {
    loadAllStatsAndPayloads();
  }, [activeTab]);

  const apiHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`
  };

  const loadAllStatsAndPayloads = async () => {
    try {
      setDbLoading(true);
      // Fetch stats
      const statsRes = await fetch('/api/admin/stats', { headers: apiHeaders });
      if (statsRes.ok) setStats(await statsRes.json());

      // Tab specific fetch
      if (activeTab === 'stats') {
        // Just reload counts
      } else if (activeTab === 'students') {
        const res = await fetch('/api/admin/students', { headers: apiHeaders });
        if (res.ok) setStudents(await res.json());
      } else if (activeTab === 'enrollments') {
        const res = await fetch('/api/admin/enrollments', { headers: apiHeaders });
        if (res.ok) setEnrollments(await res.json());
        // Load courses for optional drop downs
        const cRes = await fetch('/api/admin/courses', { headers: apiHeaders });
        if (cRes.ok) setCourses(await cRes.json());
      } else if (activeTab === 'courses') {
        const res = await fetch('/api/admin/courses', { headers: apiHeaders });
        if (res.ok) setCourses(await res.json());
      } else if (activeTab === 'certificates') {
        const res = await fetch('/api/admin/certificates', { headers: apiHeaders });
        if (res.ok) setCertificates(await res.json());
        // Load candidates for modals
        const sRes = await fetch('/api/admin/students', { headers: apiHeaders });
        if (sRes.ok) setStudents(await sRes.json());
        const cRes = await fetch('/api/admin/courses', { headers: apiHeaders });
        if (cRes.ok) setCourses(await cRes.json());
      } else if (activeTab === 'gallery') {
        const res = await fetch('/api/admin/gallery', { headers: apiHeaders });
        if (res.ok) setGallery(await res.json());
      } else if (activeTab === 'messages') {
        const res = await fetch('/api/admin/messages', { headers: apiHeaders });
        if (res.ok) setMessages(await res.json());
      }
    } catch (err) {
      console.error(err);
      setFeedbackError("Failed to synchronize records with server.");
    } finally {
      setDbLoading(false);
    }
  };

  const clearFeedback = () => {
    setFeedbackSuccess(null);
    setFeedbackError(null);
  };

  // ==========================================
  // 1. STUDENTS MANAGEMENT ACTIONS
  // ==========================================
  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    clearFeedback();
    const payload = { full_name: sfName, phone: sfPhone, email: sfEmail, address: sfAddress, language_preference: sfLang };

    try {
      const url = editingStudentId ? `/api/admin/students/${editingStudentId}` : '/api/admin/students';
      const method = editingStudentId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: apiHeaders,
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setFeedbackSuccess(editingStudentId ? "Student profile altered." : "Student registered cleanly.");
        setIsStudentModalOpen(false);
        setEditingStudentId(null);
        resetStudentForm();
        loadAllStatsAndPayloads();
      } else {
        const data = await res.json();
        setFeedbackError(data.error || "Execution failed.");
      }
    } catch {
      setFeedbackError("Fail to modify student.");
    }
  };

  const triggerEditStudent = (stud: Student) => {
    setEditingStudentId(stud.id);
    setSfName(stud.full_name);
    setSfPhone(stud.phone);
    setSfEmail(stud.email);
    setSfAddress(stud.address);
    setSfLang(stud.language_preference);
    setIsStudentModalOpen(true);
  };

  const handleDeleteStudent = async (id: string) => {
    if (!window.confirm(t.confirmDelete)) return;
    clearFeedback();
    try {
      const res = await fetch(`/api/admin/students/${id}`, { method: 'DELETE', headers: apiHeaders });
      if (res.ok) {
        setFeedbackSuccess("Student record archived and removed successfully.");
        loadAllStatsAndPayloads();
      } else {
        setFeedbackError("Delete action rejected.");
      }
    } catch {
      setFeedbackError("Server communication failed.");
    }
  };

  const resetStudentForm = () => {
    setSfName('');
    setSfPhone('');
    setSfEmail('');
    setSfAddress('');
    setSfLang('pa');
  };

  // ==========================================
  // 2. COURSES MANAGEMENT ACTIONS
  // ==========================================
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    clearFeedback();
    const payload = {
      course_name_en: cfNameEn,
      course_name_pa: cfNamePa,
      description_en: cfDescEn,
      description_pa: cfDescPa,
      price: Number(cfPrice),
      duration: cfDuration
    };

    try {
      const url = editingCourseId ? `/api/admin/courses/${editingCourseId}` : '/api/admin/courses';
      const method = editingCourseId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: apiHeaders,
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setFeedbackSuccess(editingCourseId ? "Syllabus index transformed." : "Syllabus index created.");
        setIsCourseModalOpen(false);
        setEditingCourseId(null);
        resetCourseForm();
        loadAllStatsAndPayloads();
      } else {
        const data = await res.json();
        setFeedbackError(data.error || "Action declined.");
      }
    } catch {
      setFeedbackError("Fail to alter courses catalog.");
    }
  };

  const triggerEditCourse = (c: Course) => {
    setEditingCourseId(c.id);
    setCfNameEn(c.course_name_en);
    setCfNamePa(c.course_name_pa);
    setCfDescEn(c.description_en);
    setCfDescPa(c.description_pa);
    setCfPrice(c.price.toString());
    setCfDuration(c.duration);
    setIsCourseModalOpen(true);
  };

  const handleDeleteCourse = async (id: string) => {
    if (!window.confirm(t.confirmDelete)) return;
    clearFeedback();
    try {
      const res = await fetch(`/api/admin/courses/${id}`, { method: 'DELETE', headers: apiHeaders });
      if (res.ok) {
        setFeedbackSuccess("Course erased and links flushed.");
        loadAllStatsAndPayloads();
      } else {
        setFeedbackError("Server rejected operation.");
      }
    } catch {
      setFeedbackError("Failed to operate deletion.");
    }
  };

  const resetCourseForm = () => {
    setCfNameEn('');
    setCfNamePa('');
    setCfDescEn('');
    setCfDescPa('');
    setCfPrice('');
    setCfDuration('');
  };

  // ==========================================
  // 3. ENROLLMENTS MANAGEMENT ACTIONS
  // ==========================================
  const handleUpdateEnrollmentStatus = async (id: string, updatedFields: Partial<Enrollment>) => {
    clearFeedback();
    try {
      const res = await fetch(`/api/admin/enrollments/${id}`, {
        method: 'PUT',
        headers: apiHeaders,
        body: JSON.stringify(updatedFields)
      });
      if (res.ok) {
        setFeedbackSuccess("Student's billing status reorganized.");
        loadAllStatsAndPayloads();
      } else {
        setFeedbackError("Billing correction declined.");
      }
    } catch {
      setFeedbackError("Server fail.");
    }
  };

  const handleDeleteEnrollment = async (id: string) => {
    if (!window.confirm(t.confirmDelete)) return;
    clearFeedback();
    try {
      const res = await fetch(`/api/admin/enrollments/${id}`, { method: 'DELETE', headers: apiHeaders });
      if (res.ok) {
        setFeedbackSuccess("Enrollment erased cleanly.");
        loadAllStatsAndPayloads();
      } else {
        setFeedbackError("Server declined deletion.");
      }
    } catch {
      setFeedbackError("Deletion connection aborted.");
    }
  };

  // ==========================================
  // 4. CERTIFICATES GENERATOR ACTIONS
  // ==========================================
  const handleGenerateCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    clearFeedback();

    if (!certStudentId || !certCourseId) {
      setFeedbackError("Please choose correct Student and Course selections.");
      return;
    }

    try {
      const res = await fetch('/api/admin/certificates', {
        method: 'POST',
        headers: apiHeaders,
        body: JSON.stringify({
          student_id: certStudentId,
          course_id: certCourseId,
          completion_status: certStatus
        })
      });

      const data = await res.json();
      if (res.ok) {
        setFeedbackSuccess("Original certificate registered with unique code " + data.verification_code);
        setIsCertModalOpen(false);
        setCertStudentId('');
        setCertCourseId('');
        loadAllStatsAndPayloads();
      } else {
        setFeedbackError(data.error || "Generation rejected.");
      }
    } catch {
      setFeedbackError("Server connection error during certificate allocation.");
    }
  };

  const handleDeleteCertificate = async (id: string) => {
    if (!window.confirm(t.confirmDelete)) return;
    clearFeedback();
    try {
      const res = await fetch(`/api/admin/certificates/${id}`, { method: 'DELETE', headers: apiHeaders });
      if (res.ok) {
        setFeedbackSuccess("Certificate removed from public system records.");
        loadAllStatsAndPayloads();
      } else {
        const d = await res.json();
        setFeedbackError(d.error || "Command rejected.");
      }
    } catch {
      setFeedbackError("Action failed.");
    }
  };

  // ==========================================
  // 5. GALLERY PORTFOLIO ACTIONS
  // ==========================================
  const handleAddGalleryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    clearFeedback();

    if (!gfTitleEn || !gfTitlePa || !gfUrl) {
      setFeedbackError("Please fill Title EN, Title PA and Unsplash Web image link.");
      return;
    }

    try {
      const res = await fetch('/api/admin/gallery', {
        method: 'POST',
        headers: apiHeaders,
        body: JSON.stringify({
          title_en: gfTitleEn.trim(),
          title_pa: gfTitlePa.trim(),
          image_url: gfUrl.trim()
        })
      });

      if (res.ok) {
        setFeedbackSuccess("Portfolio picture incorporated.");
        setIsGalleryModalOpen(false);
        setGfTitleEn('');
        setGfTitlePa('');
        setGfUrl('');
        loadAllStatsAndPayloads();
      } else {
        const d = await res.json();
        setFeedbackError(d.error || "Add rejected.");
      }
    } catch {
      setFeedbackError("Error loading image onto repository.");
    }
  };

  const handleDeleteGalleryItem = async (id: string) => {
    if (!window.confirm(t.confirmDelete)) return;
    clearFeedback();
    try {
      const res = await fetch(`/api/admin/gallery/${id}`, { method: 'DELETE', headers: apiHeaders });
      if (res.ok) {
        setFeedbackSuccess("Selected design archived from gallery.");
        loadAllStatsAndPayloads();
      } else {
        setFeedbackError("Clear action failed.");
      }
    } catch {
      setFeedbackError("Network error.");
    }
  };

  // ==========================================
  // 6. CONTACT MAIL ACTIONS
  // ==========================================
  const handleDeleteMessage = async (id: string) => {
    if (!window.confirm(t.confirmDelete)) return;
    clearFeedback();
    try {
      const res = await fetch(`/api/admin/messages/${id}`, { method: 'DELETE', headers: apiHeaders });
      if (res.ok) {
        setFeedbackSuccess("Inquiry message purged.");
        loadAllStatsAndPayloads();
      } else {
        setFeedbackError("Erase declined.");
      }
    } catch {
      setFeedbackError("Network communication error.");
    }
  };

  // ==========================================
  // SEARCH FILTERING CODES
  // ==========================================
  const filteredStudents = students.filter(s => {
    const q = studentSearch.toLowerCase();
    return s.full_name.toLowerCase().includes(q) || 
           s.phone.includes(q) || 
           s.email.toLowerCase().includes(q) || 
           s.address.toLowerCase().includes(q);
  });

  return (
    <div className="bg-brand-off-white min-h-screen py-10 px-4 sm:px-6 lg:px-8 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Banner with controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#eae6db] pb-6">
          <div>
            <h1 className="font-serif text-2.5xl sm:text-3xl font-black text-brand-dark-green leading-tight">
              {t.dashboardTitle}
            </h1>
            <p className="text-xs text-brand-secondary-green font-mono font-medium tracking-wide mt-1">
              Active Session • Securing Operations Live 
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => {
                setView('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-4 py-2 bg-white border border-[#eae6db] hover:border-slate-400 text-slate-600 rounded text-xs font-mono font-bold transition cursor-pointer"
            >
              ← Public Home
            </button>
          </div>
        </div>

        {/* Dynamic Global feedback Alerts */}
        {feedbackSuccess && (
          <div className="p-4 bg-green-50 text-green-800 border-l-4 border-green-600 rounded flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span className="font-medium">{feedbackSuccess}</span>
            </div>
            <button onClick={() => setFeedbackSuccess(null)} className="text-slate-400 hover:text-slate-600 text-xs font-mono cursor-pointer">✕</button>
          </div>
        )}
        {feedbackError && (
          <div className="p-4 bg-red-50 text-red-800 border-l-4 border-red-600 rounded flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <span className="font-medium">{feedbackError}</span>
            </div>
            <button onClick={() => setFeedbackError(null)} className="text-slate-400 hover:text-slate-600 text-xs font-mono cursor-pointer">✕</button>
          </div>
        )}

        {/* Tab Selection Row */}
        <div className="flex flex-wrap gap-2 border-b border-[#eae6db] pb-1 select-none">
          
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2.5 rounded-t-lg text-xs font-semibold flex items-center space-x-2 ${
              activeTab === 'stats' 
                ? 'bg-brand-dark-green text-white border-b-2 border-brand-gold' 
                : 'text-slate-500 hover:bg-slate-200/50'
            }`}
          >
            <Landmark className="w-4 h-4 text-brand-gold" />
            <span>{t.tabSummary}</span>
          </button>

          <button
            onClick={() => setActiveTab('students')}
            className={`px-4 py-2.5 rounded-t-lg text-xs font-semibold flex items-center space-x-2 ${
              activeTab === 'students' 
                ? 'bg-brand-dark-green text-white border-b-2 border-brand-gold' 
                : 'text-slate-500 hover:bg-slate-200/50'
            }`}
          >
            <Users className="w-4 h-4 text-brand-gold" />
            <span>{t.tabStudents}</span>
          </button>

          <button
            onClick={() => setActiveTab('enrollments')}
            className={`px-4 py-2.5 rounded-t-lg text-xs font-semibold flex items-center space-x-2 ${
              activeTab === 'enrollments' 
                ? 'bg-brand-dark-green text-white border-b-2 border-brand-gold' 
                : 'text-slate-500 hover:bg-slate-200/50'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-brand-gold" />
            <span>{t.tabEnrollments}</span>
          </button>

          <button
            onClick={() => setActiveTab('courses')}
            className={`px-4 py-2.5 rounded-t-lg text-xs font-semibold flex items-center space-x-2 ${
              activeTab === 'courses' 
                ? 'bg-brand-dark-green text-white border-b-2 border-brand-gold' 
                : 'text-slate-500 hover:bg-slate-200/50'
            }`}
          >
            <BookOpen className="w-4 h-4 text-brand-gold" />
            <span>{t.tabCourses}</span>
          </button>

          <button
            onClick={() => setActiveTab('certificates')}
            className={`px-4 py-2.5 rounded-t-lg text-xs font-semibold flex items-center space-x-2 ${
              activeTab === 'certificates' 
                ? 'bg-brand-dark-green text-white border-b-2 border-brand-gold' 
                : 'text-slate-500 hover:bg-slate-200/50'
            }`}
          >
            <Award className="w-4 h-4 text-brand-gold" />
            <span>{t.tabCertificates}</span>
          </button>

          <button
            onClick={() => setActiveTab('gallery')}
            className={`px-4 py-2.5 rounded-t-lg text-xs font-semibold flex items-center space-x-2 ${
              activeTab === 'gallery' 
                ? 'bg-brand-dark-green text-white border-b-2 border-brand-gold' 
                : 'text-slate-500 hover:bg-slate-200/50'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-brand-gold" />
            <span>{t.tabGallery}</span>
          </button>

          <button
            onClick={() => setActiveTab('messages')}
            className={`px-4 py-2.5 rounded-t-lg text-xs font-semibold flex items-center space-x-2 ${
              activeTab === 'messages' 
                ? 'bg-brand-dark-green text-white border-b-2 border-brand-gold' 
                : 'text-slate-500 hover:bg-slate-200/50'
            }`}
          >
            <Mail className="w-4 h-4 text-brand-gold" />
            <span>{t.tabMessages}</span>
            {stats.totalMessages > 0 && (
              <span className="ml-1 bg-brand-maroon text-white font-mono text-[9px] px-1.5 py-0.5 rounded-full select-none">{stats.totalMessages}</span>
            )}
          </button>

        </div>

        {/* Tab Content Display Area */}
        <div className="bg-white rounded-2xl border border-[#eae6db] p-6 shadow-sm overflow-hidden min-h-[400px]">

          {dbLoading ? (
            <div className="text-center py-24 text-xs font-mono text-brand-secondary-green flex items-center justify-center space-x-2">
              <span className="animate-spin text-lg">⚙</span>
              <span>{t.loading}</span>
            </div>
          ) : (
            <>
              {/* STATUSES & SUMMARY TAB */}
              {activeTab === 'stats' && (
                <div className="space-y-8">
                  <h3 className="font-serif text-lg font-bold text-brand-dark-green border-b border-slate-100 pb-2">
                    {currentLang === 'en' ? "Boutique & Training Metrics Summary" : "ਸੈਂਟਰ ਦੇ ਰਿਕਾਰਡਸ ਦਾ ਸਾਰਾਂਸ਼"}
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                    
                    {/* Students card */}
                    <div className="bg-indigo-50/50 rounded-xl p-5 border border-indigo-100/50 flex items-center space-x-4">
                      <div className="p-3 bg-indigo-500 text-white rounded-lg"><Users className="w-6 h-6" /></div>
                      <div>
                        <p className="text-2xl font-black text-indigo-950 font-mono leading-none">{stats.totalStudents}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">{t.totalStudents}</p>
                      </div>
                    </div>

                    {/* Enrollments card */}
                    <div className="bg-emerald-50/50 rounded-xl p-5 border border-emerald-100/50 flex items-center space-x-4">
                      <div className="p-3 bg-emerald-600 text-white rounded-lg"><FileSpreadsheet className="w-6 h-6" /></div>
                      <div>
                        <p className="text-2xl font-black text-emerald-950 font-mono leading-none">{stats.totalEnrollments}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">{t.totalEnrollments}</p>
                      </div>
                    </div>

                    {/* Courses card */}
                    <div className="bg-amber-50/50 rounded-xl p-5 border border-amber-100/50 flex items-center space-x-4">
                      <div className="p-3 bg-amber-500 text-white rounded-lg"><BookOpen className="w-6 h-6" /></div>
                      <div>
                        <p className="text-2xl font-black text-amber-950 font-mono leading-none">{stats.totalCourses}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">{t.totalCourses}</p>
                      </div>
                    </div>

                    {/* Certificates card */}
                    <div className="bg-rose-50/50 rounded-xl p-5 border border-rose-100/50 flex items-center space-x-4">
                      <div className="p-3 bg-rose-600 text-white rounded-lg"><Award className="w-6 h-6" /></div>
                      <div>
                        <p className="text-2xl font-black text-rose-950 font-mono leading-none">{stats.totalCertificates}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">{t.totalCertificates}</p>
                      </div>
                    </div>

                    {/* Contact messages card */}
                    <div className="bg-teal-50/50 rounded-xl p-5 border border-teal-100/50 flex items-center space-x-4">
                      <div className="p-3 bg-teal-500 text-white rounded-lg"><Mail className="w-6 h-6" /></div>
                      <div>
                        <p className="text-2xl font-black text-teal-950 font-mono leading-none">{stats.totalMessages}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">{t.totalMessages}</p>
                      </div>
                    </div>

                  </div>

                  {/* Informational guide */}
                  <div className="p-5 rounded-xl bg-brand-cream border border-brand-gold/30 flex items-start space-x-3 max-w-4xl">
                    <FileText className="w-5 h-5 text-brand-maroon flex-shrink-0 mt-0.5" />
                    <div className="space-y-1.5 text-xs text-brand-dark-green leading-relaxed">
                      <p className="font-bold uppercase tracking-wider">{currentLang === 'en' ? "Administration Guild Guide" : "ਐਡਮਿਨ ਮਾਰਗਦਰਸ਼ਨ ਸੂਚੀ"}</p>
                      <p>
                        {currentLang === 'en'
                          ? "Welcome to Komal Creations Administrative Panel. Use upper tabs to handle records: modify curriculums dynamically under 'Manage Curriculums', confirm student registrations on 'Enrollment Sheets' which will allocate billing statuses, and issue verified cryptographic graduation records under 'Issue Certificates'."
                          : "ਕੋਮਲ ਕ੍ਰਿਏਸ਼ਨਜ਼ ਐਡਮਿਨ ਪੈਨਲ ਵਿੱਚ ਤੁਹਾਡਾ ਸੁਆਗਤ ਹੈ। ਰਿਕਾਰਡ ਸੋਧਣ ਲਈ ਉੱਪਰ ਦਿੱਤੇ ਟੈਬਸ ਦੀ ਵਰਤੋਂ ਕਰੋ: 'ਕੋਰਸਾਂ ਦੇ ਸਿਲੇਬਸ' ਵਿੱਚ ਕੋਰਸ ਬਦਲੋ, 'ਦਾਖਲਾ ਰਿਕਾਰਡਸ' ਵਿੱਚ ਫੀਸ ਅਤੇ ਚਾਲੂ ਰਿਕਾਰਡ ਸੁਰੱਖਿਅਤ ਕਰੋ, ਅਤੇ 'ਸਰਟੀਫਿਕੇਟ ਜਾਰੀ ਕਰੋ' ਟੈਬ ਵਿੱਚ ਖੁਦ ਨਵੇਂ ਵੈਰੀਫਾਈਡ ਕੋਡ ਬਣਾ ਕੇ ਵਿਦਿਆਰਥੀਆਂ ਨੂੰ ਪ੍ਰਿੰਟਿਡ ਸਰਟੀਫਿਕੇਟ ਦਿਓ।"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* STUDENTS DIRECTORY TAB */}
              {activeTab === 'students' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div className="relative max-w-md w-full">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        placeholder={t.studentSearchPlc}
                        className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded text-xs focus:outline-none focus:border-brand-secondary-green"
                      />
                    </div>
                    <div>
                      <button
                        onClick={() => {
                          setEditingStudentId(null);
                          resetStudentForm();
                          setIsStudentModalOpen(true);
                        }}
                        className="px-4 py-2 bg-brand-dark-green text-brand-cream hover:bg-brand-secondary-green text-xs font-semibold rounded-lg shadow flex items-center space-x-1.5 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>{t.addStudent}</span>
                      </button>
                    </div>
                  </div>

                  {/* Responsive Student list */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-600 uppercase tracking-wider border-b border-slate-200">
                          <th className="py-3.5 px-4 font-bold">{t.fullName}</th>
                          <th className="py-3.5 px-4 font-bold">{t.phone}</th>
                          <th className="py-3.5 px-4 font-bold">{t.email}</th>
                          <th className="py-3.5 px-4 font-bold">{t.address}</th>
                          <th className="py-3.5 px-4 font-bold">{currentLang === 'en' ? 'Pref' : 'ਭਾਸ਼ਾ ਪਸੰਦ'}</th>
                          <th className="py-3.5 px-4 font-bold">{t.actions}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-sans text-slate-700">
                        {filteredStudents.map((stud) => (
                          <tr key={stud.id} className="hover:bg-slate-50/50">
                            <td className="py-3 px-4 font-bold text-slate-900">{stud.full_name}</td>
                            <td className="py-3 px-4 font-mono">{stud.phone}</td>
                            <td className="py-3 px-4">{stud.email || 'N/A'}</td>
                            <td className="py-3 px-4 max-w-xxs truncate" title={stud.address}>{stud.address || 'N/A'}</td>
                            <td className="py-3 px-4 font-mono uppercase text-indigo-700 font-bold">{stud.language_preference}</td>
                            <td className="py-3 px-4">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => triggerEditStudent(stud)}
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                                  title="Edit"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteStudent(stud.id)}
                                  className="p-1.5 text-red-650 hover:bg-red-50 rounded"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {filteredStudents.length === 0 && (
                    <div className="text-center py-20 text-slate-400 font-mono text-xs">{t.noData}</div>
                  )}
                </div>
              )}

              {/* ENROLLMENTS LEDGER TAB */}
              {activeTab === 'enrollments' && (
                <div className="space-y-6">
                  
                  {/* Ledger list */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-600 uppercase tracking-wider border-b border-slate-200">
                          <th className="py-3.5 px-4 font-bold">{t.fullName}</th>
                          <th className="py-3.5 px-4 font-bold">{t.courses}</th>
                          <th className="py-3.5 px-4 font-bold">{currentLang === 'en' ? 'Started Date' : 'ਦਾਖਲਾ ਮਿਤੀ'}</th>
                          <th className="py-3.5 px-4 font-bold">{t.feeStatus}</th>
                          <th className="py-3.5 px-4 font-bold">{t.courseStatus}</th>
                          <th className="py-3.5 px-4 font-bold">{t.actions}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-sans text-slate-700">
                        {enrollments.map((e) => (
                          <tr key={e.id} className="hover:bg-slate-50/50">
                            <td className="py-3.5 px-4">
                              <p className="font-bold text-slate-900 leading-tight">{e.student_name}</p>
                              <p className="text-[10px] text-slate-400 font-mono mt-0.5">{e.student_phone}</p>
                            </td>
                            <td className="py-3.5 px-4 font-serif font-bold text-brand-dark-green">
                              {currentLang === 'en' ? e.course_name_en : e.course_name_pa}
                            </td>
                            <td className="py-3.5 px-4 font-mono">{e.enrollment_date}</td>
                            
                            {/* Fee status picker */}
                            <td className="py-3.5 px-4">
                              <select
                                value={e.fee_status}
                                onChange={(opt) => handleUpdateEnrollmentStatus(e.id, { fee_status: opt.target.value as any })}
                                className={`px-2.5 py-1.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider cursor-pointer border ${
                                  e.fee_status === 'Paid' 
                                    ? 'bg-green-50 text-green-700 border-green-200' 
                                    : e.fee_status === 'Half Paid'
                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                    : 'bg-red-50 text-red-700 border-red-200'
                                }`}
                              >
                                <option value="Paid">{t.paid}</option>
                                <option value="Half Paid">{t.halfPaid}</option>
                                <option value="Pending">{t.pending}</option>
                              </select>
                            </td>

                            {/* Active Status picker */}
                            <td className="py-3.5 px-4">
                              <select
                                value={e.status}
                                onChange={(opt2) => handleUpdateEnrollmentStatus(e.id, { status: opt2.target.value as any })}
                                className={`px-2.5 py-1.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider cursor-pointer border ${
                                  e.status === 'Active'
                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                    : e.status === 'Completed'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-stone-100 text-stone-600 border-stone-200'
                                }`}
                              >
                                <option value="Active">{t.active}</option>
                                <option value="Completed">{t.completed}</option>
                                <option value="Dropped">{t.dropped}</option>
                              </select>
                            </td>

                            <td className="py-3.5 px-4">
                              <button
                                onClick={() => handleDeleteEnrollment(e.id)}
                                className="p-1.5 text-red-650 hover:bg-red-50 rounded"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {enrollments.length === 0 && (
                    <div className="text-center py-20 text-slate-400 font-mono text-xs">{t.noData}</div>
                  )}
                </div>
              )}

              {/* COURSES REPERTORY TAB */}
              {activeTab === 'courses' && (
                <div className="space-y-6">
                  <div className="flex justify-end border-b border-slate-100 pb-4">
                    <button
                      onClick={() => {
                        setEditingCourseId(null);
                        resetCourseForm();
                        setIsCourseModalOpen(true);
                      }}
                      className="px-4 py-2 bg-brand-dark-green text-brand-cream hover:bg-brand-secondary-green text-xs font-semibold rounded-lg shadow flex items-center space-x-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{t.addCourse}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {courses.map((c) => (
                      <div key={c.id} className="bg-slate-50 rounded-xl p-5 border border-slate-100 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs bg-brand-cream border border-brand-gold text-brand-dark-green px-2.5 py-0.5 rounded-full font-bold font-mono">
                              INR Rs {c.price} / month
                            </span>
                            <span className="text-xs text-slate-400 font-mono">{c.duration}</span>
                          </div>

                          <div className="mt-3.5 space-y-2">
                            <h4 className="font-serif text-base font-bold text-slate-900 border-b border-slate-200/50 pb-1.5">
                              {c.course_name_en} <span className="font-sans text-xs text-slate-400 font-normal">| {c.course_name_pa}</span>
                            </h4>
                            <p className="text-[11px] text-slate-500 leading-relaxed font-sans">{c.description_en}</p>
                            <p className="text-[11px] text-slate-500 leading-relaxed font-sans">{c.description_pa}</p>
                          </div>
                        </div>

                        <div className="flex justify-end space-x-2 pt-4 mt-4 border-t border-slate-200/40">
                          <button
                            onClick={() => triggerEditCourse(c)}
                            className="px-2.5 py-1.5 text-[#16614d] hover:bg-green-50 text-xxs font-mono font-bold flex items-center space-x-1 rounded border border-green-200 cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>Modify</span>
                          </button>
                          <button
                            onClick={() => handleDeleteCourse(c.id)}
                            className="px-2.5 py-1.5 text-red-650 hover:bg-red-50 text-xxs font-mono font-bold flex items-center space-x-1 rounded border border-red-200 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {courses.length === 0 && (
                    <div className="text-center py-20 text-slate-400 font-mono text-xs">{t.noData}</div>
                  )}
                </div>
              )}

              {/* CERTIFICATE DIRECTORY & GENERATOR TAB */}
              {activeTab === 'certificates' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                    <h3 className="font-serif text-base font-bold text-brand-dark-green">
                      {currentLang === 'en' ? "Verified Graduates Index" : "ਸਰਟੀਫਿਕੇਟ ਦੀ ਸੂਚੀ"}
                    </h3>
                    <button
                      onClick={() => setIsCertModalOpen(true)}
                      className="px-4 py-2 bg-brand-maroon hover:bg-red-800 text-brand-cream text-xs font-semibold rounded-lg shadow-md border border-brand-gold/30 flex items-center space-x-1.5 cursor-pointer"
                    >
                      <Award className="w-4 h-4 text-brand-gold" />
                      <span>{t.issueCertificateBtn}</span>
                    </button>
                  </div>

                  {/* Table listings */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-600 uppercase tracking-wider border-b border-slate-200">
                          <th className="py-3.5 px-4 font-bold">{t.fullName}</th>
                          <th className="py-3.5 px-4 font-bold">{t.courses}</th>
                          <th className="py-3.5 px-4 font-bold">{t.certNo}</th>
                          <th className="py-3.5 px-4 font-bold">{currentLang === 'en' ? 'Verification Code' : 'ਵੈਰੀਫਿਕੇਸ਼ਨ ਕੋਡ'}</th>
                          <th className="py-3.5 px-4 font-bold">{t.issueDate}</th>
                          <th className="py-3.5 px-4 font-bold">{t.actions}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-sans text-slate-700">
                        {certificates.map((cert) => (
                          <tr key={cert.id} className="hover:bg-slate-50/50">
                            <td className="py-3 px-4 font-bold text-slate-900">{cert.student_name}</td>
                            <td className="py-3 px-4 font-serif font-bold text-brand-dark-green">
                              {currentLang === 'en' ? cert.course_name_en : cert.course_name_pa}
                            </td>
                            <td className="py-3 px-4 font-mono font-bold text-[#8b1f2f]">{cert.certificate_number}</td>
                            <td className="py-3 px-4 font-mono font-black text-indigo-700 uppercase tracking-wider bg-indigo-50/20">{cert.verification_code}</td>
                            <td className="py-3 px-4 font-mono">{cert.issue_date}</td>
                            <td className="py-3 px-4">
                              <div className="flex space-x-1">
                                <button
                                  onClick={() => {
                                    setSelectedCertificateForPrint(cert);
                                    setView('print-certificate');
                                  }}
                                  className="px-2.5 py-1.5 bg-brand-cream border border-brand-gold text-brand-dark-green hover:bg-brand-gold hover:text-brand-dark-green transition rounded text-xxs font-mono font-bold flex items-center space-x-1 cursor-pointer"
                                >
                                  <Printer className="w-3.5 h-3.5" />
                                  <span>{t.printNow}</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteCertificate(cert.id)}
                                  className="p-1.5 text-red-650 hover:bg-red-50 rounded cursor-pointer"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {certificates.length === 0 && (
                    <div className="text-center py-20 text-slate-400 font-mono text-xs">{t.noData}</div>
                  )}
                </div>
              )}

              {/* GALLERY MANAGER TAB */}
              {activeTab === 'gallery' && (
                <div className="space-y-6">
                  <div className="flex justify-end border-b border-slate-100 pb-4">
                    <button
                      onClick={() => setIsGalleryModalOpen(true)}
                      className="px-4 py-2 bg-brand-dark-green text-brand-cream hover:bg-brand-secondary-green text-xs font-semibold rounded-lg shadow flex items-center space-x-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{t.addPic}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {gallery.map((g) => (
                      <div key={g.id} className="bg-slate-50 border border-slate-200/50 rounded-xl overflow-hidden relative group flex flex-col justify-between">
                        <div className="aspect-[4/3] bg-brand-cream/35 relative">
                          <img
                            src={g.image_url}
                            alt={g.title_en}
                            className="w-full h-full object-cover select-none"
                            referrerPolicy="no-referrer"
                          />
                          <button
                            onClick={() => handleDeleteGalleryItem(g.id)}
                            className="absolute top-2 right-2 p-1.5 bg-red-850 hover:bg-red-700 text-white rounded-full shadow transition-all scale-105 cursor-pointer"
                            title="Delete Photo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="p-3 bg-white">
                          <h4 className="text-[11px] font-bold text-slate-800 truncate" title={g.title_en}>{g.title_en}</h4>
                          <p className="text-[10px] text-slate-400 font-sans truncate mt-0.5">{g.title_pa}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {gallery.length === 0 && (
                    <div className="text-center py-20 text-slate-400 font-mono text-xs">{t.noData}</div>
                  )}
                </div>
              )}

              {/* VISITOR INTEGRATION MESSAGES TAB */}
              {activeTab === 'messages' && (
                <div className="space-y-6">
                  
                  <div className="grid grid-cols-1 gap-6">
                    {messages.map((m) => (
                      <div key={m.id} className="bg-slate-50 rounded-xl p-6 border border-slate-200/60 relative flex flex-col sm:flex-row justify-between gap-4">
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                            <h4 className="text-xs font-bold text-slate-900">{m.full_name}</h4>
                            <span className="text-[10px] text-slate-400 font-mono">{new Date(m.created_at).toLocaleString()}</span>
                          </div>
                          
                          <div className="flex flex-wrap gap-x-4 text-[10px] sm:text-xs font-mono font-medium text-brand-secondary-green">
                            <span>Phone: {m.phone}</span>
                            {m.email && <span>Email: {m.email}</span>}
                          </div>

                          <div className="p-3.5 bg-white border border-slate-150 rounded text-xs text-slate-600 leading-relaxed font-sans max-w-2xl whitespace-pre-line">
                            {m.message}
                          </div>
                        </div>

                        <div className="flex sm:flex-col justify-end items-end">
                          <button
                            onClick={() => handleDeleteMessage(m.id)}
                            className="px-3 py-1.5 bg-white text-red-650 hover:bg-red-50 border border-red-200 font-mono text-[10px] font-bold tracking-wider rounded uppercase transition flex items-center space-x-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete Archive</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {messages.length === 0 && (
                    <div className="text-center py-20 text-slate-400 font-mono text-xs">{t.noData}</div>
                  )}
                </div>
              )}
            </>
          )}

        </div>

      </div>

      {/* ==========================================
          MODALS INTEGRATION CODE (HTML INSERTS)
          ========================================== */}

      {/* 1. STUDENT REGISTRATION MODAL */}
      {isStudentModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl relative">
            <div className="bg-brand-dark-green text-brand-cream p-5 flex items-center justify-between border-b border-[#16614d]">
              <h2 className="font-serif text-sm sm:text-base font-bold text-white">
                {editingStudentId ? t.editStudent : t.addStudent}
              </h2>
              <button onClick={() => setIsStudentModalOpen(false)} className="text-white hover:text-brand-gold font-bold font-mono text-xs cursor-pointer">✕</button>
            </div>
            
            <form onSubmit={handleCreateStudent} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold block text-slate-500 uppercase">{t.fullName} *</label>
                  <input type="text" required value={sfName} onChange={o => setSfName(o.target.value)} className="w-full px-3 py-2 border rounded text-xs focus:outline-none focus:border-brand-secondary-green"/>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold block text-slate-500 uppercase">{t.phone} *</label>
                  <input type="text" required value={sfPhone} onChange={o => setSfPhone(o.target.value)} className="w-full px-3 py-2 border rounded text-xs focus:outline-none focus:border-brand-secondary-green"/>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold block text-slate-500 uppercase">{t.email}</label>
                  <input type="email" value={sfEmail} onChange={o => setSfEmail(o.target.value)} className="w-full px-3 py-2 border rounded text-xs focus:outline-none focus:border-brand-secondary-green"/>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold block text-slate-500 uppercase">{currentLang === 'en' ? 'Lang Preference' : 'ਭਾਸ਼ਾ ਪਸੰਦ'} *</label>
                  <select value={sfLang} onChange={o => setSfLang(o.target.value as any)} className="w-full px-3 py-2 bg-white border rounded text-xs focus:outline-none focus:border-brand-secondary-green cursor-pointer">
                    <option value="pa">ਪੰਜਾਬੀ (PA)</option>
                    <option value="en">English (EN)</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold block text-slate-500 uppercase">{t.address}</label>
                <textarea value={sfAddress} onChange={o => setSfAddress(o.target.value)} rows={2} className="w-full px-3 py-2 border rounded text-xs focus:outline-none focus:border-brand-secondary-green"/>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setIsStudentModalOpen(false)} className="px-4 py-2 border rounded text-xs text-slate-500 hover:bg-slate-50 cursor-pointer">{t.cancel}</button>
                <button type="submit" className="px-5 py-2 bg-brand-maroon text-white rounded text-xs font-serif font-bold uppercase tracking-wider cursor-pointer border border-[#8b1f2f] hover:brightness-110">{t.savingBtn}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. COURSE DRAFT MODAL */}
      {isCourseModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl relative">
            <div className="bg-brand-dark-green text-brand-cream p-5 flex items-center justify-between border-b border-[#16614d]">
              <h2 className="font-serif text-sm sm:text-base font-bold text-white">
                {editingCourseId ? t.editCourse : t.addCourse}
              </h2>
              <button onClick={() => setIsCourseModalOpen(false)} className="text-white hover:text-brand-gold font-bold font-mono text-xs cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreateCourse} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold block text-slate-500 uppercase">{t.courseNameEn} *</label>
                  <input type="text" required value={cfNameEn} onChange={o => setCfNameEn(o.target.value)} className="w-full px-3 py-2 border rounded text-xs focus:outline-none focus:border-brand-secondary-green"/>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold block text-slate-500 uppercase">{t.courseNamePa} *</label>
                  <input type="text" required value={cfNamePa} onChange={o => setCfNamePa(o.target.value)} className="w-full px-3 py-2 border rounded text-xs focus:outline-none focus:border-brand-secondary-green"/>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold block text-slate-500 uppercase">{t.coursePrice} *</label>
                  <input type="number" required value={cfPrice} onChange={o => setCfPrice(o.target.value)} className="w-full px-3 py-2 border rounded text-xs focus:outline-none focus:border-brand-secondary-green"/>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold block text-slate-500 uppercase">{t.courseDuration} *</label>
                  <input type="text" required value={cfDuration} onChange={o => setCfDuration(o.target.value)} placeholder="e.g. 3 Months" className="w-full px-3 py-2 border rounded text-xs focus:outline-none focus:border-brand-secondary-green"/>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold block text-slate-500 uppercase">{t.descEn}</label>
                <textarea value={cfDescEn} onChange={o => setCfDescEn(o.target.value)} rows={2} className="w-full px-3 py-2 border rounded text-xs focus:outline-none focus:border-brand-secondary-green"/>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold block text-slate-500 uppercase">{t.descPa}</label>
                <textarea value={cfDescPa} onChange={o => setCfDescPa(o.target.value)} rows={2} className="w-full px-3 py-2 border rounded text-xs focus:outline-none focus:border-brand-secondary-green"/>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setIsCourseModalOpen(false)} className="px-4 py-2 border rounded text-xs text-slate-500 hover:bg-slate-50 cursor-pointer">{t.cancel}</button>
                <button type="submit" className="px-5 py-2 bg-brand-maroon text-white rounded text-xs font-serif font-bold uppercase tracking-wider cursor-pointer border border-[#8b1f2f] hover:brightness-110">{t.savingBtn}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. GALLERY ITEM MODAL */}
      {isGalleryModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl relative">
            <div className="bg-brand-dark-green text-brand-cream p-5 flex items-center justify-between border-b border-[#16614d]">
              <h2 className="font-serif text-sm sm:text-base font-bold text-white">{t.addPic}</h2>
              <button onClick={() => setIsGalleryModalOpen(false)} className="text-white hover:text-brand-gold font-bold font-mono text-xs cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleAddGalleryItem} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold block text-slate-500 uppercase">{t.imageTitleEn} *</label>
                <input type="text" required value={gfTitleEn} onChange={o => setGfTitleEn(o.target.value)} placeholder="e.g. Traditional Salwar Dupatta" className="w-full px-3 py-2 border rounded text-xs focus:outline-none focus:border-brand-secondary-green"/>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold block text-slate-500 uppercase">{t.imageTitlePa} *</label>
                <input type="text" required value={gfTitlePa} onChange={o => setGfTitlePa(o.target.value)} placeholder="ਉਦਾਹਰਨ: ਕਢਾਈ ਵਾਲਾ ਸੂਟ" className="w-full px-3 py-2 border rounded text-xs focus:outline-none focus:border-brand-secondary-green"/>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold block text-slate-500 uppercase">{t.imageUrlPlc} *</label>
                <input type="text" required value={gfUrl} onChange={o => setGfUrl(o.target.value)} placeholder="https://images.unsplash.com/..." className="w-full px-3 py-2 border rounded text-xs font-mono focus:outline-none focus:border-brand-secondary-green"/>
                <p className="text-[9px] text-[#16614d] font-semibold font-sans mt-1">Hint: We support any photogenic Unsplash image URL starting with https://images.unsplash.com/</p>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setIsGalleryModalOpen(false)} className="px-4 py-2 border rounded text-xs text-slate-500 hover:bg-slate-50 cursor-pointer">{t.cancel}</button>
                <button type="submit" className="px-5 py-2 bg-brand-maroon text-white rounded text-xs font-serif font-bold uppercase tracking-wider cursor-pointer border border-[#8b1f2f] hover:brightness-110">{t.savingBtn}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. ISSUE CERTIFICATE GRADUATE MODAL */}
      {isCertModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl relative">
            <div className="bg-brand-dark-green text-brand-cream p-5 flex items-center justify-between border-b border-[#16614d]">
              <h2 className="font-serif text-sm sm:text-base font-bold text-white">{t.issueCertificateBtn}</h2>
              <button onClick={() => setIsCertModalOpen(false)} className="text-white hover:text-brand-gold font-bold font-mono text-xs cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleGenerateCertificate} className="p-6 space-y-4">
              
              {/* Select student */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold block text-slate-500 uppercase">Select Graduate Student *</label>
                <select required value={certStudentId} onChange={o => setCertStudentId(o.target.value)} className="w-full px-3 py-2 bg-white border rounded text-xs focus:outline-none focus:border-brand-secondary-green cursor-pointer">
                  <option value="">-- Choose student directory --</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.full_name} ({s.phone})</option>
                  ))}
                </select>
              </div>

              {/* Select course */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold block text-slate-500 uppercase">Select curriculum Course *</label>
                <select required value={certCourseId} onChange={o => setCertCourseId(o.target.value)} className="w-full px-3 py-2 bg-white border rounded text-xs focus:outline-none focus:border-brand-secondary-green cursor-pointer">
                  <option value="">-- Choose curriculum --</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{currentLang === 'en' ? c.course_name_en : c.course_name_pa}</option>
                  ))}
                </select>
              </div>

              {/* Completion status */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold block text-slate-500 uppercase">Completion Grade / Merit Status</label>
                <select value={certStatus} onChange={o => setCertStatus(o.target.value as any)} className="w-full px-3 py-2 bg-white border rounded text-xs focus:outline-none focus:border-brand-secondary-green cursor-pointer">
                  <option value="Completed">Completed Standard</option>
                  <option value="Excellent">Graduated with Excellence</option>
                  <option value="Grade A">Grade A Honors</option>
                  <option value="Grade B">Grade B Standard</option>
                </select>
              </div>

              <div className="p-3 bg-red-50/50 rounded border border-brand-maroon/10 text-[10px] text-brand-maroon leading-relaxed">
                Notice: Issuing a certificate compiles the database, allocates a unique credential serial number (e.g. KC-2026-X), and creates an administrative cryptographic validation code. This is searchable on the verification terminal.
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setIsCertModalOpen(false)} className="px-4 py-2 border rounded text-xs text-slate-500 hover:bg-slate-50 cursor-pointer">{t.cancel}</button>
                <button type="submit" className="px-5 py-2 bg-[#8b1f2f] text-white rounded text-xs font-serif font-bold uppercase tracking-wider cursor-pointer border border-[#8b1f2f] hover:brightness-110">Generate Live</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
