/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Phone, Mail, MapPin, Instagram, Clock, Award, ShieldAlert } from 'lucide-react';
import { translations } from '../localization';

interface FooterProps {
  currentLang: 'en' | 'pa';
  setView: (view: string) => void;
}

export default function Footer({ currentLang, setView }: FooterProps) {
  const t = translations[currentLang];
  const currentYear = new Date().getFullYear();

  const handleLink = (viewId: string) => {
    setView(viewId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#093227] text-[#fff4df] border-t border-[#12503f] font-sans pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-10 border-b border-[#12503f]">
          
          {/* Brand and Description Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#8b1f2f] rounded-full flex items-center justify-center border border-[#f6d8a8]">
                <span className="font-serif text-lg font-bold text-white">K</span>
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-white leading-tight">
                  Komal Creations
                </h3>
                <span className="text-[10px] tracking-widest text-[#f6d8a8] uppercase font-semibold">
                  &amp; Training Center
                </span>
              </div>
            </div>
            <p className="text-xs text-brand-cream/70 leading-relaxed max-w-xs">
              {currentLang === 'en' 
                ? "Empowering women with standard, premium practical dress designing, boutique stitching and embroidery skills to foster specialized local career opportunities."
                : "ਮਹਿਲਾਵਾਂ ਨੂੰ ਪੇਸ਼ੇਵਰ ਸਿਲਾਈ, ਕਢਾਈ ਅਤੇ ਬੁਟੀਕ ਡਿਜ਼ਾਈਨਿੰਗ ਦੇ ਉੱਚ-ਪੱਧਰੀ ਵਿਵਸਾਇਕ ਹੁਨਰ ਪ੍ਰਦਾਨ ਕਰਕੇ ਸਵੈ-ਰੁਜ਼ਗਾਰ ਦੇ ਕਾਬਿਲ ਬਣਾਉਣਾ।"}
            </p>
            <div className="flex items-center space-x-3 pt-2">
              <a 
                href="https://instagram.com/preet_Dress_collection" 
                target="_blank" 
                rel="noreferrer noopener"
                className="w-8 h-8 rounded-full bg-[#16614d] flex items-center justify-center text-brand-gold hover:text-white hover:bg-[#8b1f2f] transition duration-150 shadow"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a 
                href="https://wa.me/919814590408" 
                target="_blank" 
                rel="noreferrer noopener"
                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-full text-xs font-semibold flex items-center space-x-1 shadow transition"
              >
                <Phone className="w-3.5 h-3.5 fill-current" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Quick Links Section */}
          <div>
            <h4 className="font-serif text-sm font-bold text-white tracking-wider uppercase mb-4 border-b border-brand-secondary-green/30 pb-2">
              {currentLang === 'en' ? "Useful Links" : "ਜ਼ਰੂਰੀ ਲਿੰਕ"}
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button onClick={() => handleLink('home')} className="hover:text-brand-gold transition-colors text-left font-medium">
                  → {t.home}
                </button>
              </li>
              <li>
                <button onClick={() => handleLink('courses')} className="hover:text-brand-gold transition-colors text-left font-medium">
                  → {t.courses}
                </button>
              </li>
              <li>
                <button onClick={() => handleLink('gallery')} className="hover:text-brand-gold transition-colors text-left font-medium">
                  → {t.gallery}
                </button>
              </li>
              <li>
                <button onClick={() => handleLink('contact')} className="hover:text-brand-gold transition-colors text-left font-medium">
                  → {t.contact}
                </button>
              </li>
              <li>
                <button onClick={() => handleLink('verify-certificate')} className="hover:text-brand-gold transition-colors text-left font-medium text-brand-gold flex items-center space-x-1 font-semibold">
                  <span>→ {t.verifyCert}</span>
                  <Award className="w-3 h-3 text-brand-gold animate-bounce" />
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Details Section */}
          <div className="space-y-3.5">
            <h4 className="font-serif text-sm font-bold text-white tracking-wider uppercase border-b border-brand-secondary-green/30 pb-2">
              {currentLang === 'en' ? "Boutique Location" : "ਬੁਟੀਕ ਸੰਪਰਕ"}
            </h4>
            
            <div className="flex items-start space-x-2.5 text-xs text-brand-cream/80">
              <MapPin className="w-4 h-4 text-brand-gold mt-0.5 flex-shrink-0" />
              <span className="leading-relaxed">{t.addressVal}</span>
            </div>

            <div className="flex items-center space-x-2.5 text-xs text-brand-cream/80">
              <Phone className="w-4 h-4 text-brand-gold flex-shrink-0" />
              <div>
                <p>+91 98145-90408</p>
                <p>+91 88725-65408</p>
              </div>
            </div>

            <div className="flex items-center space-x-2.5 text-xs text-brand-cream/80">
              <Mail className="w-4 h-4 text-brand-gold flex-shrink-0" />
              <span className="break-all">komalpreet1625@gmail.com</span>
            </div>

            <div className="flex items-start space-x-2.5 text-xs text-brand-cream/70 pt-1 border-t border-brand-secondary-green/20">
              <Clock className="w-4 h-4 text-brand-gold mt-0.5 flex-shrink-0" />
              <span>{t.hoursVal}</span>
            </div>
          </div>

        </div>

        {/* Brand Copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-brand-cream/50 font-mono">
          <p>© {currentYear} Komal Creations. All rights reserved.</p>
          <div className="flex items-center space-x-4 mt-3 sm:mt-0">
            <button onClick={() => handleLink('admin-login')} className="hover:text-brand-gold flex items-center space-x-1 transition duration-150">
              <ShieldAlert className="w-3.5 h-3.5 text-brand-gold" />
              <span>Administration Access</span>
            </button>
            <p>Nabha, Patiala, Punjab, India</p>
          </div>
        </div>

      </div>
    </footer>
  );
}
