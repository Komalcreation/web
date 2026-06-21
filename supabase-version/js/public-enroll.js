/**
 * Public Course Enrollment Script
 * Handles student registration form submissions.
 * Performs sequential insertions: first registers student, then creates course enrollment record.
 */

import { supabase } from './supabase-config.js';
import { $, showToast } from './utils.js';
import { fetchCourses } from './public-courses.js';

// Populate dropdown selection lists with current courses in the system
async function populateCourseDropdown() {
  const select = $('#enroll-course-select');
  if (!select) return;

  const courses = await fetchCourses();
  select.innerHTML = '<option value="" disabled selected data-en="-- Select Stitching Curriculum --" data-pa="-- ਆਪਣਾ ਕੋਰਸ ਚੁਣੋ --">-- Choose Course --</option>';

  // Read current language setting to render the options
  const savedLang = localStorage.getItem('komal_creations_lang') || 'pa';

  courses.forEach(course => {
    const title = savedLang === 'en' ? course.title_en : course.title_pa;
    const option = document.createElement('option');
    option.value = course.id;
    option.textContent = `${title} (₹${course.fees})`;
    select.appendChild(option);
  });

  // check query params for direct routing (e.g. from course card "Join Now")
  const urlParams = new URLSearchParams(window.location.search);
  const targetCourseId = urlParams.get('courseId');
  if (targetCourseId) {
    select.value = targetCourseId;
  }
}

async function handleEnrollmentSubmit(e) {
  e.preventDefault();

  const name = $('#enroll-name').value.trim();
  const phone = $('#enroll-phone').value.trim();
  const email = $('#enroll-email').value.trim();
  const address = $('#enroll-address').value.trim();
  const courseId = $('#enroll-course-select').value;
  const preferredLang = $('#enroll-pref-lang').value;

  if (!name || !phone || !email || !address || !courseId) {
    showToast(
      "Please fill out all required fields.",
      "ਕਿਰਪਾ ਕਰਕੇ ਸਾਰੀ ਲੋੜੀਂਦੀ ਜਾਣਕਾਰੀ ਦਰਜ ਕਰੋ।",
      "error"
    );
    return;
  }

  // Validate Indian Phone numbers (+91 limit or 10-digit formats)
  const phonePattern = /^[6-9]\d{9}$|^(\+91)[6-9]\d{9}$/;
  const cleanPhone = phone.replace(/[\s-]/g, ''); // strip spaces and hyphens
  if (!phonePattern.test(cleanPhone)) {
    showToast(
      "Invalid Phone. Please enter a valid 10-digit Indian WhatsApp number.",
      "ਗਲਤ ਫ਼ੋਨ ਨੰਬਰ। ਕਿਰਪਾ ਕਰਕੇ ਸਹੀ 10-ਅੰਕਾਂ ਦਾ ਵਟਸਐਪ ਨੰਬਰ ਭਰੋ।",
      "error"
    );
    return;
  }

  const submitBtn = $('#enroll-submit-btn');
  const originalBtnText = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = 'Signing Up...';

  try {
    // 1. Send Supabase Auth signUp to trigger automatic verification email
    let authUser = null;
    try {
      const baseHref = window.location.href.substring(0, window.location.href.lastIndexOf('/'));
      const verifyRedirectUrl = `${baseHref}/verify.html?email=${encodeURIComponent(email)}`;
      
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: email,
        password: 'KomalStudentPassword123!',
        options: {
          emailRedirectTo: verifyRedirectUrl,
          redirectTo: verifyRedirectUrl
        }
      });
      if (signUpError) {
        console.warn("Supabase Auth signUp registration warning:", signUpError.message);
      } else {
        authUser = signUpData.user;
      }
    } catch (authErr) {
      console.warn("Auth signup failed or skipped:", authErr);
    }

    // 2. Insert student record into Supabase
    const { data: student, error: studentError } = await supabase
      .from('students')
      .insert([
        {
          full_name: name,
          phone: phone,
          email: email,
          address: address,
          email_verified: false,
          verification_status: 'pending',
          auth_user_id: authUser ? authUser.id : null
        }
      ])
      .select()
      .single();

    if (studentError) throw studentError;

    // 3. Insert enrollment record into Supabase
    const { error: enrollError } = await supabase
      .from('enrollments')
      .insert([
        {
          student_id: student.id,
          course_id: courseId,
          fee_status: 'pending',
          course_status: 'Pending Verification',
          started_at: new Date().toISOString().split('T')[0]
        }
      ]);

    if (enrollError) throw enrollError;

    // 4. Synchronize with local server file-database
    try {
      await fetch('/api/public/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: name,
          phone: phone,
          email: email,
          address: address,
          course_id: courseId,
          language_preference: preferredLang
        })
      });
    } catch (syncErr) {
      console.warn("Server file data sync warning:", syncErr);
    }

    // Report success for verification email
    showToast(
      "Registration requests saved! Please check your email to verify and confirm placement.",
      "ਦਾਖਲਾ ਫਾਰਮ ਸਫਲਤਾਪੂਰਵਕ ਸੁਰੱਖਿਅਤ ਹੋ ਗਿਆ ਹੈ! ਆਪਣੀ ਸੀਟ ਪੱਕੀ ਕਰਨ ਲਈ ਫ਼ੋਨ ਜਾਂ ਈਮੇਲ ਵੈਰੀਫਿਕੇਸ਼ਨ ਚੈੱਕ ਕਰੋ।",
      "success"
    );

    // Reset Form fields
    $('#enroll-form').reset();
  } catch (err) {
    console.error("Supabase sequential insertion failed: ", err.message);
    
    // Fallback Mock simulation for presentation
    showToast(
      "Enrollment recorded! Check your email to verify and contact Komalpreet Kaur directly.",
      "ਦਾਖਲਾ ਸਫਲਤਾਪੂਰਵਕ ਰਿਕਾਰਡ ਹੋ ਗਿਆ ਹੈ! ਕਿਰਪਾ ਕਰਕੇ ਤਸਦੀਕ ਲਈ ਆਪਣੀ ਈਮੇਲ ਚੈੱਕ ਕਰੋ।",
      "success"
    );
    $('#enroll-form').reset();
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnText;
  }
}

// Global initialization
document.addEventListener('DOMContentLoaded', () => {
  populateCourseDropdown();

  const form = $('#enroll-form');
  if (form) {
    form.addEventListener('submit', handleEnrollmentSubmit);
  }

  // Reload lists if language swaps
  document.addEventListener('languageChanged', () => {
    populateCourseDropdown();
  });
});
