/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, IndianRupee, Mail, MapPin, Phone, User, Globe, CheckCircle2, AlertCircle } from 'lucide-react';
import { translations } from '../localization';
import { Course } from '../types';

interface CoursesSectionProps {
  currentLang: 'en' | 'pa';
}

export default function CoursesSection({ currentLang }: CoursesSectionProps) {
  const t = translations[currentLang];
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [languagePref, setLanguagePref] = useState<'en' | 'pa'>('pa');

  // Request States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Default hardcoded fallback in case backend is offline during render
  const fallbackCourses: Course[] = [
    {
      id: "c1",
      course_name_en: "Simple Stitching",
      course_name_pa: "ਸਧਾਰਨ ਸੂਟਾਂ ਦੀ ਸਿਲਾਈ",
      description_en: "Simple suits, palazzo, frock, kurtis, simple top stitching, neck patterns and machine operations.",
      description_pa: "ਸਧਾਰਨ ਸੂਟ, ਪਲਾਜ਼ੋ, ਫਰਾਕ, ਕੁਰਤੀ, ਸਧਾਰਨ ਟੌਪ ਦੀ ਸਿਲਾਈ, ਗਲੇ ਦੇ ਡਿਜ਼ਾਈਨ ਅਤੇ ਸਿਲਾਈ ਮਸ਼ੀਨ ਚਲਾਉਣ ਦੀ ਪੂਰੀ ਸਿਖਲਾਈ।",
      price: 800,
      duration: "3 Months",
      created_at: ""
    },
    {
      id: "c2",
      course_name_en: "Hand Embroidery & Painting",
      course_name_pa: "ਹੱਥ ਦੀ ਕਢਾਈ ਅਤੇ ਚਿੱਤਰਕਾਰੀ",
      description_en: "Traditional & modern hand embroidery patterns and premium fabric color painting.",
      description_pa: "ਰਵਾਇਤੀ ਅਤੇ ਆਧੁਨਿਕ ਹੱਥਾਂ ਦੀ ਕਢਾਈ (ਫੁਲਕਾਰੀ, ਜੰਜੀਰੀ ਕਢਾਈ) ਅਤੇ ਲੇਡੀਜ਼ ਸੂਟਾਂ ਤੇ ਦੁਪੱਟਿਆਂ ਉੱਤੇ ਸ਼ਾਨਦਾਰ ਫੈਬਰਿਕ ਪੇਂਟਿੰਗ ਦੀ ਸਿਖਲਾਈ।",
      price: 1000,
      duration: "3 Months",
      created_at: ""
    },
    {
      id: "c3",
      course_name_en: "Designer Dresses",
      course_name_pa: "ਡਿਜ਼ਾਈਨਰ ਡਰੈੱਸਸ ਅਤੇ ਹੋਰ ਸਾਰੇ ਸੂਟ",
      description_en: "Elite custom designer dress stitching, tops, shirts, boutique gowns and commercial operations.",
      description_pa: "Western designer tops, formal shirts, boutique-style gowns, ਲਹਿੰਗੇ, designer suits ਅਤੇ Boutique Management।",
      price: 1500,
      duration: "6 Months",
      created_at: ""
    }
  ];

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoadingCourses(true);
      const res = await fetch('/api/public/courses');
      if (res.ok) {
        const data = await res.json();
        setCourses(data);
      } else {
        setCourses(fallbackCourses);
      }
    } catch {
      setCourses(fallbackCourses);
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitSuccess(null);
    setSubmitError(null);

    if (!fullName.trim() || !phone.trim() || !selectedCourseId) {
      setSubmitError(currentLang === 'en' 
        ? "Please fulfill all required fields: Full Name, Phone Number, and Selected Course." 
        : "ਕਿਰਪਾ ਕਰਕੇ ਸਾਰੇ ਜ਼ਰੂਰੀ ਖਾਨੇ ਭਰੋ: ਪੂਰਾ ਨਾਮ, ਫੋਨ ਨੰਬਰ ਅਤੇ ਕੋਰਸ ਦੀ ਚੋਣ ਕਰੋ।");
      return;
    }

    // Phone standard check for Indian local formats
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      setSubmitError(currentLang === 'en' 
        ? "Please enter a valid 10-digit mobile number."
        : "ਕਿਰਪਾ ਕਰਕੇ ਸਹੀ 10-ਅੰਕਾਂ ਦਾ ਮੋਬਾਈਲ ਨੰਬਰ ਦਰਜ ਕਰੋ।");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch('/api/public/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          full_name: fullName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          address: address.trim(),
          course_id: selectedCourseId,
          language_preference: languagePref
        })
      });

      const responseData = await response.json();

      if (response.ok) {
        setSubmitSuccess(responseData.message || t.enrollSuccess);
        // Clear fields on success
        setFullName('');
        setPhone('');
        setEmail('');
        setAddress('');
        setSelectedCourseId('');
      } else {
        setSubmitError(responseData.error || (currentLang === 'en' ? "Failed to record enrollment." : "ਦਾਖਲਾ ਰਿਕਾਰਡ ਕਰਨ 'ਚ ਅਸਫਲ।"));
      }
    } catch {
      setSubmitError(currentLang === 'en' ? "Server connection failure. Please try again." : "ਸਰਵਰ ਕਨੈਕਸ਼ਨ ਫੇਲ੍ਹ ਹੋਇਆ, ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।");
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayedCourses = courses.length > 0 ? courses : fallbackCourses;

  return (
    <div className="bg-brand-off-white py-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h1 className="font-serif text-3xl sm:text-4.5xl font-black text-brand-dark-green tracking-tight">
            {t.coursesPageTitle}
          </h1>
          <div className="w-20 h-1 bg-brand-maroon mx-auto rounded"></div>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            {t.coursesPageSub}
          </p>
        </div>

        {/* 1. Courses List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {displayedCourses.map((c) => {
            const isCustom = c.id === 'c1' || c.id === 'c2' || c.id === 'c3';
            return (
              <div
                key={c.id}
                className="bg-white border border-[#eae6db] hover:border-brand-secondary-green/40 rounded-2xl shadow-sm hover:shadow-md transition duration-200 overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  {/* Top Header Card */}
                  <div className="bg-gradient-to-br from-brand-dark-green to-brand-secondary-green p-6 text-brand-cream relative">
                    <div className="absolute top-4 right-4 bg-brand-maroon/90 text-brand-gold text-xs font-bold px-3 py-1 rounded-full border border-brand-gold/30 flex items-center space-x-1 shadow-sm font-mono">
                      <IndianRupee className="w-3.5 h-3.5 inline mr-0.5" />
                      <span>{c.price} / {t.month}</span>
                    </div>
                    <BookOpen className="w-8 h-8 text-brand-gold/80 mb-3" />
                    <h2 className="font-serif text-xl font-bold text-white tracking-tight">
                      {currentLang === 'en' ? c.course_name_en : c.course_name_pa}
                    </h2>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 space-y-4">
                    <p className="text-xs text-slate-600 leading-relaxed min-h-[64px]">
                      {currentLang === 'en' ? c.description_en : c.description_pa}
                    </p>

                    <div className="pt-2 flex items-center text-xs text-brand-secondary-green font-mono font-bold space-x-2">
                      <Calendar className="w-4 h-4 text-brand-gold" />
                      <span>{t.durationLabel} {c.duration}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Trigger */}
                <div className="p-6 bg-brand-off-white/50 border-t border-slate-100">
                  <a
                    href="#admission-form"
                    onClick={() => {
                      setSelectedCourseId(c.id);
                      const el = document.getElementById('admission-form');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="block w-full py-2.5 px-4 bg-white text-center text-xs font-bold text-brand-dark-green border border-brand-dark-green/35 hover:bg-brand-dark-green hover:text-white rounded-lg transition"
                  >
                    {currentLang === 'en' ? "Register for this Course" : "ਇਸ ਕੋਰਸ ਲਈ ਰਜਿਸਟਰ ਕਰੋ"}
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* 2. Admission Form Module */}
        <div id="admission-form" className="max-w-3xl mx-auto bg-white rounded-2xl border border-brand-cream/60 shadow-xl overflow-hidden mt-16 scroll-mt-24">
          <div className="bg-brand-dark-green text-brand-cream p-8 text-center relative border-b border-brand-secondary-green/30">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff4df_1px,transparent_1px)] [background-size:12px_12px]"></div>
            <h2 className="font-serif text-2xl font-bold tracking-tight text-white relative z-10">
              {t.enrollFormTitle}
            </h2>
            <p className="text-xs text-brand-cream/70 max-w-xl mx-auto mt-2 relative z-10 leading-relaxed">
              {t.enrollFormSub}
            </p>
          </div>

          <form onSubmit={handleEnroll} className="p-8 space-y-6">
            
            {/* Server Message Displays */}
            {submitSuccess && (
              <div className="p-4 bg-green-50 text-green-800 border-l-4 border-green-600 rounded flex items-start space-x-2.5 text-xs">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="font-medium leading-relaxed">{submitSuccess}</span>
              </div>
            )}
            {submitError && (
              <div className="p-4 bg-red-50 text-red-800 border-l-4 border-red-600 rounded flex items-start space-x-2.5 text-xs">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <span className="font-medium leading-relaxed">{submitError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-755 block flex items-center space-x-1">
                  <User className="w-3.5 h-3.5 text-brand-gold" />
                  <span>{t.fullName} <span className="text-red-500">*</span></span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={currentLang === 'en' ? "Harpreet Kaur" : "ਆਪਣਾ ਪੂਰਾ ਨਾਮ ਲਿਖੋ"}
                  disabled={isSubmitting}
                  className="w-full px-4 py-2.5 max-w-full rounded-md border border-slate-300 text-sm focus:outline-none focus:border-brand-secondary-green"
                />
              </div>

              {/* Phone (WhatsApp Preferred) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-755 block flex items-center space-x-1">
                  <Phone className="w-3.5 h-3.5 text-brand-gold" />
                  <span>{t.phone} <span className="text-red-500">*</span></span>
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 98145-90408"
                  disabled={isSubmitting}
                  className="w-full px-4 py-2.5 max-w-full rounded-md border border-slate-300 text-sm focus:outline-none focus:border-brand-secondary-green"
                />
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-755 block flex items-center space-x-1">
                  <Mail className="w-3.5 h-3.5 text-brand-gold" />
                  <span>{t.email} <span className="text-slate-400">({currentLang === 'en' ? 'optional' : 'ਵਿਕਲਪਿਕ'})</span></span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. name@gamil.com"
                  disabled={isSubmitting}
                  className="w-full px-4 py-2.5 max-w-full rounded-md border border-slate-300 text-sm focus:outline-none focus:border-brand-secondary-green"
                />
              </div>

              {/* Selected Course Dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-755 block flex items-center space-x-1">
                  <BookOpen className="w-3.5 h-3.5 text-brand-gold" />
                  <span>{t.selectCourse} <span className="text-red-500">*</span></span>
                </label>
                <select
                  required
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-4 py-2.5 bg-white max-w-full rounded-md border border-slate-300 text-sm focus:outline-none focus:border-brand-secondary-green cursor-pointer"
                >
                  <option value="">{t.choose}</option>
                  {displayedCourses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {currentLang === 'en' ? c.course_name_en : c.course_name_pa} (Rs {c.price})
                    </option>
                  ))}
                </select>
              </div>

            </div>

            {/* Permanent Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-755 block flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-brand-gold" />
                <span>{t.address}</span>
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={currentLang === 'en' ? "Megh Colony, Nabha, Patiala" : "ਆਪਣੇ ਪਿੰਡ/ਸ਼ਹਿਰ ਦਾ ਪੱਕਾ ਪਤਾ ਲਿਖੋ"}
                disabled={isSubmitting}
                rows={2}
                className="w-full px-4 py-2.5 max-w-full rounded-md border border-slate-300 text-sm focus:outline-none focus:border-brand-secondary-green"
              />
            </div>

            {/* Language Preference */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-755 block flex items-center space-x-1">
                <Globe className="w-3.5 h-3.5 text-brand-gold" />
                <span>{t.langPref}</span>
              </label>
              <div className="flex space-x-6">
                <label className="flex items-center space-x-2 text-xs font-medium cursor-pointer">
                  <input
                    type="radio"
                    name="langPref"
                    checked={languagePref === 'pa'}
                    onChange={() => setLanguagePref('pa')}
                    disabled={isSubmitting}
                    className="w-4 h-4 text-brand-dark-green focus:ring-brand-dark-green cursor-pointer"
                  />
                  <span>{t.prefPunjabi}</span>
                </label>
                <label className="flex items-center space-x-2 text-xs font-medium cursor-pointer">
                  <input
                    type="radio"
                    name="langPref"
                    checked={languagePref === 'en'}
                    onChange={() => setLanguagePref('en')}
                    disabled={isSubmitting}
                    className="w-4 h-4 text-brand-dark-green focus:ring-brand-dark-green cursor-pointer"
                  />
                  <span>{t.prefEnglish}</span>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 bg-brand-maroon hover:bg-red-800 text-white font-serif font-bold text-sm tracking-widest uppercase rounded-lg shadow-md border-2 border-brand-gold/20 hover:border-brand-gold transition flex items-center justify-center space-x-2 cursor-pointer disabled:bg-slate-400 disabled:border-slate-300"
              >
                {isSubmitting ? (
                  <span>{t.enrolling}</span>
                ) : (
                  <span>{t.enrollSubmit}</span>
                )}
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}
