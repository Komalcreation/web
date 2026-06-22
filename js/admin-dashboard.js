/**
 * Admin Dashboard Controller
 * Governs all statistical and CRUD operations for the administration segment.
 * Connects to live Supabase backend with high-fidelity local state fail-safes.
 */

import { supabase } from './supabase-config.js';
import { $, $$, generateCertificateNumber, generateVerificationCode, showToast } from './utils.js';

// --- LOCAL DATA STATE - FALLBACK OVERRIDES FOR DEMO WORKSHOPS ---
let localCourses = [
  { id: 'c1', title_en: 'Basic Stitching & Sewing', title_pa: 'ਲੇਡੀਜ਼ ਕੋਰਸ - ਬੇਸਿਕ ਸਿਲਾਈ', duration_en: '3 Months', duration_pa: '3 ਮਹੀਨੇ', fees: 1500, syllabus_en: 'Sewing Basics, Suits', syllabus_pa: 'ਮਸ਼ੀਨ ਨਿਯੰਤਰਣ, ਸੂਟ ਕਟਿੰਗ' },
  { id: 'c2', title_en: 'Traditional Punjabi Phulkari', title_pa: 'ਐਡਵਾਂਸਡ ਕਢਾਈ ਅਤੇ ਡਿਜ਼ਾਈਨਿੰਗ', duration_en: '6 Months', duration_pa: '6 ਮਹੀਨੇ', fees: 3000, syllabus_en: 'Phulkari, Needlework', syllabus_pa: 'ਫੁਲਕਾਰੀ, ਕਢਾਈ' }
];

let localStudents = [
  { id: 's1', full_name: 'Gurpreet Kaur', phone: '9814590408', address: 'Nabha, Patiala', email: 'gurpreet@gmail.com', email_verified: true, verification_status: 'verified' },
  { id: 's2', full_name: 'Ramanpreet Kaur', phone: '8872565408', address: 'Aloharan Khurd', email: 'raman@gmail.com', email_verified: false, verification_status: 'pending' }
];

let localEnrollments = [
  { id: 'e1', student_id: 's1', course_id: 'c1', fee_status: 'paid', course_status: 'completed', started_at: '2026-01-10' },
  { id: 'e2', student_id: 's2', course_id: 'c2', fee_status: 'half', course_status: 'active', started_at: '2026-02-15' }
];

let localCertificates = [
  { id: 'cert-1', student_id: 's1', course_id: 'c1', certificate_no: 'KC-2026-7841', verification_code: 'KC9AA10', issued_at: '2026-04-15' }
];

let localGallery = [
  { id: 'g1', image_url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500', caption_en: 'Teal Stitching Designer Gown', caption_pa: 'ਡਿਜ਼ਾਈਨਰ ਲੇਡੀਜ਼ ਗਾਊਨ' }
];

let localMessages = [
  { id: 'm1', full_name: 'Harpreet Singh', phone: '9811122233', email: 'harpreet@gmail.com', message: 'Hello, what are the batch timings for stitching?', created_at: '2026-06-20' }
];

let activeTab = 'summary';
let useLocalOfflineFallback = false;
let dbStudentCount = 0;

// --- DYNAMIC INITIALIZATION AND DELEGATORS ---
document.addEventListener('DOMContentLoaded', () => {
  setupTabListeners();
  detectStorageIntegrity();
  refreshAllData();
  setupFormSubmissions();
  
  // Logout Button trigger
  const logoutBtn = $('#btn-admin-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      // Sign out live Supabase Auth
      await supabase.auth.signOut();
      
      // Clear demo session
      localStorage.removeItem('komal_admin_demo_session');
      showToast("Signed Out", "ਸਿਸਟਮ ਵਿੱਚੋਂ ਬਾਹਰ ਹੋ ਗਏ ਹੋ", "success");
      setTimeout(() => window.location.href = 'admin-login.html', 800);
    });
  }

  // Language Change trigger reload
  document.addEventListener('languageChanged', () => {
    renderTabContent();
  });
});

/**
 * Checks if live Supabase is fully configured. Else gracefully switches to offline mockup.
 */
async function detectStorageIntegrity() {
  try {
    const { error } = await supabase.from('courses').select('count', { count: 'exact', head: true });
    if (error) {
      console.warn("Supabase database tables offline or credentials placeholders. Switching to Mock Ledger State.");
      useLocalOfflineFallback = true;
    }
  } catch (err) {
    useLocalOfflineFallback = true;
  }
}

function setupTabListeners() {
  const tabs = $$('.admin-tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      const btn = e.target.closest('.admin-tab-btn');
      if (!btn) return;

      tabs.forEach(t => t.classList.remove('active'));
      btn.classList.add('active');

      activeTab = btn.getAttribute('data-tab');
      renderTabContent();
    });
  });
}

function setupFormSubmissions() {
  // Add Course
  const courseForm = $('#admin-course-form');
  if (courseForm) {
    courseForm.addEventListener('submit', handleAddCourse);
  }

  // Add Student
  const studentForm = $('#admin-student-form');
  if (studentForm) {
    studentForm.addEventListener('submit', handleAddStudent);
  }

  // Add Gallery
  const galForm = $('#admin-gallery-form');
  if (galForm) {
    galForm.addEventListener('submit', handleAddGallery);
  }

  // Search filter lists
  const searchInput = $('#admin-student-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      renderStudentsList(e.target.value.toLowerCase());
    });
  }
}

