/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { Award, Printer, CheckCircle2, ChevronLeft, ShieldCheck } from 'lucide-react';
import { translations } from '../localization';
import { Certificate } from '../types';

interface PrintCertificateProps {
  currentLang: 'en' | 'pa';
  certificate: Certificate | null;
  setView: (view: string) => void;
}

export default function PrintCertificate({ currentLang, certificate, setView }: PrintCertificateProps) {
  const t = translations[currentLang];

  useEffect(() => {
    // Add print styles dynamically to document head to suppress browser headers/footers if possible, of scale correctly
    const styleId = "print-certificate-styles";
    let style = document.getElementById(styleId);
    if (!style) {
      style = document.createElement('style');
      style.id = styleId;
      style.innerHTML = `
        @media print {
          body {
            background-color: white !important;
            color: black !important;
          }
          .no-print-area {
            display: none !important;
          }
          .print-scale {
            transform: scale(1) !important;
            border: none !important;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: auto !important;
          }
          @page {
            size: landscape;
            margin: 10mm;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (!certificate) {
    return (
      <div className="bg-brand-off-white min-h-[500px] flex items-center justify-center font-sans">
        <div className="text-center space-y-4 p-8 bg-white rounded-xl border border-slate-200">
          <ChevronLeft className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-sm font-mono text-slate-500">No certificate selected for print rendering.</p>
          <button 
            onClick={() => setView('admin-dashboard')}
            className="px-4 py-2 bg-brand-dark-green text-white text-xs font-mono font-bold rounded-lg"
          >
            Go back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-100 min-h-screen py-10 px-4 sm:px-6 lg:px-8 font-sans no-print-area-wrapper">
      
      {/* 1. Controller Bar - Hidden in printing */}
      <div className="max-w-5xl mx-auto bg-white border border-[#eae6db] rounded-xl p-4 mb-6 shadow-sm flex items-center justify-between no-print-area">
        <button
          onClick={() => setView('admin-dashboard')}
          className="px-3.5 py-1.5 hover:bg-slate-50 border border-slate-300 text-slate-600 rounded text-xs font-mono font-bold tracking-wide transition flex items-center space-x-1.5 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Dashboard</span>
        </button>
        
        <div className="flex items-center space-x-2 text-xs font-mono font-bold text-brand-secondary-green">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Print Landscape Mode Recommended</span>
        </div>

        <button
          onClick={handlePrint}
          className="px-5 py-2 bg-brand-maroon hover:bg-red-800 text-white font-serif font-bold text-xs uppercase tracking-wider rounded-lg border-2 border-brand-gold flex items-center space-x-2 transition cursor-pointer shadow"
        >
          <Printer className="w-4 h-4 text-brand-gold" />
          <span>{t.printNow}</span>
        </button>
      </div>

      {/* 2. Main Certificate Sheet */}
      <div className="max-w-5xl mx-auto bg-white aspect-[1.414/1] shadow-2xl rounded p-6 sm:p-12 relative overflow-hidden border border-slate-200 print-scale">
        
        {/* Double Frame Traditional Border */}
        <div className="absolute inset-4 border-4 border-brand-dark-green"></div>
        <div className="absolute inset-6 border border-brand-gold"></div>

        {/* Framing Corner Accents */}
        <div className="absolute top-8 left-8 w-10 h-10 border-t-2 border-l-2 border-brand-maroon"></div>
        <div className="absolute top-8 right-8 w-10 h-10 border-t-2 border-r-2 border-brand-maroon"></div>
        <div className="absolute bottom-8 left-8 w-10 h-10 border-b-2 border-l-2 border-brand-maroon"></div>
        <div className="absolute bottom-8 right-8 w-10 h-10 border-b-2 border-r-2 border-brand-maroon"></div>

        {/* Certificate İçerik */}
        <div className="relative z-10 w-full h-full flex flex-col justify-between items-center text-center p-6 space-y-6">
          
          {/* Top Crest / Logo info */}
          <div className="space-y-1 pt-4">
            <div className="w-12 h-12 bg-[#8b1f2f] rounded-full flex items-center justify-center border border-brand-gold mx-auto shadow-sm">
              <span className="font-serif text-lg font-bold text-[#fff4df]">K</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-black text-brand-dark-green tracking-wide">
              {currentLang === 'en' ? "Komal Creations & Training Center" : "ਕੋਮਲ ਕ੍ਰਿਏਸ਼ਨਜ਼ ਐਂਡ ਟ੍ਰੇਨਿੰਗ ਸੈਂਟਰ"}
            </h2>
            <p className="text-[10px] sm:text-xs text-brand-gold uppercase tracking-widest font-mono font-bold">
              {currentLang === 'en' 
                ? "Vocational Stitching, Dress Designing & Embroidery Center"
                : "ਲੇਡੀਜ਼ ਸੂਟ ਸਿਲਾਈ, ਡਿਜ਼ਾਈਨਿੰਗ ਅਤੇ ਕਢਾਈ ਟ੍ਰੇਨਿੰਗ ਸੈਂਟਰ"}
            </p>
            <p className="text-[8px] sm:text-[10px] text-slate-400 font-mono">
              Megh Colony, Nabha, Patiala, Punjab, Pin: 147201
            </p>
          </div>

          <div className="space-y-4 max-w-2xl">
            {/* Title Certificate */}
            <h1 className="font-serif text-3xl sm:text-4xl md:text-4.5xl text-brand-maroon uppercase tracking-widest font-bold">
              {t.printTitle}
            </h1>
            
            {/* Body of Certificate */}
            <div className="space-y-4 font-sans text-xs sm:text-sm text-slate-700 leading-relaxed">
              <p className="italic text-slate-500 text-xs">{t.certifiedBy}</p>
              
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 border-b-2 border-brand-gold/30 inline-block px-8 pb-1.5 italic">
                {certificate.student_name}
              </h3>
              
              <p className="text-xs sm:text-sm px-6">
                {t.completedSuccess}
              </p>
              
              <p className="font-serif text-base sm:text-lg text-brand-dark-green font-bold tracking-tight">
                {currentLang === 'en' ? certificate.course_name_en : certificate.course_name_pa}
              </p>
              
              <p className="text-slate-500 test-xs">
                {t.certificateAt}
              </p>
            </div>
          </div>

          {/* Bottom elements (Seals, Dates, Verification Codes, Signatures) */}
          <div className="w-full grid grid-cols-3 items-end pt-4 pb-2 border-t border-slate-100">
            
            {/* Date and Cert Number (Left Column) */}
            <div className="text-left space-y-1.5 pl-4">
              <p className="text-[9px] font-bold text-slate-400 uppercase font-mono">{t.certNo}</p>
              <p className="text-xs font-mono font-bold text-[#8b1f2f]">{certificate.certificate_number}</p>
              
              <p className="text-[9px] font-bold text-slate-400 uppercase font-mono mt-2">{t.issueDate}</p>
              <p className="text-xs font-mono text-slate-705">{certificate.issue_date}</p>
            </div>

            {/* Quality Stamp Seal (Center Column) */}
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-brand-cream border-2 border-brand-gold rounded-full flex flex-col items-center justify-center p-2 text-center text-brand-maroon shadow-md relative scale-90 sm:scale-100">
                <div className="absolute inset-1 border border-dashed border-brand-gold rounded-full"></div>
                <ShieldCheck className="w-5 h-5 text-brand-maroon" />
                <span className="text-[7px] font-bold font-mono tracking-tighter uppercase text-center mt-1 text-slate-700">
                  VERIFIED ORIGINAL
                </span>
                <span className="text-[5px] text-brand-maroon/70 font-mono">KOMAL CREATIONS</span>
              </div>
            </div>

            {/* Signature Placement (Right Column) */}
            <div className="text-right pr-4 space-y-1">
              <div className="h-10 border-b border-slate-300 w-36 ml-auto relative">
                {/* Simulated elegant signature writing font or placeholder */}
                <span className="font-serif italic text-sm text-brand-dark-green absolute bottom-0.5 right-6 select-none font-semibold">Komalpreet Kaur <span className="text-[8px] font-sans text-slate-400 italic">Head</span></span>
              </div>
              <p className="text-[9px] font-bold text-slate-400 uppercase font-mono tracking-wider">{t.authorizedSig}</p>
              <p className="text-[8px] text-slate-500 font-mono">Senior Instructor &amp; Director</p>
            </div>

          </div>

          {/* Bottom small print index verification link */}
          <div className="text-[8px] text-slate-400 font-mono w-full border-t border-slate-100 pt-2 flex justify-between items-center px-4">
            <div>
              {t.verificationFoot} <span className="text-[#16614d] font-bold underline">https://komalcreations.com/#verify-certificate</span>
            </div>
            <div className="bg-indigo-50 px-2 py-0.5 rounded text-indigo-700 font-black">
              SECURE CODE: {certificate.verification_code}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
