/**
 * Supabase Client Configuration & Initialization
 * Imports the Supabase JS library from CDN using native ES6 Module syntax (+esm).
 * Replace placeholder values with your actual project URL and Anon/Public Key.
 */

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// IMPORTANT: Replace these strings with your Supabase credentials
const SUPABASE_URL = 'https://your-project-id.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-role-public-api-key-goes-here';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