// --- CORE DISPATCH REFRESHEES ---
async function refreshAllData() {
  if (useLocalOfflineFallback) {
    dbStudentCount = localStudents.length;
    renderTabContent();
    return;
  }

  try {
    // Attempt fetches
    const { data: c } = await supabase.from('courses').select('*');
    if (c) localCourses = c;

    const { data: s } = await supabase.from('students').select('*');
    if (s) localStudents = s;

    // Direct exact count query from database to sync metrics (Bug 2)
    try {
      const { count } = await supabase.from('students').select('*', { count: 'exact', head: true });
      if (count !== null) {
        dbStudentCount = count;
      } else {
        dbStudentCount = localStudents.length;
      }
    } catch (countErr) {
      console.warn("Direct DB count fetch failed:", countErr);
      dbStudentCount = localStudents.length;
    }

    // Required Bug 2 Debug log
    console.log('Total students from DB:', localStudents?.length, localStudents);

    const { data: e } = await supabase.from('enrollments').select('*');
    if (e) localEnrollments = e;

    const { data: certs } = await supabase.from('certificates').select('*');
    if (certs) localCertificates = certs;

    const { data: g } = await supabase.from('gallery').select('*');
    if (g) localGallery = g;

    const { data: m } = await supabase.from('messages').select('*');
    if (m) localMessages = m;

    renderTabContent();
  } catch (err) {
    console.error("Critical database fetch fail", err);
    useLocalOfflineFallback = true;
    dbStudentCount = localStudents.length;
    renderTabContent();
  }
}

// --- THE TAB ROUTER ---
function renderTabContent() {
  // Hide all sections first
  $$('.admin-section-pane').forEach(el => el.style.display = 'none');
  
  // Show active pane
  const pane = $(`#pane-${activeTab}`);
  if (pane) pane.style.display = 'block';

  // Render metrics or specific visual lists
  updateMetricCounters();

  switch (activeTab) {
    case 'summary':
      renderSummaryLists();
      break;
    case 'students':
      renderStudentsList();
      break;
    case 'enrollments':
      renderEnrollmentsList();
      populateDropdownEngines();
      break;
    case 'courses':
      renderCoursesList();
      break;
    case 'certificates':
      renderCertificateList();
      populateCompletedStudentsDropdown();
      break;
    case 'gallery':
      renderGalleryList();
      break;
    case 'messages':
      renderMessagesList();
      break;
  }
}

// --- WORKSHOP COUNTERS ---
function updateMetricCounters() {
  $('#stat-student-count').textContent = dbStudentCount;
  $('#stat-enrollment-count').textContent = localEnrollments.length;
  $('#stat-course-count').textContent = localCourses.length;
  $('#stat-certificates-count').textContent = localCertificates.length;
  $('#stat-message-count').textContent = localMessages.length;
}

// --- RENDERING HANDLERS AND TEMPLATES ---

// 1. SUMMARY TAB LISTS
function renderSummaryLists() {
  const table = $('#summary-recent-table');
  if (!table) return;
  table.innerHTML = '';

  const activeLang = localStorage.getItem('komal_creations_lang') || 'pa';

  if (localEnrollments.length === 0) {
    table.innerHTML = `<tr><td colspan="5" class="text-center">${activeLang === 'en' ? 'No recent enrollments' : 'ਕੋਈ ਦਾਖਲੇ ਨਹੀਂ ਹਨ'}</td></tr>`;
    return;
  }

  // Grab top 5 recent enrollments sorted by ID/start date descending
  const recent = [...localEnrollments].slice(-5).reverse();

  recent.forEach(en => {
    const stud = localStudents.find(s => s.id === en.student_id) || { full_name: 'Unknown Student', phone: '-' };
    const cour = localCourses.find(c => c.id === en.course_id) || { title_en: 'Unknown Course', title_pa: 'ਗੁਪਤ ਕੋਰਸ' };
    const titleVal = activeLang === 'en' ? cour.title_en : cour.title_pa;

    const tr = document.createElement('tr');
    
    // Nice badge class mapping for course status
    let courseBadgeStyle = 'text-blue-700 bg-blue-50';
    if (en.course_status === 'Pending Verification' || en.course_status === 'pending_verification') {
      courseBadgeStyle = 'text-amber-700 bg-amber-50 animate-pulse';
    } else if (en.course_status === 'completed' || en.course_status === 'Active' || en.course_status === 'active') {
      courseBadgeStyle = 'text-green-700 bg-green-50';
    } else if (en.course_status === 'dropped') {
      courseBadgeStyle = 'text-slate-700 bg-slate-50';
    }

    tr.innerHTML = `
      <td class="font-bold">${stud.full_name}</td>
      <td>${titleVal}</td>
      <td class="font-mono">${en.started_at}</td>
      <td><span class="badge ${en.fee_status === 'paid' ? 'text-green-700 bg-green-50' : 'text-amber-700 bg-amber-50'}">${en.fee_status.toUpperCase()}</span></td>
      <td><span class="badge ${courseBadgeStyle}">${en.course_status.toUpperCase()}</span></td>
    `;
    table.appendChild(tr);
  });
}

