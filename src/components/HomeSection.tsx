/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Eye, ShieldCheck, Scissors, Feather, Sparkles, BookOpen, MapPin, Award } from 'lucide-react';
import { translations } from '../localization';

interface HomeSectionProps {
  currentLang: 'en' | 'pa';
  setView: (view: string) => void;
}

export default function HomeSection({ currentLang, setView }: HomeSectionProps) {
  const t = translations[currentLang];

  const services = [
    {
      titleEn: "Fashion Designing & Drafting",
      titlePa: "ਫੈਸ਼ਨ ਡਿਜ਼ਾਈਨਿੰਗ ਅਤੇ ਡਰਾਫਟਿੰਗ",
      descEn: "Learn accurate measurement calculations, professional graph drafting, and cutting layout guidelines.",
      descPa: "ਕੱਪੜੇ ਦੇ ਮਾਪ ਦਾ ਹਿਸਾਬ, ਗ੍ਰਾਫ ਡਰਾਫਟਿੰਗ ਅਤੇ ਕਟਿੰਗ ਲੇਆਉਟ ਦੀਆਂ ਪੇਸ਼ੇਵਰ ਤਕਨੀਕਾਂ ਸਿੱਖੋ।",
      icon: Scissors
    },
    {
      titleEn: "Custom Boutique Stitching",
      titlePa: "ਬੁਟੀਕ ਸੂਟ ਕਟਾਈ-ਸਿਲਾਈ",
      descEn: "Complete hand-on expertise in stitching standard Punjabi suits, palazzo trousers, frock styles and customized neck patterns.",
      descPa: "ਸਧਾਰਨ ਪੰਜਾਬੀ ਸੂਟ, ਪਲਾਜ਼ੋ, ਫਰਾਕ ਸੂਟ ਅਤੇ ਸਟਾਈਲਿਸ਼ ਗਲੇ ਦੇ ਡਿਜ਼ਾਈਨਾਂ ਦੀ ਮੁਕੰਮਲ ਸਿਲਾਈ।",
      icon: Sparkles
    },
    {
      titleEn: "Hand Embroidery & Phulkari",
      titlePa: "ਹੱਥ ਦੀ ਕਢਾਈ ਅਤੇ ਫੁਲਕਾਰੀ",
      descEn: "Stitch traditional Punjab Phulkari work, cross stitches, chain stitching, thread arts and mirror details.",
      descPa: "ਪਾਰੰਪਰਿਕ ਫੁਲਕਾਰੀ ਡਿਜ਼ਾਈਨ, ਜੰਜੀਰੀ ਕਢਾਈ, ਕ੍ਰਾਸ ਸਟਿੱਚ ਅਤੇ ਸ਼ੀਸ਼ੇ ਦੀ ਜੜਤ ਕਲਾ ਸਿੱਖੋ।",
      icon: Feather
    },
    {
      titleEn: "Fabric Painting & Art",
      titlePa: "ਫੈਬਰਿਕ ਕਲਰ ਪੇਂਟਿੰਗ ਕਲਾ",
      descEn: "Design your custom dupattas, shirts, fabric colors mixing, hand prints, and textile art.",
      descPa: "ਆਪਣੇ ਦੁਪੱਟਿਆਂ ਅਤੇ ਸੂਟਾਂ ਉੱਤੇ ਰੰਗਦਾਰ ਫੈਬਰਿਕ ਪੇਂਟਿੰਗ, ਹੱਥੀਂ ਬਲਾਕ ਪ੍ਰਿੰਟਸ ਅਤੇ ਕਲਾ ਦਾ ਕੰਮ।",
      icon: Eye
    }
  ];

  const handleCTA = () => {
    setView('courses');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="bg-brand-off-white min-h-screen text-slate-800 font-sans">
      
      {/* 1. Hero Section */}
      <section className="relative bg-brand-dark-green text-brand-cream py-20 px-4 overflow-hidden border-b border-brand-secondary-green/30">
        
        {/* Absolute Background Highlights */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f6d8a8_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-brand-secondary-green rounded-full blur-3xl opacity-40"></div>
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-brand-maroon rounded-full blur-3xl opacity-30"></div>

        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Explanatory Information */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Visual Capsule Info */}
            <div className="inline-flex items-center space-x-2 bg-brand-secondary-green/70 text-brand-gold px-3.5 py-1.5 rounded-full border border-brand-gold/25 shadow-sm text-xs font-mono font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{currentLang === 'en' ? "ESTABLISHED VOCATIONAL REPUTE" : "ਮਾਨਤਾ ਪ੍ਰਾਪਤ ਸਿਖਲਾਈ ਕੇਂਦਰ"}</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight tracking-tight">
              {t.heroTitle}
            </h1>
            
            <p className="text-base sm:text-lg text-brand-cream/80 max-w-2xl leading-relaxed">
              {t.heroSubtitle}
            </p>

            <div className="flex flex-col sm:flex-row shadow-sm gap-4 justify-center lg:justify-start pt-2">
              <button
                onClick={handleCTA}
                className="px-8 py-4 bg-brand-maroon hover:bg-red-800 text-white font-semibold rounded-lg shadow-lg border border-brand-gold/40 hover:scale-105 transition duration-150 flex items-center justify-center space-x-2.5 cursor-pointer"
              >
                <BookOpen className="w-5 h-5 text-brand-gold" />
                <span>{t.exploreCourses}</span>
              </button>
              <button
                onClick={() => {
                  setView('contact');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-6 py-4 bg-brand-secondary-green hover:bg-[#1a745c] text-white font-medium rounded-lg shadow border border-brand-gold/10 hover:border-brand-gold/30 transition flex items-center justify-center space-x-2 cursor-pointer"
              >
                <MapPin className="w-4 h-4 text-brand-gold" />
                <span>{t.visitStudioBtn}</span>
              </button>
            </div>

            {/* Quick stats panel */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-brand-secondary-green/30 max-w-lg mx-auto lg:mx-0">
              <div className="text-center lg:text-left">
                <p className="text-xl sm:text-2xl font-serif font-black text-brand-gold">100%</p>
                <p className="text-[10px] sm:text-xs text-brand-cream/60 font-mono uppercase">{currentLang === 'en' ? 'Practical Training' : 'ਪ੍ਰੈਕਟੀਕਲ ਸਿਖਲਾਈ'}</p>
              </div>
              <div className="text-center lg:text-left">
                <p className="text-xl sm:text-2xl font-serif font-black text-brand-gold">3+</p>
                <p className="text-[10px] sm:text-xs text-brand-cream/60 font-mono uppercase">{currentLang === 'en' ? 'Syllabus Sectors' : 'ਵੱਖ-ਵੱਖ ਕੋਰਸ'}</p>
              </div>
              <div className="text-center lg:text-left">
                <p className="text-xl sm:text-2xl font-serif font-black text-brand-gold">Bilingual</p>
                <p className="text-[10px] sm:text-xs text-brand-cream/60 font-mono uppercase">{currentLang === 'en' ? 'EN / ਪੰਜਾਬੀ' : 'ਅੰਗਰੇਜ਼ੀ / ਪੰਜਾਬੀ'}</p>
              </div>
            </div>

          </div>

          {/* Hero Interactive Image Container */}
          <div className="lg:col-span-5 relative">
            <div className="aspect-square bg-brand-secondary-green/50 border border-brand-gold/20 rounded-2xl shadow-2xl p-4 overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
              
              {/* Unsplash image representing boutique tailor threads and materials */}
              <img
                src="https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=600&auto=format&fit=crop"
                alt="Sewing materials"
                className="w-full h-full object-cover rounded-xl select-none scale-105 group-hover:scale-110 transition duration-500"
                referrerPolicy="no-referrer"
              />

              {/* Float badge */}
              <div className="absolute bottom-6 left-6 right-6 z-20 text-brand-cream">
                <p className="font-serif text-lg font-bold shadow-sm leading-tight">
                  {currentLang === 'en' ? "Komal Creations & Training Center" : "ਕੋਮਲ ਕ੍ਰਿਏਸ਼ਨਜ਼ ਐਂਡ ਟ੍ਰੇਨਿੰਗ ਸੈਂਟਰ"}
                </p>
                <p className="text-xs text-brand-gold font-mono font-medium shadow-sm mt-1">
                  Nabha, Patiala, Punjab
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. Services Overview Grid */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="font-serif text-2xl sm:text-3.5xl font-bold tracking-tight text-brand-dark-green uppercase">
            {currentLang === 'en' ? "Our Tailoring & Vocational Services" : "ਸਾਡੀਆਂ ਮੁੱਖ ਸੁਵਿਧਾਵਾਂ ਅਤੇ ਸੇਵਾਵਾਂ"}
          </h2>
          <div className="w-16 h-1 bg-brand-maroon mx-auto rounded"></div>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            {currentLang === 'en'
              ? "We provide high-class standard outfit design services alongside structural daily coaching to empower independent local women tailors in Nabha."
              : "ਅਸੀਂ ਨਾਭਾ ਵਿੱਚ ਲੇਡੀਜ਼ ਕਪੜਿਆਂ ਦੀ ਬਿਹਤਰੀਨ ਸਿਲਾਈ ਅਤੇ ਡਿਜ਼ਾਈਨਿੰਗ ਸੇਵਾਵਾਂ ਦੇ ਨਾਲ-ਨਾਲ ਮਹਿਲਾਵਾਂ ਨੂੰ ਆਤਮ-ਨਿਰਭਰ ਬਣਾਉਣ ਲਈ ਰੋਜ਼ਾਨਾ ਪ੍ਰੈਕਟੀਕਲ ਟ੍ਰੇਨਿੰਗ ਪ੍ਰਦਾਨ ਕਰਦੇ ਹਾਂ।"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((serv, idx) => {
            const IconComponent = serv.icon;
            return (
              <div
                key={idx}
                className="bg-white border border-[#eae6db] rounded-xl p-6 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between group hover:border-brand-secondary-green/30"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-lg bg-brand-cream flex items-center justify-center text-brand-dark-green group-hover:bg-brand-secondary-green group-hover:text-white transition duration-200 shadow-inner">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-brand-dark-green group-hover:text-brand-secondary-green transition duration-150">
                      {currentLang === 'en' ? serv.titleEn : serv.titlePa}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed mt-2">
                      {currentLang === 'en' ? serv.descEn : serv.descPa}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. About Section (Bilingual visual presentation) */}
      <section className="py-16 bg-[#f4ebd9]/30 border-y border-[#16614d]/10 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-5 relative">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-xl border border-brand-gold/40">
              <img
                src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=600&auto=format&fit=crop"
                alt="Tailor workshop"
                className="w-full h-full object-cover select-none"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 bg-brand-maroon text-brand-cream p-4 rounded-xl shadow-lg max-w-sm hidden sm:block border-2 border-brand-gold/30">
              <p className="font-serif text-sm font-bold text-brand-gold">Komalpreet Kaur</p>
              <p className="text-[10px] font-mono opacity-85 mt-0.5">{currentLang === 'en' ? 'Head Fashion Designer & Senior Coach' : 'ਮੁੱਖ ਡਿਜ਼ਾਈਨਰ ਅਤੇ ਕੋਚ'}</p>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <h2 className="font-serif text-2xl sm:text-3.5xl font-bold tracking-tight text-brand-dark-green">
              {t.aboutTitle}
            </h2>
            <div className="w-12 h-1 bg-brand-maroon rounded"></div>
            
            <p className="text-sm font-sans text-slate-600 leading-relaxed">
              {t.aboutText1}
            </p>
            <p className="text-sm font-sans text-slate-600 leading-relaxed">
              {t.aboutText2}
            </p>

            {/* Special highlight box */}
            <div className="p-4 bg-brand-cream border-l-4 border-brand-maroon rounded-r-lg font-serif italic text-sm text-brand-dark-green font-medium">
              {currentLang === 'en'
                ? `"Every stitch you draft tells an artistic story. Our mission is to transform your creative stitching passions into professional financial careers."`
                : `"ਤੁਹਾਡੇ ਹੱਥ ਦੀ ਹਰ ਕਢਾਈ ਅਤੇ ਸਿਲਾਈ ਇੱਕ ਕਲਾ ਹੈ। ਸਾਡਾ ਨਿਸ਼ਾਨਾ ਤੁਹਾਡੀ ਸਿਲਾਈ ਦੇ ਇਸ ਜਜ਼ਬੇ ਨੂੰ ਇੱਕ ਪੇਸ਼ੇਵਰ ਕਾਰੋਬਾਰ 'ਚ ਤਬਦੀਲ ਕਰਨਾ ਹੈ।"`}
            </div>
          </div>

        </div>
      </section>

      {/* 4. Why Choose Us Sections */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-brand-dark-green">
            {t.whyChooseUs}
          </h2>
          <div className="w-16 h-0.5 bg-brand-gold mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          
          <div className="bg-white p-6 rounded-xl border border-brand-cream shadow-sm flex items-start space-x-4">
            <div className="p-3 rounded-lg bg-green-50 text-[#16614d] flex-shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-brand-dark-green">{t.why1Title}</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{t.why1Desc}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-brand-cream shadow-sm flex items-start space-x-4">
            <div className="p-3 rounded-lg bg-green-50 text-[#16614d] flex-shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-brand-dark-green">{t.why2Title}</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{t.why2Desc}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-brand-cream shadow-sm flex items-start space-x-4">
            <div className="p-3 rounded-lg bg-green-50 text-[#16614d] flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-brand-dark-green">{t.why3Title}</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{t.why3Desc}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-brand-cream shadow-sm flex items-start space-x-4">
            <div className="p-3 rounded-lg bg-green-50 text-[#16614d] flex-shrink-0">
              <Scissors className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-brand-dark-green">{t.why4Title}</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{t.why4Desc}</p>
            </div>
          </div>

        </div>
      </section>

      {/* 5. Call To Action Panel */}
      <section className="bg-brand-dark-green text-brand-cream py-16 px-4 text-center relative overflow-hidden border-t-2 border-brand-gold/25">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff4df_1px,transparent_1px)] [background-size:20px_20px]"></div>
        <div className="max-w-4xl mx-auto relative z-10 space-y-6">
          <h2 className="font-serif text-2xl sm:text-3.5xl font-extrabold tracking-tight text-white leading-tight">
            {currentLang === 'en'
              ? "Ready to Launch Your Career in Dress Designing?"
              : "ਕੀ ਤੁਸੀਂ ਡਰੈੱਸ ਡਿਜ਼ਾਈਨਿੰਗ 'ਚ ਆਪਣਾ ਸੁਨਹਿਰੀ ਕਰੀਅਰ ਸ਼ੁਰੂ ਕਰਨ ਲਈ ਤਿਆਰ ਹੋ?"}
          </h2>
          <p className="text-sm text-brand-cream/80 max-w-2xl mx-auto leading-relaxed">
            {currentLang === 'en'
              ? "Batch admissions are now open at Aloharan Khurd Nabha. Register online below to receive discount updates, schedule lists, and enroll with a demo class."
              : "ਆਲੋਹਰਾਂ ਖੁਰਦ ਨਾਭਾ ਵਿਖੇ ਨਵੇਂ ਬੈਚਾਂ ਦੇ ਦਾਖਲੇ ਸ਼ੁਰੂ ਹਨ। ਫ਼ੀਸ ਡਿਸਕਾਊਂਟ ਅਤੇ ਜਲਦ ਡੈਮੋ ਕਲਾਸ ਲਈ ਅੱਜ ਹੀ ਆਨਲਾਈਨ ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਫਾਰਮ ਜਮ੍ਹਾਂ ਕਰੋ।"}
          </p>
          <div className="pt-2">
            <button
              onClick={handleCTA}
              className="px-8 py-4 bg-brand-maroon hover:bg-red-800 text-white font-bold rounded-lg border-2 border-brand-gold text-sm tracking-wider uppercase shadow-xl hover:scale-105 transition cursor-pointer"
            >
              {currentLang === 'en' ? "Fill Online Admission Form" : "ਆਨਲਾਈਨ ਦਾਖਲਾ ਫਾਰਮ ਭਰੋ"}
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
