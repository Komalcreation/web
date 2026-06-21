/**
 * Auth Guard module
 * Secures administrative pages. Redirects to admin-login.html if unauthorized.
 */

import { supabase } from './supabase-config.js';

async function checkPermission() {
  // 1. Check offline demo login override flag
  const isDemo = localStorage.getItem('komal_admin_demo_session');
  if (isDemo === 'true') {
    return true; // Authorized
  }

  // 2. Query live Supabase Auth session
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (session && !error) {
      return true; // Authorized
    }
  } catch (err) {
    console.error("Auth session query error: ", err);
  }

  // Unauthorized - force exit
  return false;
}

// Intercept page loading immediately
(async () => {
  const isAllowed = await checkPermission();
  if (!isAllowed) {
    window.location.replace('admin-login.html');
  }
})();