// 2. STUDENTS TAB
function renderStudentsList(filterQuery = '') {
  const container = $('#students-list-table');
  if (!container) return;
  container.innerHTML = '';

  const activeLang = localStorage.getItem('komal_creations_lang') || 'pa';

  const list = localStudents.filter(s => {
    const fName = (s.full_name || '').toLowerCase();
    const phone = s.phone || '';
    const addr = (s.address || '').toLowerCase();
    const email = (s.email || '').toLowerCase();
    return fName.includes(filterQuery) ||
           phone.includes(filterQuery) ||
           addr.includes(filterQuery) ||
           email.includes(filterQuery);
  });

  if (list.length === 0) {
    container.innerHTML = `<tr><td colspan="7" class="text-center">${activeLang === 'en' ? 'No students found.' : 'ਕੋਈ ਵਿਦਿਆਰਥੀ ਨਹੀਂ ਮਿਲਿਆ।'}</td></tr>`;
    return;
  }

  list.forEach(s => {
    const tr = document.createElement('tr');
    
    // Gracefully handle null values (Bug 2)
    const studentName = s.full_name ? s.full_name.trim() : "(Unknown Student)";
    const studentPhone = s.phone ? s.phone.trim() : "-";
    const studentEmail = s.email ? s.email.trim() : "-";
    const studentAddress = s.address ? s.address.trim() : "-";

    const isVerified = s.email_verified === true || s.verification_status === 'verified';
    const verifiedIcon = isVerified ? '<span class="text-green-700">✅</span>' : '<span class="text-slate-400">❌</span>';

    let statusBadge = '';
    if (s.verification_status === 'verified') {
      statusBadge = `<span class="badge text-green-700 bg-green-50 font-semibold" style="text-transform: capitalize;">✨ ${activeLang === 'en' ? 'Verified' : 'ਵੈਰੀਫਾਈਡ'}</span>`;
    } else if (s.verification_status === 'admin_added' || s.verification_status === 'admin-added') {
      statusBadge = `<span class="badge text-blue-700 bg-blue-50 font-semibold" style="text-transform: capitalize;">👤 ${activeLang === 'en' ? 'Admin Added' : 'ਐਡਮਿਨ ਦੁਆਰਾ ਸ਼ਾਮਲ'}</span>`;
    } else {
      statusBadge = `<span class="badge text-amber-700 bg-amber-50 font-semibold animate-pulse" style="text-transform: capitalize;">⏳ ${activeLang === 'en' ? 'Pending' : 'ਬਾਕੀ ਹੈ'}</span>`;
    }

    tr.innerHTML = `
      <td class="font-bold">${studentName}</td>
      <td class="font-mono text-sm">${studentPhone}</td>
      <td class="font-mono text-xs">${studentEmail}</td>
      <td class="text-slate-700 text-sm">${studentAddress}</td>
      <td class="text-center">${verifiedIcon}</td>
      <td>${statusBadge}</td>
      <td>
        <button class="btn btn-danger btn-xs btn-delete-student" data-id="${s.id}">
          ${activeLang === 'en' ? 'Delete' : 'ਮਿਟਾਓ'}
        </button>
      </td>
    `;
    
    // Bind Delete action
    tr.querySelector('.btn-delete-student').addEventListener('click', () => handleDeleteStudent(s.id));
    container.appendChild(tr);
  });
}

// 3. ENROLLMENTS TAB
function renderEnrollmentsList() {
  const table = $('#enrollments-list-table');
  if (!table) return;
  table.innerHTML = '';

  const activeLang = localStorage.getItem('komal_creations_lang') || 'pa';

  if (localEnrollments.length === 0) {
    table.innerHTML = `<tr><td colspan="6" class="text-center">${activeLang === 'en' ? 'No enrollments recorded' : 'ਕੋਈ ਦਾਖਲਾ ਰਿਕਾਰਡ ਨਹੀਂ ਹੈ'}</td></tr>`;
    return;
  }

  const getCourseStatusClass = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'active') return 'bg-green-50 text-green-700 font-bold border-green-200';
    if (s === 'pending verification' || s === 'pending_verification') return 'bg-amber-50 text-amber-700 font-bold border-amber-200';
    if (s === 'completed') return 'bg-blue-50 text-blue-700 font-bold border-blue-200';
    if (s === 'dropped' || s === 'cancelled') return 'bg-rose-50 text-rose-700 font-bold border-rose-200';
    return 'bg-slate-50 text-slate-600 border-slate-200';
  };

  const getFeeStatusClass = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'paid') return 'bg-green-50 text-green-700 font-bold border-green-200';
    if (s === 'half' || s === 'half paid') return 'bg-amber-50 text-amber-50 font-bold border-amber-200';
    return 'bg-slate-100 text-slate-600 border-slate-200';
  };

  localEnrollments.forEach(en => {
    const student = localStudents.find(s => s.id === en.student_id) || { full_name: 'Unknown', phone: '-' };
    const course = localCourses.find(c => c.id === en.course_id) || { title_en: 'Deleted Course', title_pa: 'ਮਿਟਾਇਆ ਗਿਆ ਕੋਰਸ' };
    const titleVal = activeLang === 'en' ? course.title_en : course.title_pa;

    const tr = document.createElement('tr');
    
    const feeClass = getFeeStatusClass(en.fee_status);
    const courseClass = getCourseStatusClass(en.course_status);

    tr.innerHTML = `
      <td class="font-bold">${student.full_name} <p class="text-xs text-slate-500 font-mono">${student.phone}</p></td>
      <td>${titleVal}</td>
      <td class="font-mono text-xs">${en.started_at}</td>
      <td>
        <select class="form-control text-xs select-fee-status ${feeClass}" data-id="${en.id}" style="padding:0.25rem 0.5rem; width:100px;">
          <option value="pending" ${en.fee_status === 'pending' ? 'selected' : ''}>PENDING</option>
          <option value="half" ${en.fee_status === 'half' ? 'selected' : ''}>HALF PAID</option>
          <option value="paid" ${en.fee_status === 'paid' ? 'selected' : ''}>PAID</option>
        </select>
      </td>
      <td>
        <select class="form-control text-xs select-course-status ${courseClass}" data-id="${en.id}" style="padding:0.25rem 0.5rem; width:110px;">
          <option value="Pending Verification" ${en.course_status === 'Pending Verification' || en.course_status === 'pending_verification' ? 'selected' : ''}>PENDING VERf.</option>
          <option value="active" ${en.course_status === 'active' || en.course_status === 'Active' ? 'selected' : ''}>ACTIVE</option>
          <option value="completed" ${en.course_status === 'completed' ? 'selected' : ''}>COMPLETED</option>
          <option value="dropped" ${en.course_status === 'dropped' ? 'selected' : ''}>DROPPED</option>
        </select>
      </td>
      <td>
        <button class="btn btn-danger btn-xs btn-delete-enroll" data-id="${en.id}">
          ${activeLang === 'en' ? 'Delete' : 'ਮਿਟਾਓ'}
        </button>
      </td>
    `;

    // Bind event listeners for status updates
    tr.querySelector('.select-fee-status').addEventListener('change', (e) => handleUpdateFeeStatus(en.id, e.target.value));
    tr.querySelector('.select-course-status').addEventListener('change', (e) => handleUpdateCourseStatus(en.id, e.target.value));
    tr.querySelector('.btn-delete-enroll').addEventListener('click', () => handleDeleteEnrollment(en.id));

    table.appendChild(tr);
  });
}

