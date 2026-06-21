/**
 * Supabase Client Configuration & Initialization
 * Imports the Supabase JS library from CDN using native ES6 Module syntax (+esm).
 * Replace placeholder values with your actual project URL and Anon/Public Key.
 */

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// IMPORTANT: Replace these strings with your Supabase credentials
const SUPABASE_URL = 'kmxnjnynjqtzjbtiuhdx';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtteG5qbnluanF0empidGl1aGR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwMDk1MzEsImV4cCI6MjA5NzU4NTUzMX0.9UEUP0RIydInJeDLqlIMZYGfSuJlW_8pdZ9tUIzKcMg';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
