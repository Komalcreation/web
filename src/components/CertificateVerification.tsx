/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Award, ShieldCheck, HelpCircle, FileText, AlertCircle, RefreshCw } from 'lucide-react';
import { translations } from '../localization';

interface CertificateVerificationProps {
  currentLang: 'en' | 'pa';
}

export default function CertificateVerification({ currentLang }: CertificateVerificationProps) {
  const t = translations[currentLang];

  const [inputCode, setInputCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [certData, setCertData] = useState<any | null>(null);
  const [errorStatus, setErrorStatus] = useState<boolean>(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setCertData(null);
    setErrorStatus(false);

    const cleanCode = inputCode.trim();
    if (!cleanCode) {
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/public/verify/${encodeURIComponent(cleanCode)}`);
      
      if (res.ok) {
        const data = await res.json();
        setCertData(data);
      } else {
        setErrorStatus(true);
      }
    } catch {
      setErrorStatus(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-brand-off-white py-16 px-4 sm:px-6 lg:px-8 font-sans min-h-[calc(100vh-200px)]">
      <div className="max-w-3xl mx-auto space-y-10">
        
        {/* Header Title */}
        <div className="text-center space-y-4">
          <div className="w-14 h-14 bg-brand-maroon/90 text-brand-cream border-2 border-brand-gold rounded-full flex items-center justify-center shadow mx-auto">
            <Award className="w-7 h-7 text-brand-gold" />
          </div>
          <h1 className="font-serif text-3xl sm:text-4.5xl font-black text-brand-dark-green tracking-tight">
            {t.verifyTitle}
          </h1>
          <div className="w-20 h-1 bg-brand-gold mx-auto rounded"></div>
          <p className="text-slate-600 text-sm leading-relaxed max-w-2xl mx-auto">
            {t.verifySub}
          </p>
        </div>

        {/* Input box */}
        <div className="bg-white border border-[#eae6db] rounded-2xl p-8 shadow-xl max-w-xl mx-auto">
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#16614d] uppercase tracking-wide block">
                {currentLang === 'en' ? "Verification Code" : "ਵੈਰੀਫਿਕੇਸ਼ਨ ਕੋਡ ਦਰਜ ਕਰੋ"}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  placeholder={t.enterCodePlc}
                  disabled={loading}
                  className="flex-1 px-4 py-3 border border-slate-300 rounded-lg text-sm font-mono font-bold uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-brand-secondary-green"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-brand-maroon hover:bg-red-800 text-white font-serif font-bold text-xs uppercase tracking-wider rounded-lg border border-brand-gold/30 flex items-center space-x-1.5 transition cursor-pointer disabled:bg-slate-400"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-brand-gold" />
                  ) : (
                    <span>{t.verifyBtn}</span>
                  )}
                </button>
              </div>
            </div>

            <div className="p-3 bg-brand-cream/50 border border-brand-gold/20 rounded flex items-start space-x-2">
              <HelpCircle className="w-4 h-4 text-brand-maroon flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-brand-dark-green leading-relaxed">
                {currentLang === 'en'
                  ? "Test code: Try searching code KCMA612 to test verification logic."
                  : "ਟੈਸਟ ਕੋਡ: ਵੈਰੀਫਿਕੇਸ਼ਨ ਚੈੱਕ ਕਰਨ ਲਈ ਟੈਸਟ ਕੋਡ KCMA612 ਭਰਕੇ ਦੇਖੋ।"}
              </p>
            </div>
          </form>
        </div>

        {/* Verification Success Results Card */}
        {certData && (
          <div className="bg-white border-2 border-emerald-600 rounded-2xl overflow-hidden shadow-2xl relative max-w-xl mx-auto animate-scaleUp">
            
            {/* Header badge */}
            <div className="bg-emerald-600 text-white p-4 text-center tracking-wider font-mono text-xs uppercase font-bold flex items-center justify-center space-x-2">
              <ShieldCheck className="w-4.5 h-4.5 text-brand-gold" />
              <span>{t.certValid}</span>
            </div>

            <div className="p-8 space-y-6">
              
              {/* Profile layout */}
              <div className="flex flex-col items-center text-center pb-4 border-b border-slate-100">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200 shadow-inner mb-3">
                  <Award className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-lg font-bold text-slate-900">{certData.student_name}</h3>
                <p className="text-[11px] text-[#16614d] font-mono uppercase tracking-widest font-bold mt-1">
                  Komal Creations Graduate Profile
                </p>
              </div>

              {/* Attributes lists */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-xs font-sans text-slate-705">
                
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider">{t.studentName}</p>
                  <p className="font-semibold text-slate-900">{certData.student_name}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider">{t.issuedCourse}</p>
                  <p className="font-semibold text-brand-dark-green font-serif">
                    {currentLang === 'en' ? certData.course_name_en : certData.course_name_pa}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider">{t.certNo}</p>
                  <p className="font-mono font-bold text-[#8b1f2f]">{certData.certificate_number}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider">{t.issueDate}</p>
                  <p className="font-mono font-semibold">{certData.issue_date}</p>
                </div>

                <div className="space-y-1 sm:col-span-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider">{t.statusText}</p>
                    <p className="text-emerald-700 font-bold font-serif">{t.completionStatus} ({certData.completion_status})</p>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    ID: {certData.id}
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* Verification Failed Negative Response */}
        {errorStatus && (
          <div className="bg-white border-2 border-red-500 rounded-2xl p-8 shadow-xl max-w-xl mx-auto text-center space-y-4 animate-shake">
            <div className="w-12 h-12 bg-red-55 rounded-full flex items-center justify-center text-red-600 mx-auto shadow-inner">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="font-serif text-lg font-bold text-red-800">{t.notMatchTitle}</h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
                {t.notMatchDesc}
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