function populateDropdownEngines() {
  const studSelect = $('#enrollment-student-select');
  const courSelect = $('#enrollment-course-select');
  if (!studSelect || !courSelect) return;

  const activeLang = localStorage.getItem('komal_creations_lang') || 'pa';

  studSelect.innerHTML = `<option value="" disabled selected>${activeLang === 'en' ? 'Choose Student...' : 'ਵਿਦਿਆਰਥੀ ਚੁਣੋ...'}</option>`;
  localStudents.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.id;
    opt.textContent = `${s.full_name} (${s.phone})`;
    studSelect.appendChild(opt);
  });

  courSelect.innerHTML = `<option value="" disabled selected>${activeLang === 'en' ? 'Choose Course...' : 'ਕੋਰਸ ਚੁਣੋ...'}</option>`;
  localCourses.forEach(c => {
    const title = activeLang === 'en' ? c.title_en : c.title_pa;
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = `${title} (₹${c.fees})`;
    courSelect.appendChild(opt);
  });
  
  // Bind form submission for new manual enrollment record
  const manualEnrollForm = $('#admin-manual-enrollement-form');
  if (manualEnrollForm) {
    // Prevent duplicate handlers
    const clonedForm = manualEnrollForm.cloneNode(true);
    manualEnrollForm.parentNode.replaceChild(clonedForm, manualEnrollForm);
    
    clonedForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const sId = $('#enrollment-student-select').value;
      const cId = $('#enrollment-course-select').value;
      if (!sId || !cId) {
        showToast("Fill required items first", "ਕੋਰਸ ਚੁਣਨਾ ਜ਼ਰੂਰੀ ਹੈ।", "error");
        return;
      }
      
      const newEnroll = {
        id: useLocalOfflineFallback ? `e-${Date.now()}` : undefined,
        student_id: sId,
        course_id: cId,
        fee_status: 'pending',
        course_status: 'active',
        started_at: new Date().toISOString().split('T')[0]
      };
      
      if (!useLocalOfflineFallback) {
        try {
          const { error } = await supabase.from('enrollments').insert([newEnroll]);
          if (error) throw error;
        } catch (err) {
          showToast(err.message, "ਦਾਖਲਾ ਸੇਵ ਕਰਨ ਵਿੱਚ ਗਲਤੀ ਆਈ ਹੈ।", "error");
          return;
        }
      } else {
        localEnrollments.push(newEnroll);
      }
      
      showToast("Enrollment successful", "ਦਾਖਲਾ ਸਫਲਤਾਪੂਰਵਕ ਰਿਕਾਰਡ ਹੋਇਆ", "success");
      clonedForm.reset();
      refreshAllData();
    });
  }
}

