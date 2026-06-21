/**
 * Public Courses Directory Script
 * Queries the Supabase 'courses' table to fetch curriculum options.
 * Incorporates a beautiful static fallback if Supabase is not yet configured.
 */

import { supabase } from './supabase-config.js';
import { getCurrentLang } from './language.js';

// High-fidelity fallback courses if Supabase is unconfigured or offline
const fallbackCourses = [
  {
    id: 'base-stitching-1',
    title_en: 'Basic Stitching & Sewing Masters',
    title_pa: 'ਲੇਡੀਜ਼ ਕੋਰਸ - ਬੇਸਿਕ ਸਿਲਾਈ',
    desc_en: 'Master standard stitching layouts, suit neck designs, baby and kids garments, standard borders, and basic styling cuts.',
    desc_pa: 'ਸਧਾਰਨ ਸੂਟ ਕਟਿੰਗ, ਗਲੇ ਦੇ ਡਿਜ਼ਾਈਨ, ਛੋਟੇ ਬੱਚਿਆਂ ਦੇ ਕੱਪੜੇ, ਬੇਸਿਕ ਸਿਲਾਈ ਅਤੇ ਪਾਈਪਿੰਗ ਲਗਾਉਣਾ ਸਿੱਖੋ।',
    duration_en: '3 Months Training',
    duration_pa: '3 ਮਹੀਨੇ ਦੀ ਟ੍ਰੇਨਿੰਗ',
    fees: 1500,
    syllabus_en: 'Sewing Basics, Standard Salwar Suits, Baby Clothes, Measurement Techniques',
    syllabus_pa: 'ਮਸ਼ੀਨ ਨਿਯੰਤਰਣ, ਸਾਦਾ ਸਲਵਾਰ ਸੂਟ, ਬੇਸਿਕ ਫਿਟਿੰਗ, ਮਾਪ ਲੈਣ ਦਾ ਸਹੀ ਤਰੀਕਾ'
  },
  {
    id: 'base-embroidery-2',
    title_en: 'Premium Needlework & Embroidery',
    title_pa: 'ਐਡਵਾਂਸਡ ਕਢਾਈ ਅਤੇ ਡਿਜ਼ਾਈਨਿੰਗ',
    desc_en: 'Learn traditional Punjabi Phulkari, modern machine embroidery styles, beads, applique, and delicate mirror work integration.',
    desc_pa: 'ਪੰਜਾਬੀ ਫੁਲਕਾਰੀ, ਮਸ਼ੀਨੀ ਕਢਾਈ, ਤਿੱਲਾ ਵਰਕ, ਮੋਤੀਆਂ ਦੀ ਕਢਾਈ ਅਤੇ ਸ਼ੀਸ਼ਾ ਵਰਕ ਦੀਆਂ ਬਾਰੀਕੀਆਂ ਸਿੱਖੋ।',
    duration_en: '6 Months Diploma',
    duration_pa: '6 ਮਹੀਨੇ ਦਾ ਡਿਪਲੋਮਾ',
    fees: 3000,
    syllabus_en: 'Phulkari Stitches, Machine Embroidery patterns, Mirror Work, Thread Artistry',
    syllabus_pa: 'ਫੁਲਕਾਰੀ ਵਰਕ, ਡਿਜ਼ਾਈਨ ਅਲਾਈਨਮੈਂਟ, ਮੋਤੀ ਤੇ ਕੰਚ ਕਾਰੀਗਰੀ, ਜ਼ਰੀ ਵਰਕ'
  },
  {
    id: 'base-fashion-3',
    title_en: 'Advanced Masterclass in Fashion Designing',
    title_pa: 'ਪ੍ਰੋਫੈਸ਼ਨਲ ਫੈਸ਼ਨ ਡਿਜ਼ਾਈਨਿੰਗ',
    desc_en: 'A comprehensive vocational course in custom boutique management, western dress styling, designer blouses, and bridal lehengas.',
    desc_pa: 'ਬੁਟੀਕ ਮੈਨੇਜਮੈਂਟ, ਡਿਜ਼ਾਈਨਰ ਬਲਾਊਜ਼, ਲਾੜੀ ਦੇ ਲਹਿੰਗੇ, ਪੱਛਮੀ ਪਹਿਰਾਵੇ (Western Dresses) ਅਤੇ ਮੁਕੰਮਲ ਬੁਟੀਕ ਕੋਰਸ।',
    duration_en: '12 Months Professional',
    duration_pa: '12 ਮਹੀਨੇ ਪ੍ਰੋਫੈਸ਼ਨਲ',
    fees: 5000,
    syllabus_en: 'Boutique Operations, Bridal Wear, Advanced Draping, Fabric Analytics',
    syllabus_pa: 'ਬੁਟੀਕ ਸੈਟਅਪ, ਬ੍ਰਾਈਡਲ ਲਹਿੰਗਾ, ਵੈਸਟਰਨ ਡਿਸਪਲੇ, ਮਟੀਰੀਅਲ ਡਿਜ਼ਾਈਨਿੰਗ'
  }
];

export async function fetchCourses() {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('title_en', { ascending: true });
    
    if (error) throw error;
    // Return database values if records found, else use fallback
    return (data && data.length > 0) ? data : fallbackCourses;
  } catch (err) {
    console.warn("Supabase fetch failed. Loading offline high-fidelity courses fallback: ", err.message);
    return fallbackCourses;
  }
}

function renderCoursesList(courses) {
  const grid = document.getElementById('courses-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const activeLang = getCurrentLang();

  courses.forEach(course => {
    const title = activeLang === 'en' ? course.title_en : course.title_pa;
    const desc = activeLang === 'en' ? course.desc_en : course.desc_pa;
    const duration = activeLang === 'en' ? course.duration_en : course.duration_pa;
    const syllabus = activeLang === 'en' ? course.syllabus_en : course.syllabus_pa;
    
    const formattedFee = `₹${course.fees}`;
    
    const card = document.createElement('div');
    card.className = 'course-card';
    card.id = `course-card-${course.id}`;
    
    card.innerHTML = `
      <div class="course-card-body">
        <span class="course-price-badge">${formattedFee}</span>
        <h3 class="course-title">${title}</h3>
        <p class="course-desc">${desc}</p>
        <ul class="course-details">
          <li>
            <strong data-en="Duration: " data-pa="ਸਮਾਂ: ">${activeLang === 'en' ? 'Duration: ' : 'ਸਮਾਂ: '}</strong> ${duration}
          </li>
          <li>
            <strong data-en="Syllabus: " data-pa="ਸਿਲੇਬਸ: ">${activeLang === 'en' ? 'Syllabus: ' : 'ਸਿਲੇਬਸ: '}</strong> ${syllabus}
          </li>
        </ul>
      </div>
      <div class="course-action-bar">
        <a href="contact.html?enroll=${encodeURIComponent(course.title_en)}&courseId=${course.id}" 
           class="btn btn-primary btn-xs"
           data-en="APPLY & REGISTER" 
           data-pa="ਦਾਖਲਾ ਫਾਰਮ ਭਰੋ">
           ${activeLang === 'en' ? 'APPLY & REGISTER' : 'ਦਾਖਲਾ ਫਾਰਮ ਭਰੋ'}
        </a>
      </div>
    `;
    
    grid.appendChild(card);
  });
}

// Global initialization
document.addEventListener('DOMContentLoaded', async () => {
  const courses = await fetchCourses();
  renderCoursesList(courses);

  // Re-render when active language swaps
  document.addEventListener('languageChanged', () => {
    renderCoursesList(courses);
  });
});
