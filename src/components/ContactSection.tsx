/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Mail, MapPin, Phone, Instagram, Clock, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { translations } from '../localization';

interface ContactSectionProps {
  currentLang: 'en' | 'pa';
}

export default function ContactSection({ currentLang }: ContactSectionProps) {
  const t = translations[currentLang];

  // Contact Form States
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  // Submit states
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    if (!fullName.trim() || !phone.trim() || !message.trim()) {
      setErrorMsg(currentLang === 'en' 
        ? "Please fulfill all required fields: Name, Phone, and Message." 
        : "ਕਿਰਪਾ ਕਰਕੇ ਸਾਰੇ ਜ਼ਰੂਰੀ ਖਾਨੇ ਭਰੋ: ਨਾਮ, ਫੋਨ ਅਤੇ ਸੁਨੇਹਾ।");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/public/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          full_name: fullName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          message: message.trim()
        })
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMsg(data.message || t.contactSuccess);
        setFullName('');
        setPhone('');
        setEmail('');
        setMessage('');
      } else {
        setErrorMsg(data.error || (currentLang === 'en' ? "Failed to log message." : "ਸੁਨੇਹਾ ਭੇਜਣ 'ਚ ਅਸਫਲ।"));
      }
    } catch {
      setErrorMsg(currentLang === 'en' ? "Server connection failure. Please retry." : "ਸਰਵਰ ਕਨੈਕਸ਼ਨ ਫੇਲ੍ਹ, ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-brand-off-white py-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h1 className="font-serif text-3xl sm:text-4.5xl font-black text-brand-dark-green tracking-tight">
            {t.contactPageTitle}
          </h1>
          <div className="w-20 h-1 bg-brand-maroon mx-auto rounded"></div>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            {t.contactPageSub}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Card left detail */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* Quick Contacts Box */}
            <div className="bg-gradient-to-br from-brand-dark-green to-brand-secondary-green rounded-2xl p-8 text-brand-cream space-y-6 shadow-lg border border-brand-secondary-green/30">
              
              <div className="flex items-start space-x-4">
                <div className="p-3 rounded-lg bg-brand-secondary-green text-brand-gold flex-shrink-0 mt-0.5 border border-brand-gold/15">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif text-sm font-bold text-white tracking-wider uppercase">
                    {t.addressTitle}
                  </h3>
                  <p className="text-xs text-brand-cream/85 leading-relaxed">{t.addressVal}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="p-3 rounded-lg bg-brand-secondary-green text-brand-gold flex-shrink-0 mt-0.5 border border-brand-gold/15">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif text-sm font-bold text-white tracking-wider uppercase">
                    {t.phoneTitle}
                  </h3>
                  <p className="text-xs text-brand-cream/85 leading-relaxed">
                    +91 98145-90408 <br />
                    +91 88725-65408
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="p-3 rounded-lg bg-brand-secondary-green text-brand-gold flex-shrink-0 mt-0.5 border border-brand-gold/15">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif text-sm font-bold text-white tracking-wider uppercase">
                    {t.emailTitle}
                  </h3>
                  <p className="text-xs text-brand-cream/85 leading-relaxed break-all">komalpreet1625@gmail.com</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="p-3 rounded-lg bg-brand-secondary-green text-brand-gold flex-shrink-0 mt-0.5 border border-brand-gold/15">
                  <Instagram className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif text-sm font-bold text-white tracking-wider uppercase">
                    {t.instagramTitle}
                  </h3>
                  <a
                    href="https://instagram.com/preet_Dress_collection"
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-xs text-brand-gold hover:text-white underline transition"
                  >
                    @preet_Dress_collection
                  </a>
                </div>
              </div>

              {/* Teaching hours */}
              <div className="flex items-start space-x-4 pt-4 border-t border-brand-secondary-green/30">
                <div className="p-3 rounded-lg bg-[#0b3c2e] text-brand-gold flex-shrink-0 mt-0.5">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif text-sm font-bold text-white tracking-wider uppercase">
                    {t.hoursTitle}
                  </h3>
                  <p className="text-xs text-brand-gold/90 leading-relaxed font-mono font-semibold">{t.hoursVal}</p>
                </div>
              </div>

            </div>

            {/* Google Map Mock Placeholder */}
            <div className="bg-white border border-[#eae6db] rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="font-serif text-base font-bold text-brand-dark-green flex items-center space-x-2">
                <MapPin className="w-4.5 h-4.5 text-brand-maroon" />
                <span>{currentLang === 'en' ? "Map Location" : "ਮੈਪ ਲੋਕੇਸ਼ਨ"}</span>
              </h3>
              
              {/* Map visual rendering */}
              <div className="relative w-full aspect-video rounded-xl bg-[#fffcf4] border-2 border-dashed border-[#e6daaa] flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden group">
                <div className="absolute inset-0 bg-[radial-gradient(#16614d_1px,transparent_1px)] [background-size:12px_12px] opacity-10"></div>
                <div className="w-10 h-10 rounded-full bg-brand-cream border border-brand-gold text-brand-maroon flex items-center justify-center shadow animate-bounce z-10">
                  <MapPin className="w-5 h-5" />
                </div>
                <p className="text-xs font-serif font-bold text-brand-dark-green mt-3 max-w-xs z-10">
                  {currentLang === 'en' ? "Aloharan Khurd, Nabha, Punjab" : "ਆਲੋਹਰਾਂ ਖੁਰਦ, ਨਾਭਾ, ਪੰਜਾਬ"}
                </p>
                <p className="text-[10px] text-slate-500 font-mono mt-1 z-10 max-w-xxs">
                  Megh Colony Area, Nabha • Patiala Pin: 147201
                </p>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent("Megh Colony, Aloharan Khurd, Nabha, Patiala, Punjab - 147201, India")}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="mt-4 px-4 py-1.5 bg-brand-secondary-green hover:bg-[#155a47] text-white rounded text-[10px] font-mono font-bold tracking-wider uppercase transition relative z-10 shadow cursor-pointer"
                >
                  {currentLang === 'en' ? "Open in Google Maps" : "ਗੂਗਲ ਮੈਪ 'ਤੇ ਖੋਲ੍ਹੋ"}
                </a>
              </div>
            </div>

          </div>

          {/* Form right detail */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-brand-cream/60 p-8 shadow-xl">
            <h2 className="font-serif text-xl font-bold text-brand-dark-green pb-1.5 flex items-center space-x-2">
              <Send className="w-4 h-4 text-brand-gold" />
              <span>{t.sendMailTitle}</span>
            </h2>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed border-b border-slate-100 pb-4">{t.sendMailSub}</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Server Message Displays */}
              {successMsg && (
                <div className="p-4 bg-green-50 text-green-800 border-l-4 border-green-600 rounded flex items-start space-x-2.5 text-xs">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="font-medium leading-relaxed">{successMsg}</span>
                </div>
              )}
              {errorMsg && (
                <div className="p-4 bg-red-50 text-red-800 border-l-4 border-red-600 rounded flex items-start space-x-2.5 text-xs">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <span className="font-medium leading-relaxed">{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Full name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">
                    {t.fullName} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={currentLang === 'en' ? "Harpreet Kaur" : "ਆਪਣਾ ਪੂਰਾ ਨਾਮ ਲਿਖੋ"}
                    disabled={loading}
                    className="w-full px-4 py-2.5 max-w-full rounded-md border border-slate-300 text-sm focus:outline-none focus:border-brand-secondary-green"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">
                    {t.phone} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 98145-90408"
                    disabled={loading}
                    className="w-full px-4 py-2.5 max-w-full rounded-md border border-slate-300 text-sm focus:outline-none focus:border-brand-secondary-green"
                  />
                </div>

              </div>

              {/* Email Optional */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  {t.email} <span className="text-slate-400">({currentLang === 'en' ? 'optional' : 'ਵਿਕਲਪਿਕ'})</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. name@gamil.com"
                  disabled={loading}
                  className="w-full px-4 py-2.5 max-w-full rounded-md border border-slate-300 text-sm focus:outline-none focus:border-brand-secondary-green"
                />
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  {t.msgLabel} <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={currentLang === 'en' ? "Write your questions here..." : "ਆਪਣਾ ਸੁਨੇਹਾ ਜਾਂ ਪੁੱਛਗਿੱਛ ਇੱਥੇ ਲਿਖੋ..."}
                  disabled={loading}
                  rows={4}
                  className="w-full px-4 py-2.5 max-w-full rounded-md border border-slate-300 text-sm focus:outline-none focus:border-brand-secondary-green"
                />
              </div>

              {/* Submit button */}
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 bg-brand-dark-green hover:bg-brand-secondary-green text-white font-serif font-bold text-xs tracking-wider uppercase rounded-lg shadow border border-brand-gold/15 transition flex items-center justify-center space-x-2.5 cursor-pointer disabled:bg-slate-400"
                >
                  <span>{loading ? t.sending : t.sendMsgBtn}</span>
                </button>
              </div>

            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