// 4. COURSES SYLLABUS TAB
function renderCoursesList() {
  const container = $('#courses-list-table');
  if (!container) return;
  container.innerHTML = '';

  const activeLang = localStorage.getItem('komal_creations_lang') || 'pa';

  if (localCourses.length === 0) {
    container.innerHTML = `<tr><td colspan="5" class="text-center">${activeLang === 'en' ? 'No courses added.' : 'ਕੋਈ ਕੋਰਸ ਨਹੀਂ ਹੈ।'}</td></tr>`;
    return;
  }

  localCourses.forEach(c => {
    const titleVal = activeLang === 'en' ? c.title_en : c.title_pa;
    const durationVal = activeLang === 'en' ? c.duration_en : c.duration_pa;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="font-bold">${titleVal}</td>
      <td class="font-mono text-green-800">₹${c.fees}</td>
      <td>${durationVal}</td>
      <td class="text-slate-500 text-xs">${activeLang === 'en' ? c.syllabus_en : c.syllabus_pa}</td>
      <td>
        <button class="btn btn-danger btn-xs btn-delete-course" data-id="${c.id}">
          ${activeLang === 'en' ? 'Delete' : 'ਮਿਟਾਓ'}
        </button>
      </td>
    `;

    tr.querySelector('.btn-delete-course').addEventListener('click', () => handleDeleteCourse(c.id));
    container.appendChild(tr);
  });
}

// 5. CERTIFICATES TAB
function renderCertificateList() {
  const container = $('#certificates-list-table');
  if (!container) return;
  container.innerHTML = '';

  const activeLang = localStorage.getItem('komal_creations_lang') || 'pa';

  if (localCertificates.length === 0) {
    container.innerHTML = `<tr><td colspan="5" class="text-center">${activeLang === 'en' ? 'No certificates issued yet' : 'ਕੋਈ ਸਰਟੀਫਿਕੇਟ ਜਾਰੀ ਨਹੀਂ ਕੀਤਾ ਗਿਆ'}</td></tr>`;
    return;
  }

  localCertificates.forEach(cert => {
    const student = localStudents.find(s => s.id === cert.student_id) || { full_name: 'Unknown', phone: '-' };
    const course = localCourses.find(c => c.id === cert.course_id) || { title_en: 'Custom Tailoring', title_pa: 'ਸਿਲਾਈ ਕੋਰਸ' };
    const titleVal = activeLang === 'en' ? course.title_en : course.title_pa;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="font-bold">${student.full_name} <p class="text-xs text-slate-500 font-mono">${student.phone}</p></td>
      <td>${titleVal}</td>
      <td class="font-mono font-bold text-red-800">${cert.certificate_no}</td>
      <td class="font-mono text-green-800 text-xs">${cert.verification_code}</td>
      <td>
        <a href="certificate-print.html?code=${cert.verification_code}" target="_blank" class="btn btn-green btn-xs">
          🖨️ ${activeLang === 'en' ? 'Print' : 'ਪ੍ਰਿੰਟ'}
        </a>
      </td>
    `;
    container.appendChild(tr);
  });
}

function populateCompletedStudentsDropdown() {
  const select = $('#certificate-issue-student-select');
  if (!select) return;

  const activeLang = localStorage.getItem('komal_creations_lang') || 'pa';

  select.innerHTML = `<option value="" disabled selected>${activeLang === 'en' ? 'Select student to qualify...' : 'ਪਾਸ-ਆਊਟ ਵਿਦਿਆਰਥੀ ਚੁਣੋ...'}</option>`;

  // Filter students who have completed their courses in our enrollments ledger sheet
  const qualified = localEnrollments.filter(en => en.course_status === 'completed');

  if (qualified.length === 0) {
    const opt = document.createElement('option');
    opt.disabled = true;
    opt.textContent = activeLang === 'en' ? 'No completed graduates located.' : 'ਕੋਈ ਪਾਸ-ਆਊਟ ਵਿਦਿਆਰਥੀ ਨਹੀਂ ਮਿਲਿਆ।';
    select.appendChild(opt);
    return;
  }

  // Deduplicate list
  const renderedIds = new Set();

  qualified.forEach(en => {
    if (renderedIds.has(en.id)) return;
    renderedIds.add(en.id);

    const stud = localStudents.find(s => s.id === en.student_id);
    const cour = localCourses.find(c => c.id === en.course_id);
    if (!stud || !cour) return;

    const courseTitle = activeLang === 'en' ? cour.title_en : cour.title_pa;
    const option = document.createElement('option');
    option.value = `${stud.id}|${cour.id}`;
    option.textContent = `${stud.full_name} - ${courseTitle}`;
    select.appendChild(option);
  });

  // Re-bind click handlers for Issue button
  const form = $('#admin-certificate-generator-form');
  if (form) {
    const freshForm = form.cloneNode(true);
    form.parentNode.replaceChild(freshForm, form);

    freshForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const val = $('#certificate-issue-student-select').value;
      if (!val) {
        showToast("Please choose graduate profile.", "ਕਿਰਪਾ ਕਰਕੇ ਕੋਰਸ ਪਾਸਵਾਨ ਚੁਣੋ।", "error");
        return;
      }

      const [sId, cId] = val.split('|');
      
      // Prevent issuing duplicate certificate for the same student of the same course
      const isDuplicate = localCertificates.some(ct => ct.student_id === sId && ct.course_id === cId);
      if (isDuplicate) {
        showToast(
          "A certificate has already been registered for this student under this course identifier.",
          "ਇਸ ਵਿਦਿਆਰਥੀ ਦਾ ਸਰਟੀਫਿਕੇਟ ਪਹਿਲਾਂ ਹੀ ਜਾਰੀ ਕੀਤਾ ਹੋਇਆ ਹੈ।",
          "error"
        );
        return;
      }

      const verifiedCode = generateVerificationCode();
      const ledgerCode = generateCertificateNumber();

      const newCert = {
        id: useLocalOfflineFallback ? `ce-${Date.now()}` : undefined,
        student_id: sId,
        course_id: cId,
        certificate_no: ledgerCode,
        verification_code: verifiedCode,
        issued_at: new Date().toISOString().split('T')[0]
      };

      if (!useLocalOfflineFallback) {
        try {
          const { error } = await supabase.from('certificates').insert([newCert]);
          if (error) throw error;
        } catch (err) {
          showToast(err.message, "ਸਰਟੀਫਿਕੇਟ ਸੇਵ ਕਰਨ ਵਿੱਚ ਪਰੇਸ਼ਾਨੀ ਆਈ ਹੈ।", "error");
          return;
        }
      } else {
        localCertificates.push(newCert);
      }

      showToast(
        `Issued Certificate successfully! Code: ${verifiedCode}`,
        `ਸਰਟੀਫਿਕੇਟ ਤਿਆਰ ਹੋ ਚੁੱਕਾ ਹੈ! ਵੈਰੀਫਿਕੇਸ਼ਨ ਕੋਡ: ${verifiedCode}`,
        "success"
      );

      refreshAllData();
    });
  }
}

