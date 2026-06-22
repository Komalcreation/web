/**
 * Public Course Enrollment Script
 * Handles student registration form submissions.
 * Performs sequential insertions: first registers student, then creates course enrollment record.
 * Refactored to prioritize database saving before auth signup.
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

  // Bilingual inline messages helper
  const isEn = (localStorage.getItem('komal_creations_lang') || 'pa') === 'en';

  // Improvement 3: Dynamic Form Validation
  if (!name || name.length < 2) {
    showToast(
      "Full name must be at least 2 characters.",
      "ਪੂਰਾ ਨਾਮ ਘੱਟੋ-ਘੱਟ 2 ਅੱਖਰਾਂ ਦਾ ਹੋਣਾ ਚਾਹੀਦਾ ਹੈ।",
      "error"
    );
    return;
  }

  const phonePattern = /^[6-9]\d{9}$|^(\+91)[6-9]\d{9}$/;
  const cleanPhone = phone.replace(/[\s-]/g, ''); // strip spaces and hyphens
  if (!cleanPhone || !phonePattern.test(cleanPhone)) {
    showToast(
      "Invalid Phone. Please enter a valid 10-digit Indian WhatsApp number.",
      "ਗਲਤ ਫ਼ੋਨ ਨੰਬਰ। ਕਿਰਪਾ ਕਰਕੇ ਸਹੀ 10-ਅੰਕਾਂ ਦਾ ਵਟਸਐਪ ਨੰਬਰ ਭਰੋ।",
      "error"
    );
    return;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailPattern.test(email)) {
    showToast(
      "Please enter a valid email address.",
      "ਕਿਰਪਾ ਕਰਕੇ ਸਹੀ ਈਮੇਲ ਪਤਾ ਦਰਜ ਕਰੋ।",
      "error"
    );
    return;
  }

  if (!address || address.length < 5) {
    showToast(
      "Please enter a valid residential address.",
      "ਕਿਰਪਾ ਕਰਕੇ ਆਪਣਾ ਪੂਰਾ ਰਹਿਣ ਦਾ ਪਤਾ ਦਰਜ ਕਰੋ।",
      "error"
    );
    return;
  }

  if (!courseId) {
    showToast(
      "Please select a stitching curriculum from the list.",
      "ਕਿਰਪਾ ਕਰਕੇ ਸੂਚੀ ਵਿੱਚੋਂ ਕੋਰਸ ਦੀ ਚੋਣ ਕਰੋ।",
      "error"
    );
    return;
  }

  // Improvement 2: Prevent double submission
  const submitBtn = $('#enroll-submit-btn');
  const originalBtnText = submitBtn.innerHTML;
  submitBtn.disabled = true;
  
  // Improvement 1: Show spinning / loading status
  submitBtn.innerHTML = isEn 
    ? '<span class="inline-block animate-spin mr-2">⏳</span> Processing your registration...' 
    : '<span class="inline-block animate-spin mr-2">⏳</span> ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਕੀਤੀ ਜਾ ਰਹੀ ਹੈ...';

  // Store metadata to localStorage for robust device backup
  try {
    localStorage.setItem('komal_pending_enrollment', JSON.stringify({
      name,
      phone,
      email,
      address,
      courseId,
      preferredLang
    }));
  } catch (storeErr) {
    console.warn("Could not save pending enrollment metadata to localStorage:", storeErr);
  }

  try {
    // STEP 1: Check for duplicate email in students table to prevent duplicates
    const { data: existingStudent, error: findError } = await supabase
      .from('students')
      .select('*')
      .eq('email', email.toLowerCase().trim());

    if (existingStudent && existingStudent.length > 0) {
      showToast(
        "This email is already registered. Please use a different email or contact admin.",
        "ਇਹ ਈਮੇਲ ਪਹਿਲਾਂ ਹੀ ਰਜਿਸਟਰਡ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਦੂਜੀ ਈਮੇਲ ਵਰਤੋ ਜਾਂ ਸੰਪਰਕ ਕਰੋ।",
        "error"
      );
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
      return;
    }

    // STEP 2: Save student to database first (offline-first resilient logic)
    const studentPayload = {
      full_name: name,
      phone: phone,
      email: email.toLowerCase().trim(),
      address: address,
      email_verified: false,
      verification_status: 'pending'
    };

    const { data: studentData, error: studentErrorContent } = await supabase
      .from('students')
      .insert([studentPayload])
      .select();

    if (studentErrorContent || !studentData || studentData.length === 0) {
      const errMessage = studentErrorContent ? studentErrorContent.message : "No database rows returned";
      console.error('Student insert database error:', studentErrorContent);
      showToast(
        `Database registration failed: ${errMessage}`,
        `ਡਾਟਾਬੇਸ ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਅਸਫਲ ਰਹੀ: ${errMessage}`,
        "error"
      );
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
      return;
    }

    const studentRecord = studentData[0];
    console.log('Resilient student insertion saved successfully:', studentRecord);

    // STEP 3: Insert enrollment record (with dual support for schemas: course_status & status)
    const currentDate = new Date().toISOString().split('T')[0];
    const enrollmentPayload = {
      student_id: studentRecord.id,
      course_id: courseId,
      enrollment_date: currentDate,
      started_at: currentDate,
      fee_status: 'pending',
      status: 'pending_verification',
      course_status: 'pending_verification'
    };

    const { error: enrollError } = await supabase
      .from('enrollments')
      .insert([enrollmentPayload]);

    if (enrollError) {
      console.error('Enrollment insert database error:', enrollError);
      showToast(
        `Enrollment record writing failed: ${enrollError.message}`,
        `ਦਾਖਲਾ ਰਿਕਾਰਡ ਲਿਖਣ ਵਿੱਚ ਅਸਫਲਤਾ: ${enrollError.message}`,
        "error"
      );
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
      return;
    }

    console.log('Enrollment record saved successfully in DB');

    // STEP 4: Create Supabase Auth user for email verification last
    let authUser = null;
    const randomPassword = Math.random().toString(36).slice(-12) + 'Aa1!';
    
    // Dynamic redirect URL that works on localhost, AI Studio preview, and production GitHub Pages
    const origin = window.location.origin;
    const path = window.location.pathname;
    const baseHref = origin + path.substring(0, path.lastIndexOf('/'));
    const verifyRedirectUrl = baseHref.includes('localhost') || baseHref.includes('run.app')
      ? `${baseHref}/confirm.html?email=${encodeURIComponent(email)}`
      : 'https://komalcreation.github.io/web/confirm.html';

    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password: randomPassword,
        options: {
          emailRedirectTo: verifyRedirectUrl,
          redirectTo: verifyRedirectUrl,
          data: {
            full_name: name,
            student_id: studentRecord.id,
            phone: phone,
            address: address,
            course_id: courseId,
            preferred_lang: preferredLang
          }
        }
      });

      if (signUpError) {
        console.warn("Supabase Auth email sign up skipped or triggered warning:", signUpError.message);
      } else {
        authUser = signUpData.user;
        console.log("Supabase Auth signup completed:", authUser);
      }
    } catch (authErr) {
      console.warn("Resilient auth sign up error caught:", authErr);
    }

    // STEP 5: Update student with auth_user_id if signup returns it
    if (authUser && authUser.id) {
      try {
        await supabase
          .from('students')
          .update({ auth_user_id: authUser.id })
          .eq('id', studentRecord.id);
        console.log('Student record updated with auth_user_id:', authUser.id);
      } catch (updateErr) {
        console.warn("Could not bind auth_user_id immediately, will complete during verification url redirection.", updateErr);
      }
    }

    // STEP 6: Synchronize with Local file system backup DB
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
      console.warn("Server backend json database syncing note:", syncErr);
    }

    // STEP 7: Show beautiful enrollment success states dynamically (Improvement 4)
    const originalForm = document.getElementById('enroll-form');
    if (originalForm) {
      // Create beautifully styled registration state panel
      const successPanel = document.createElement('div');
      successPanel.className = 'verify-box'; // shares styles with verification panel
      successPanel.style.padding = '3rem';
      successPanel.style.background = '#ffffff';
      successPanel.style.borderRadius = '12px';
      successPanel.style.boxShadow = '0 10px 30px rgba(14, 75, 58, 0.08)';
      successPanel.style.textAlign = 'center';
      successPanel.style.border = '2px solid #0e4b3a';
      successPanel.style.marginTop = '2rem';
      successPanel.style.animation = 'fadeIn 0.6s ease-out';

      successPanel.innerHTML = `
        <div style="font-size: 5rem; color: #0e4b3a; margin-bottom: 1.5rem;" class="animate-bounce">✔️</div>
        
        <h3 class="font-serif text-3xl mb-4" style="color: #0e4b3a;" 
            data-en="Registration Completed Successfully!" 
            data-pa="ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਸਫਲਤਾਪੂਰਵਕ ਮੁਕੰਮਲ ਹੋ ਗਈ ਹੈ!">
            ${isEn ? 'Registration Completed Successfully!' : 'ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਸਫਲਤਾਪੂਰਵਕ ਮੁਕੰਮਲ ਹੋ ਗਈ ਹੈ!'}
        </h3>
        
        <p class="font-sans text-lg font-medium text-slate-800 mb-6" style="text-transform: capitalize;">
          🎓 ${name}
        </p>

        <hr style="border-color: #fff4df; margin: 1.5rem 0;" />

        <div style="text-align: left; background: #fff4df; padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem;">
          <p class="text-sm font-semibold mb-2" style="color: #0e4b3a;" 
             data-en="Next Steps to Confirm Your Practical Desk Sheet:" 
             data-pa="ਦਾਖਲਾ ਪੱਕਾ ਕਰਨ ਲਈ ਅਗਲੇ ਕਦਮ:">
             ${isEn ? 'Next Steps to Confirm Your Practical Desk Sheet:' : 'ਦਾਖਲਾ ਪੱਕਾ ਕਰਨ ਲਈ ਅਗਲੇ ਕਦਮ:'}
          </p>
          <ul class="text-xs text-slate-700 style-decimal" style="list-style-type: decimal; padding-left: 1.25rem; line-height: 1.6;">
            <li data-en="We have sent an authentication verification email to: <strong>${email}</strong>" 
                data-pa="ਅਸੀਂ <strong>${email}</strong> 'ਤੇ ਇੱਕ ਵੈਰੀਫਿਕੇਸ਼ਨ ਈਮੇਲ ਭੇਜੀ ਹੈ।">
                ${isEn ? "We have sent an authentication verification email to <strong>" + email + "</strong>" : "ਅਸੀਂ <strong>" + email + "</strong> 'ਤੇ ਇੱਕ ਵੈਰੀਫਿਕੇਸ਼ਨ ਈਮੇਲ ਭੇਜੀ ਹੈ।"}
            </li>
            <li data-en="Please open your inbox (and check the spam folder if not found within 1 minute)." 
                data-pa="ਕਿਰਪਾ ਕਰਕੇ ਆਪਣਾ ਇਨਬਾਕਸ ਖੋਲ੍ਹੋ (ਜੇਕਰ ਇਨਬਾਕਸ ਵਿੱਚ ਨਾ ਮਿਲੇ, ਤਾਂ ਸਪੈਮ ਫੋਲਡਰ ਚੈੱਕ ਕਰੋ)।">
                ${isEn ? "Please open your inbox (and check the spam folder if not found within 1 minute)." : "ਕਿਰਪਾ ਕਰਕੇ ਆਪਣਾ ਇਨਬਾਕਸ ਖੋਲ੍ਹੋ (ਜੇਕਰ ਇਨਬਾਕਸ ਵਿੱਚ ਨਾ ਮਿਲੇ, ਤਾਂ ਸਪੈਮ ਫੋਲਡਰ ਚੈੱਕ ਕਰੋ)।"}
            </li>
            <li data-en="Click the validation verification link inside the email to instantly secure your seat!" 
                data-pa="ਆਪਣੀ ਸੀਟ ਤੁਰੰਤ ਸੁਰੱਖਿਅਤ ਕਰਨ ਲਈ ਈਮੇਲ ਵਿੱਚ ਦਿੱਤੇ ਵੈਰੀਫਿਕੇਸ਼ਨ ਲਿੰਕ 'ਤੇ ਕਲਿੱਕ ਕਰੋ!">
                ${isEn ? "Click the verification link inside the email to instantly secure and activate your seat!" : "ਆਪਣੀ ਸੀਟ ਤੁਰੰਤ ਸੁਰੱਖਿਅਤ ਕਰਨ ਲਈ ਈਮੇਲ ਵਿੱਚ ਦਿੱਤੇ ਵੈਰੀਫਿਕੇਸ਼ਨ ਲਿੰਕ 'ਤੇ ਕਲਿੱਕ ਕਰੋ!"}
            </li>
          </ul>
        </div>

        <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
          <a href="index.html" class="btn btn-primary" style="background: #0e4b3a; color: #fff4df; border: none; padding: 0.75rem 1.5rem; text-decoration: none; border-radius: 6px;" 
             data-en="Go to Home Page" data-pa="ਮੁੱਖ ਪੰਨਾ">
             ${isEn ? 'Go to Home Page' : 'ਮੁੱਖ ਪੰਨਾ'}
          </a>
          <button id="reset-form-back" class="btn" style="background: transparent; color: #8b1f2f; border: 1px solid #8b1f2f; padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer;"
             data-en="Submit Another" data-pa="ਇੱਕ ਹੋਰ ਦਾਖਲ ਕਰੋ">
             ${isEn ? 'Submit Another' : 'ਇੱਕ ਹੋਰ ਦਾਖਲ ਕਰੋ'}
          </button>
        </div>
      `;

      // Hide form and show success panel
      originalForm.style.display = 'none';
      originalForm.parentNode.appendChild(successPanel);

      const resetBtn = document.getElementById('reset-form-back');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          successPanel.remove();
          originalForm.reset();
          originalForm.style.display = 'block';
        });
      }
    }

    showToast(
      "Registration saved! Please check your email inbox to verify enrollment.",
      "ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਸਫਲ! ਆਪਣੀ ਸੀਟ ਪੱਕੀ ਕਰਨ ਲਈ ਆਪਣੀ ਈਮੇਲ ਵੈਰੀਫਾਈ ਕਰੋ।",
      "success"
    );

  } catch (err) {
    console.error("Enrollment flow exception details:", err);
    showToast(
      "An unexpected error occurred. Please try again or contact support.",
      "ਕੋਈ ਅਣਪਛਾਤੀ ਗਲਤੀ ਆਈ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ ਜਾਂ ਸਿੱਧਾ ਸੰਪਰਕ ਕਰੋ।",
      "error"
    );
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnText;
  }
}

// Global initialization
document.addEventListener('DOMContentLoaded', () => {
  populateCourseDropdown();

  const form = document.getElementById('enroll-form');
  if (form) {
    form.addEventListener('submit', handleEnrollmentSubmit);
  }

  // Reload lists if language swaps
  document.addEventListener('languageChanged', () => {
    populateCourseDropdown();
  });
});
