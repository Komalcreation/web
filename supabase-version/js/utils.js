/**
 * Komal Creations & Training Center - Global Utility Helpers
 */

/**
 * Shorthand element query selectors
 */
export const $ = (selector) => document.querySelector(selector);
export const $$ = (selector) => document.querySelectorAll(selector);

/**
 * Generates a unique cryptographic certificate verification code
 * e.g. "KCMA612" (7 characters: "KC" + 5 random alphanumeric uppercase letters)
 */
export function generateVerificationCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid ambiguous letters like I, O, 0, 1
  let code = 'KC';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Generates a serial sequential Certificate Ledger Number
 * e.g. "KC-2026-1049"
 */
export function generateCertificateNumber() {
  const year = new Date().getFullYear();
  const index = Math.floor(1000 + Math.random() * 9000); // 4-digit index
  return `KC-${year}-${index}`;
}

/**
 * Renders a floating, high-contrast Toast Alert Message
 * @param {string} text_en EN text content
 * @param {string} text_pa PA text content
 * @param {'success' | 'error'} type Styling preset
 */
export function showToast(text_en, text_pa, type = 'success') {
  // Check if active language is english or punjabi
  const savedLang = localStorage.getItem('komal_creations_lang') || 'pa';
  const text = savedLang === 'en' ? text_en : text_pa;

  // Remove existing toast if present
  const oldToast = document.getElementById('global-toast-alert');
  if (oldToast) oldToast.remove();

  // Create toast container element
  const toast = document.createElement('div');
  toast.id = 'global-toast-alert';
  
  // Style properties
  toast.style.position = 'fixed';
  toast.style.bottom = '2rem';
  toast.style.left = '50%';
  toast.style.transform = 'translateX(-50%)';
  toast.style.padding = '0.9rem 1.75rem';
  toast.style.borderRadius = '8px';
  toast.style.fontSize = '0.85rem';
  toast.style.fontWeight = '600';
  toast.style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)';
  toast.style.zIndex = '9999';
  toast.style.display = 'flex';
  toast.style.alignItems = 'center';
  toast.style.gap = '0.5rem';
  toast.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
  toast.style.maxWidth = '90%';
  toast.style.width = 'max-content';

  if (type === 'success') {
    toast.style.backgroundColor = '#0e4b3a'; // Primary Green
    toast.style.color = '#fff4df'; // Cream
    toast.style.border = '1px solid #f6d8a8'; // Gold Sand
    toast.innerHTML = `✔️ ${text}`;
  } else {
    toast.style.backgroundColor = '#8b1f2f'; // Primary Maroon
    toast.style.color = '#fff4df'; // Cream
    toast.style.border = '1px solid #f6d8a8';
    toast.innerHTML = `⚠️ ${text}`;
  }

  document.body.appendChild(toast);

  // Fade out timing
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(10px)';
    setTimeout(() => toast.remove(), 200);
  }, 4000);
}
