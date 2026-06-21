/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Eye, Image as ImageIcon, X } from 'lucide-react';
import { translations } from '../localization';
import { GalleryItem } from '../types';

interface GallerySectionProps {
  currentLang: 'en' | 'pa';
}

export default function GallerySection({ currentLang }: GallerySectionProps) {
  const t = translations[currentLang];
  
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  // Fallback image collection if API fails
  const fallbackGallery: GalleryItem[] = [
    {
      id: "g1",
      title_en: "Embroidered Dupatta Detail",
      title_pa: "ਕਢਾਈ ਵਾਲਾ ਦੁਪੱਟਾ ਡਿਜ਼ਾਈਨ",
      image_url: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop",
      created_at: ""
    },
    {
      id: "g2",
      title_en: "Precision Fabric Cutting & Layout",
      title_pa: "ਕੱਪੜੇ ਦੀ ਗੁਣਵੱਤਾ ਭਰਪੂਰ ਕਟਾਈ",
      image_url: "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=600&auto=format&fit=crop",
      created_at: ""
    },
    {
      id: "g3",
      title_en: "Handwork & Embroidery Student Practice",
      title_pa: "ਹੱਥ ਦੀ ਸੁਈ-ਕਢਾਈ ਦਾ ਅਭਿਆਸ",
      image_url: "https://images.unsplash.com/photo-1572947650440-e8a97ef053b2?q=80&w=600&auto=format&fit=crop",
      created_at: ""
    },
    {
      id: "g4",
      title_en: "Designer Lehenga Fittings",
      title_pa: "ਡਿਜ਼ਾਈਨਰ ਲਹਿੰਗਾ ਫਿਟਿੰਗ ਕਲਾਸ",
      image_url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop",
      created_at: ""
    },
    {
      id: "g5",
      title_en: "Traditional Punjabi Suit Pleating",
      title_pa: "ਪਾਰੰਪਰਿਕ ਪੰਜਾਬੀ ਸੂਟ ਪਲੇਟਸ",
      image_url: "https://images.unsplash.com/photo-1608748323409-39f850d512a8?q=80&w=600&auto=format&fit=crop",
      created_at: ""
    },
    {
      id: "g6",
      title_en: "Sewing Station & Pattern Drafting",
      title_pa: "ਸਿਲਾਈ ਮਸ਼ੀਨ ਅਤੇ ਡਰਾਫਟਿੰਗ ਟੇਬਲ",
      image_url: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=600&auto=format&fit=crop",
      created_at: ""
    }
  ];

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/public/gallery');
      if (res.ok) {
        const data = await res.json();
        setGallery(data);
      } else {
        setGallery(fallbackGallery);
      }
    } catch {
      setGallery(fallbackGallery);
    } finally {
      setLoading(false);
    }
  };

  const activeGallery = gallery.length > 0 ? gallery : fallbackGallery;

  return (
    <div className="bg-brand-off-white py-16 px-4 sm:px-6 lg:px-8 font-sans min-h-screen">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header Title */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h1 className="font-serif text-3xl sm:text-4.5xl font-black text-brand-dark-green tracking-tight flex items-center justify-center space-x-3">
            <ImageIcon className="w-8 h-8 text-brand-gold" />
            <span>{t.galleryPageTitle}</span>
          </h1>
          <div className="w-20 h-1 bg-brand-maroon mx-auto rounded"></div>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            {t.galleryPageSub}
          </p>
        </div>

        {/* Gallery Dynamic Masonry / Grid */}
        {loading ? (
          <div className="text-center py-20 text-xs font-mono text-[#16614d]">
            <span className="inline-block animate-spin mr-2">⚙</span>
            {t.loading}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {activeGallery.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="bg-white border border-[#eae6db] rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:scale-[1.02] transition duration-200 cursor-pointer group"
              >
                {/* Crop container */}
                <div className="aspect-[4/3] bg-brand-cream/40 overflow-hidden relative">
                  <img
                    src={item.image_url}
                    alt={item.title_en}
                    className="w-full h-full object-cover select-none filter group-hover:brightness-95 transition"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      // Fallback image placeholder in case of URL breaks
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=600&auto=format&fit=crop';
                    }}
                  />
                  
                  {/* Floating cover indicator */}
                  <div className="absolute inset-0 bg-brand-dark-green/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition duration-200">
                    <div className="w-11 h-11 bg-white/95 rounded-full flex items-center justify-center shadow text-brand-dark-green">
                      <Eye className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                {/* Sub titles */}
                <div className="p-5 border-t border-slate-100 bg-white">
                  <h3 className="font-serif text-sm font-bold text-brand-dark-green truncate leading-snug">
                    {currentLang === 'en' ? item.title_en : item.title_pa}
                  </h3>
                  <p className="text-[10px] text-brand-secondary-green font-semibold uppercase tracking-widest font-mono mt-1">
                    {currentLang === 'en' ? "Komal Creations Portfolio" : "ਕੋਮਲ ਕ੍ਰਿਏਸ਼ਨਜ਼ ਗੈਲਰੀ"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty status */}
        {!loading && activeGallery.length === 0 && (
          <div className="text-center py-20 bg-white border border-[#eae6db] rounded-2xl">
            <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-xs font-mono text-slate-500">{t.noData}</p>
          </div>
        )}

        {/* Zoom Lightbox Modal */}
        {selectedItem && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl overflow-hidden shadow-2xl max-w-3xl w-full border border-white/10 relative animate-scaleUp">
              
              {/* Close Button */}
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 z-50 p-2 bg-black/60 text-white hover:bg-black rounded-full shadow-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Main Image */}
              <div className="bg-slate-900 aspect-video max-h-[70vh] relative">
                <img
                  src={selectedItem.image_url}
                  alt={selectedItem.title_en}
                  className="w-full h-full object-contain mx-auto"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Detail info box */}
              <div className="p-6 bg-brand-dark-green text-brand-cream flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-brand-secondary-green">
                <div>
                  <h4 className="font-serif text-base sm:text-lg font-bold text-white leading-snug">
                    {currentLang === 'en' ? selectedItem.title_en : selectedItem.title_pa}
                  </h4>
                  <p className="text-[10px] sm:text-xs text-brand-gold font-mono tracking-wider mt-0.5 font-semibold">
                    {currentLang === 'en' ? "ORIGINAL BESPOKE WORK DECORATION" : "ਵਿਦਿਆਰਥੀਆਂ ਦੁਆਰਾ ਤਿਆਰ ਕਢਾਈ ਅਤੇ ਡਿਜ਼ਾਈਨ"}
                  </p>
                </div>
                <div>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="px-4 py-1.5 bg-brand-maroon hover:bg-red-800 text-white rounded text-xs font-semibold uppercase tracking-wider transition cursor-pointer border border-brand-gold/25"
                  >
                    {t.closeModal}
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
