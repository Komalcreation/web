/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Phone, MessageCircle } from 'lucide-react';
import Header from './components/Header';
import Footer from './components/Footer';
import HomeSection from './components/HomeSection';
import CoursesSection from './components/CoursesSection';
import GallerySection from './components/GallerySection';
import ContactSection from './components/ContactSection';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import CertificateVerification from './components/CertificateVerification';
import PrintCertificate from './components/PrintCertificate';
import { Certificate } from './types';

export default function App() {
  // 1. Language State - Defauting to Punjabi ('pa') as the business is localized in Punjab.
  const [currentLang, setLang] = useState<'en' | 'pa'>(() => {
    const saved = localStorage.getItem('komal_creations_lang');
    return (saved === 'en' || saved === 'pa') ? saved : 'pa';
  });

  // 2. Routing View State - Default to 'home'
  const [view, setViewState] = useState<string>('home');

  // 3. Admin Claims State
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    return localStorage.getItem('komal_creations_admin_token');
  });

  // Selected certificate for printing transition states
  const [printCert, setPrintCert] = useState<Certificate | null>(null);

  // Sync state language toggler with local files
  const handleSetLang = (lang: 'en' | 'pa') => {
    setLang(lang);
    localStorage.setItem('komal_creations_lang', lang);
  };

  // Sync state views with window local hashes
  const setView = (v: string) => {
    setViewState(v);
    window.location.hash = v;
  };

  // On Login success write cookies/sessions
  const handleLoginSuccess = (token: string) => {
    setAdminToken(token);
    localStorage.setItem('komal_creations_admin_token', token);
  };

  // Clear Sessions
  const handleLogout = () => {
    setAdminToken(null);
    localStorage.removeItem('komal_creations_admin_token');
    setView('home');
  };

  // Listen to address bar hash changes for deep linking inside the application in an iframe
  useEffect(() => {
    const handleHashChange = () => {
      const h = window.location.hash.substring(1);
      const validViews = ['home', 'courses', 'gallery', 'contact', 'admin-login', 'admin-dashboard', 'verify-certificate', 'print-certificate'];
      if (h && validViews.includes(h)) {
        // Enforce admin check for dashboard
        if (h === 'admin-dashboard' && !localStorage.getItem('komal_creations_admin_token')) {
          setViewState('admin-login');
        } else {
          setViewState(h);
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    // Bind initial hash on load
    handleHashChange();

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const isAdminLoggedIn = adminToken !== null;

  return (
    <div className="flex flex-col min-h-screen bg-brand-off-white selection:bg-brand-maroon selection:text-white">
      
      {/* Dynamic Header */}
      <Header
        currentLang={currentLang}
        setLang={handleSetLang}
        activeView={view}
        setView={setView}
        isAdminLoggedIn={isAdminLoggedIn}
        onLogout={handleLogout}
      />

      {/* Primary Routing Body */}
      <main className="flex-grow">
        {view === 'home' && (
          <HomeSection currentLang={currentLang} setView={setView} />
        )}
        {view === 'courses' && (
          <CoursesSection currentLang={currentLang} />
        )}
        {view === 'gallery' && (
          <GallerySection currentLang={currentLang} />
        )}
        {view === 'contact' && (
          <ContactSection currentLang={currentLang} />
        )}
        {view === 'admin-login' && (
          <AdminLogin
            currentLang={currentLang}
            onLoginSuccess={handleLoginSuccess}
            setView={setView}
          />
        )}
        {view === 'admin-dashboard' && (
          <AdminDashboard
            currentLang={currentLang}
            adminToken={adminToken || ''}
            setView={setView}
            setSelectedCertificateForPrint={setPrintCert}
          />
        )}
        {view === 'verify-certificate' && (
          <CertificateVerification currentLang={currentLang} />
        )}
        {view === 'print-certificate' && (
          <PrintCertificate
            currentLang={currentLang}
            certificate={printCert}
            setView={setView}
          />
        )}
      </main>

      {/* Floating WhatsApp Quick Assistant Badge (Visually Hidden in printing) */}
      <div className="fixed bottom-6 right-6 z-40 no-print-area">
        <a
          href="https://wa.me/919814590408"
          target="_blank"
          rel="noreferrer noopener"
          className="w-14 h-14 bg-green-600 text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-green-700 hover:scale-105 transition-all duration-150 relative group cursor-pointer"
          aria-label="Contact Komalpreet on WhatsApp"
        >
          {/* Pulsing indicator */}
          <span className="absolute inset-0 rounded-full bg-green-600/30 animate-ping"></span>
          <MessageCircle className="w-8 h-8 relative z-10 fill-current" />
          
          <span className="absolute right-16 scale-0 group-hover:scale-100 bg-black/85 text-brand-cream text-xxs font-mono py-1 px-2.5 rounded whitespace-nowrap transition duration-150 uppercase tracking-widest font-bold">
            {currentLang === 'en' ? "Chat With Komalpreet" : "ਕੋਮਲਪ੍ਰੀਤ ਨਾਲ ਗੱਲ ਕਰੋ"}
          </span>
        </a>
      </div>

      {/* Footer Element */}
      <Footer currentLang={currentLang} setView={setView} />

    </div>
  );
}
