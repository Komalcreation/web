/**
 * Admin Login Handler Script
 * Authenticates users using Supabase Auth, then double-checks against our 'admins' table.
 */

import { supabase } from './supabase-config.js';
import { $, showToast } from './utils.js';

async function handleAdminLogin(e) {
  e.preventDefault();

  const email = $('#admin-email').value.trim();
  const password = $('#admin-password').value.trim();

  if (!email || !password) {
    showToast(
      "Please enter both administrator credentials.",
      "ਕਿਰਪਾ ਕਰਕੇ ਦੋਵੇਂ ਲੌਗਇਨ ਖਾਨੇ ਭਰੋ।",
      "error"
    );
    return;
  }

  const submitBtn = $('#admin-login-btn');
  const originalText = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = 'Verifying Auth...';

  try {
    // 1. Authenticate with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) throw error;

    // 2. Double check if this user is configured in our custom 'admins' table
    const { data: adminRole, error: roleError } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (roleError || !adminRole) {
      // Sign back out if not authorized in table
      await supabase.auth.signOut();
      throw new Error("User credentials authentic, but not registered in Admins role ledger.");
    }

    showToast(
      "Administrative validation completed! Access granted.",
      "ਐਡਮਿਨ ਵੈਰੀਫਿਕੇਸ਼ਨ ਸਫਲ! ਪੋਰਟਲ ਵਿੱਚ ਸੁਆਗਤ ਹੈ।",
      "success"
    );

    // Redirect to dashboard page
    setTimeout(() => {
      window.location.href = 'admin-dashboard.html';
    }, 1000);

  } catch (err) {
    console.warn("Live Supabase Auth fail. Checking default developer offline login fallback...");

    // OFFLINE DEVELOPER DEMO WORKFLOW
    // Facilitates evaluation before user configures live Supabase database
    if (email === 'admin@komalcreations.com' && password === 'komal1625') {
      showToast(
        "Offline developer login authenticated successfully!",
        "ਔਫਲਾਈਨ ਡਿਵੈਲਪਰ ਲੌਗਇਨ ਸਫਲਤਾਪੂਰਵਕ ਮੁਕੰਮਲ ਹੋਇਆ!",
        "success"
      );
      
      // Store dummy local session to bypass auth guard for testing
      localStorage.setItem('komal_admin_demo_session', 'true');

      setTimeout(() => {
        window.location.href = 'admin-dashboard.html';
      }, 1000);
    } else {
      showToast(
        `Login Error: ${err.message || 'Invalid Credentials'}`,
        `ਲੌਗਇਨ ਗਲਤੀ: ਲਿਖਿਆ ਈਮੇਲ ਜਾਂ ਪਾਸਵਰਡ ਗਲਤ ਹੈ।`,
        "error"
      );
    }
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
  }
}

// Global initialization
document.addEventListener('DOMContentLoaded', () => {
  const form = $('#admin-login-form');
  if (form) {
    form.addEventListener('submit', handleAdminLogin);
  }
});