// 6. PORTFOLIO GALLERY TAB
function renderGalleryList() {
  const container = $('#gallery-list-table');
  if (!container) return;
  container.innerHTML = '';

  const activeLang = localStorage.getItem('komal_creations_lang') || 'pa';

  if (localGallery.length === 0) {
    container.innerHTML = `<tr><td colspan="4" class="text-center">${activeLang === 'en' ? 'No designs inside the portfolio yet' : 'ਗੈਲਰੀ ਖਾਲੀ ਹੈ'}</td></tr>`;
    return;
  }

  localGallery.forEach(item => {
    const caption = activeLang === 'en' ? item.caption_en : item.caption_pa;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <img src="${item.image_url}" alt="${caption}" style="width: 4.5rem; height: 3rem; object-fit: cover; border-radius: 4px;" referrerPolicy="no-referrer" />
      </td>
      <td class="font-bold">${caption}</td>
      <td class="font-mono text-xs overflow-hidden max-w-[200px] text-ellipsis whitespace-nowrap">${item.image_url}</td>
      <td>
        <button class="btn btn-danger btn-xs btn-delete-gallery" data-id="${item.id}">
          ${activeLang === 'en' ? 'Delete' : 'ਮਿਟਾਓ'}
        </button>
      </td>
    `;

    tr.querySelector('.btn-delete-gallery').addEventListener('click', () => handleDeleteGalleryItem(item.id));
    container.appendChild(tr);
  });
}

// 7. MESSAGE LOG TAB
function renderMessagesList() {
  const container = $('#messages-list-table');
  if (!container) return;
  container.innerHTML = '';

  const activeLang = localStorage.getItem('komal_creations_lang') || 'pa';

  if (localMessages.length === 0) {
    container.innerHTML = `<tr><td colspan="5" class="text-center">${activeLang === 'en' ? 'Your message box is clear!' : 'ਕੋਈ ਵਿਜ਼ੀਟਰ ਸੁਨੇਹਾ ਨਹੀਂ ਹੈ।'}</td></tr>`;
    return;
  }

  localMessages.forEach(msg => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="font-bold">${msg.full_name} <p class="text-xs text-slate-500 font-mono">${msg.email}</p></td>
      <td class="font-mono">${msg.phone}</td>
      <td class="italic text-xs">${msg.message}</td>
      <td class="font-mono text-xs">${msg.created_at || 'Recently'}</td>
      <td>
        <button class="btn btn-danger btn-xs btn-delete-msg" data-id="${msg.id}">
          ${activeLang === 'en' ? 'Delete' : 'ਮਿਟਾਓ'}
        </button>
      </td>
    `;

    tr.querySelector('.btn-delete-msg').addEventListener('click', () => handleDeleteMessage(msg.id));
    container.appendChild(tr);
  });
}


// --- CRUD MUTATOR SUBMISSIONS ---

// A. COURSE SUBMISSION
async function handleAddCourse(e) {
  e.preventDefault();

  const title_en = $('#course-title-en').value.trim();
  const title_pa = $('#course-title-pa').value.trim();
  const desc_en = $('#course-desc-en').value.trim();
  const desc_pa = $('#course-desc-pa').value.trim();
  const duration_en = $('#course-duration-en').value.trim();
  const duration_pa = $('#course-duration-pa').value.trim();
  const syllabus_en = $('#course-syllabus-en').value.trim();
  const syllabus_pa = $('#course-syllabus-pa').value.trim();
  const fees = parseFloat($('#course-fees').value);

  if (!title_en || !title_pa || !fees) {
    showToast("Please write standard title titles & costs.", "ਕਿਰਪਾ ਕਰਕੇ ਨਾਮ ਅਤੇ ਫੀਸ ਦਰਜ ਕਰੋ।", "error");
    return;
  }

  const newCourse = {
    id: useLocalOfflineFallback ? `c-${Date.now()}` : undefined,
    title_en,
    title_pa,
    desc_en,
    desc_pa,
    duration_en,
    duration_pa,
    syllabus_en,
    syllabus_pa,
    fees
  };

  if (!useLocalOfflineFallback) {
    try {
      const { error } = await supabase.from('courses').insert([newCourse]);
      if (error) throw error;
    } catch (err) {
      showToast(err.message, "ਗਲਤੀ ਕੋਰਸ ਨਹੀਂ ਬਣ ਸਕਿਆ।", "error");
      return;
    }
  } else {
    localCourses.push(newCourse);
  }

  showToast("Curriculum record established!", "ਨਵਾਂ ਕੋਰਸ ਰਜਿਸਟਰ ਕਰ ਲਿਆ ਗਿਆ ਹੈ!", "success");
  $('#admin-course-form').reset();
  refreshAllData();
}

