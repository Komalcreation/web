/**
 * Certificate Landscape Printing Script
 * Dynamically populates the certificate layout card before trigger print.
 */

import { supabase } from './supabase-config.js';
import { $ } from './utils.js';

// Fallback graduate details
const fallbackGrad = {
  verification_code: 'KC9AA10',
  student_name: 'Gurpreet Kaur',
  course_en: 'Basic Stitching & Sewing Masters',
  course_pa: 'ਲੇਡੀਜ਼ ਕੋਰਸ - ਬੇਸਿਕ ਸਿਲਾਈ',
  certificate_no: 'KC-2026-7841',
  issued_at: '2026-04-15'
};

async function loadCertificateData() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  
  if (!code) {
    alert("Error: Verification code missing in query string.");
    return;
  }

  try {
    // 1. Fetch certificate row
    const { data: cert, error } = await supabase
      .from('certificates')
      .select('*')
      .eq('verification_code', code.toUpperCase())
      .maybeSingle();

    if (error) throw error;

    if (cert) {
      // 2. Fetch linked student & course
      const { data: student } = await supabase.from('students').select('*').eq('id', cert.student_id).single();
      const { data: course } = await supabase.from('courses').select('*').eq('id', cert.course_id).single();

      populateCard(student.full_name, course.title_en, course.title_pa, cert.certificate_no, cert.issued_at, code.toUpperCase());
    } else {
      // Offline fallback match
      if (code.toUpperCase() === fallbackGrad.verification_code) {
        populateCard(fallbackGrad.student_name, fallbackGrad.course_en, fallbackGrad.course_pa, fallbackGrad.certificate_no, fallbackGrad.issued_at, fallbackGrad.verification_code);
      } else {
        alert("Verification discrepancy: No certificate located matching code " + code.toUpperCase());
      }
    }
  } catch (err) {
    console.warn("Bypassing server query. Fetching local mock certificate copy...", err.message);
    if (code.toUpperCase() === fallbackGrad.verification_code) {
      populateCard(fallbackGrad.student_name, fallbackGrad.course_en, fallbackGrad.course_pa, fallbackGrad.certificate_no, fallbackGrad.issued_at, fallbackGrad.verification_code);
    } else {
      populateCard("Demo Graduate Name", "Advanced Stitching & Tailoring", "ਲੇਡੀਜ਼ ਕੋਰਸ - ਬੇਸਿਕ ਸਿਲਾਈ", "KC-2026-DEMO", "2026-06-21", code.toUpperCase());
    }
  }
}

function populateCard(studentName, courseEn, coursePa, certNo, issueDate, code) {
  // Update HTML elements
  $('#cert-display-name').textContent = studentName;
  
  // Set dual English/Punjabi titles on printout
  $('#cert-display-course-en').textContent = courseEn;
  $('#cert-display-course-pa').textContent = `(${coursePa})`;
  
  $('#cert-display-ledger').textContent = certNo;
  $('#cert-display-date').textContent = issueDate;
  $('#cert-display-code').textContent = code;
}

// Global initialization
document.addEventListener('DOMContentLoaded', () => {
  loadCertificateData();

  const printBtn = $('#btn-trigger-print');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }
});