// B. ADD STUDENT
async function handleAddStudent(e) {
  e.preventDefault();

  const full_name = $('#student-name').value.trim();
  const phone = $('#student-phone').value.trim();
  const address = $('#student-address').value.trim();
  const emailVal = $('#student-email').value.trim();

  if (!full_name || !phone || !address) {
    showToast("Name, phone, and residential address required", "ਨਾਮ, ਮੋਬਾਈਲ ਅਤੇ ਪਤਾ ਲਾਜ਼ਮੀ ਹੈ।", "error");
    return;
  }

  const email = emailVal || `${full_name.toLowerCase().replace(/\s+/g, '')}@gmail.com`;

  // Bug 6: Admin manual addition should auto-verify
  const newStudent = {
    id: useLocalOfflineFallback ? `s-${Date.now()}` : undefined,
    full_name,
    phone,
    address,
    email,
    email_verified: true,
    verification_status: 'admin_added'
  };

  if (!useLocalOfflineFallback) {
    try {
      const { error } = await supabase.from('students').insert([newStudent]);
      if (error) throw error;
    } catch (err) {
      showToast(err.message, "ਵਿਦਿਆਰਥੀ ਰਜਿਸਟਰ ਕਰਨ ਵਿੱਚ ਗਲਤੀ ਹੈ।", "error");
      return;
    }
  } else {
    localStudents.push(newStudent);
  }

  showToast("Student profile registered successfully", "ਵਿਦਿਆਰਥੀ ਰਿਕਾਰਡ ਸੁਰੱਖਿਅਤ ਹੋ ਗਿਆ ਹੈ।", "success");
  $('#admin-student-form').reset();
  refreshAllData();
}

// C. UPDATE STATUSES
async function handleUpdateFeeStatus(enrollId, status) {
  if (!useLocalOfflineFallback) {
    try {
      const { error } = await supabase
        .from('enrollments')
        .update({ fee_status: status })
        .eq('id', enrollId);
      if (error) throw error;
    } catch (err) {
      showToast(err.message, "ਸਟੇਟਸ ਬਦਲਣ ਵਿੱਚ ਗਲਤੀ ਹੈ।", "error");
      return;
    }
  } else {
    const en = localEnrollments.find(e => e.id === enrollId);
    if (en) en.fee_status = status;
  }
  showToast("Fee status saved", "ਫੀਸ ਲੇਜਰ ਅਪਡੇਟ ਹੋ ਚੁੱਕੀ ਹੈ", "success");
  refreshAllData();
}

async function handleUpdateCourseStatus(enrollId, status) {
  if (!useLocalOfflineFallback) {
    try {
      const { error } = await supabase
        .from('enrollments')
        .update({ course_status: status })
        .eq('id', enrollId);
      if (error) throw error;
    } catch (err) {
      showToast(err.message, "ਸਟੇਟਸ ਬਦਲਣ ਵਿੱਚ ਗਲਤੀ ਹੈ।", "error");
      return;
    }
  } else {
    const en = localEnrollments.find(e => e.id === enrollId);
    if (en) en.course_status = status;
  }
  showToast("Course status updated", "ਕੋਰਸ ਸਥਿਤੀ ਬਦਲ ਦਿੱਤੀ ਗਈ ਹੈ", "success");
  refreshAllData();
}

// D. ADD PORTFOLIO GALLERY PHOTO
async function handleAddGallery(e) {
  e.preventDefault();

  const image_url = $('#gallery-img-url').value.trim();
  const caption_en = $('#gallery-cap-en').value.trim();
  const caption_pa = $('#gallery-cap-pa').value.trim();

  if (!image_url || !caption_en || !caption_pa) {
    showToast("Write custom links and illustrations.", "ਕਿਰਪਾ ਕਰਕੇ ਫੋਟੋ ਲਿੰਕ ਅਤੇ ਟਾਈਟਲ ਦਰਜ ਕਰੋ।", "error");
    return;
  }

  const newItem = {
    id: useLocalOfflineFallback ? `g-${Date.now()}` : undefined,
    image_url,
    caption_en,
    caption_pa,
    created_at: new Date().toISOString()
  };

  if (!useLocalOfflineFallback) {
    try {
      const { error } = await supabase.from('gallery').insert([newItem]);
      if (error) throw error;
    } catch (err) {
      showToast(err.message, "ਗੈਲਰੀ ਸੇਵ ਕਰਨ ਵਿੱਚ ਗਲਤੀ ਹੈ।", "error");
      return;
    }
  } else {
    localGallery.push(newItem);
  }

  showToast("Design portfolio image updated!", "ਡਿਜ਼ਾਈਨ ਗੈਲਰੀ ਵਿੱਚ ਫੋਟੋ ਸ਼ਾਮਲ ਕਰ ਲਈ ਗਈ ਹੈ!", "success");
  $('#admin-gallery-form').reset();
  refreshAllData();
}

// E. DELETION HANDLERS
async function handleDeleteStudent(id) {
  const activeLang = localStorage.getItem('komal_creations_lang') || 'pa';
  const confirmationText = activeLang === 'en' 
    ? "Deleting student profile will permanently drop linked course sheets. Confirm action?" 
    : "ਵਿਦਿਆਰਥੀ ਮਿਟਾਉਣ ਨਾਲ ਉਸਦੇ ਦਾਖਲਾ ਰਿਕਾਰਡ ਵੀ ਮਿਟ ਜਾਣਗੇ। ਕੀ ਤੁਸੀਂ ਜਾਰੀ ਰੱਖਣਾ ਚਾਹੁੰਦੇ ਹੋ?";
  
  if (!confirm(confirmationText)) return;

  if (!useLocalOfflineFallback) {
    try {
      // Cascade delete is handled by Supabase foreign keys, but we secure the triggers
      const { error } = await supabase.from('students').delete().eq('id', id);
      if (error) throw error;
    } catch (err) {
      showToast(err.message, "ਮਿਟਾਉਣ ਵਿੱਚ ਨਾਕਾਮਯਾਬ।", "error");
      return;
    }
  } else {
    localStudents = localStudents.filter(s => s.id !== id);
    localEnrollments = localEnrollments.filter(e => e.student_id !== id);
    localCertificates = localCertificates.filter(c => c.student_id !== id);
  }

  showToast("Record deleted", "ਰਿਕਾਰਡ ਸਿਸਟਮ ਵਿੱਚੋਂ ਹਟਾ ਦਿੱਤਾ ਗਿਆ ਹੈ", "success");
  refreshAllData();
}

async function handleDeleteEnrollment(id) {
  const activeLang = localStorage.getItem('komal_creations_lang') || 'pa';
  if (!confirm(activeLang === 'en' ? "Delete enrollment sheet record?" : "ਕੀ ਤੁਸੀਂ ਦਾਖਲਾ ਫਾਈਲ ਰਿਕਾਰਡ ਮਿਟਾਉਣਾ ਚਾਹੁੰਦੇ ਹੋ?")) return;

  if (!useLocalOfflineFallback) {
    try {
      const { error } = await supabase.from('enrollments').delete().eq('id', id);
      if (error) throw error;
    } catch (err) {
      showToast(err.message, "ਮਿਟਾਉਣ ਵਿੱਚ ਨਾਕਾਮਯਾਬ।", "error");
      return;
    }
  } else {
    localEnrollments = localEnrollments.filter(e => e.id !== id);
  }

  showToast("Enrollment sheet removed", "ਦਾਖਲਾ ਰਿਕਾਰਡ ਮਿਟਾ ਦਿੱਤਾ ਗਿਆ ਹੈ", "success");
  refreshAllData();
}

async function handleDeleteCourse(id) {
  const activeLang = localStorage.getItem('komal_creations_lang') || 'pa';
  if (!confirm(activeLang === 'en' ? "Verify removing curriculum course selection?" : "ਕੀ ਤੁਸੀਂ ਇਸ ਕੋਰਸ ਨੂੰ ਪੱਕੇ ਤੌਰ 'ਤੇ ਹਟਾਉਣਾ ਚਾਹੁੰਦੇ ਹੋ?")) return;

  if (!useLocalOfflineFallback) {
    try {
      const { error } = await supabase.from('courses').delete().eq('id', id);
      if (error) throw error;
    } catch (err) {
      showToast(err.message, "ਮਿਟਾਉਣ ਵਿੱਚ ਨਾਕਾਮਯਾਬ।", "error");
      return;
    }
  } else {
    localCourses = localCourses.filter(c => c.id !== id);
    localEnrollments = localEnrollments.filter(e => e.course_id !== id);
  }

  showToast("Curriculum removed", "ਕੋਰਸ ਸਿਸਟਮ ਵਿੱਚੋਂ ਹਟਾ ਦਿੱਤਾ ਗਿਆ ਹੈ", "success");
  refreshAllData();
}

async function handleDeleteGalleryItem(id) {
  const activeLang = localStorage.getItem('komal_creations_lang') || 'pa';
  if (!confirm(activeLang === 'en' ? "Verify removing portfolio image?" : "ਕੀ ਤੁਸੀਂ ਇਸ ਫੋਟੋ ਨੂੰ ਗੈਲਰੀ ਵਿੱਚੋਂ ਹਟਾਉਣਾ ਚਾਹੁੰਦੇ ਹੋ?")) return;

  if (!useLocalOfflineFallback) {
    try {
      const { error } = await supabase.from('gallery').delete().eq('id', id);
      if (error) throw error;
    } catch (err) {
      showToast(err.message, "ਮਿਟਾਉਣ ਵਿੱਚ ਨਾਕਾਮਯਾਬ।", "error");
      return;
    }
  } else {
    localGallery = localGallery.filter(g => g.id !== id);
  }

  showToast("Portfolio image removed", "ਫ਼ੋਟੋ ਗੈਲਰੀ ਵਿੱਚੋਂ ਹਟਾ ਦਿੱਤੀ ਗਈ ਹੈ", "success");
  refreshAllData();
}

async function handleDeleteMessage(id) {
  const activeLang = localStorage.getItem('komal_creations_lang') || 'pa';
  if (!confirm(activeLang === 'en' ? "Delete contact inbox message?" : "ਕੀ ਤੁਸੀਂ ਇਸ ਸੁਨੇਹੇ ਨੂੰ ਪੱਕੇ ਤੌਰ 'ਤੇ ਮਿਟਾਉਣਾ ਚਾਹੁੰਦੇ ਹੋ?")) return;

  if (!useLocalOfflineFallback) {
    try {
      const { error } = await supabase.from('messages').delete().eq('id', id);
      if (error) throw error;
    } catch (err) {
      showToast(err.message, "ਮਿਟਾਉਣ ਵਿੱਚ ਨਾਕਾਮਯਾਬ।", "error");
      return;
    }
  } else {
    localMessages = localMessages.filter(m => m.id !== id);
  }

  showToast("Message deleted", "ਸੁਨੇਹਾ ਮਿਟਾ ਦਿੱਤਾ ਗਿਆ ਹੈ", "success");
  refreshAllData();
}
