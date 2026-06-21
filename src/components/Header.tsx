/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Menu, X, Globe, Lock, ShieldCheck, Award } from 'lucide-react';
import { translations } from '../localization';

interface HeaderProps {
  currentLang: 'en' | 'pa';
  setLang: (lang: 'en' | 'pa') => void;
  activeView: string;
  setView: (view: string) => void;
  isAdminLoggedIn: boolean;
  onLogout: () => void;
}

export default function Header({
  currentLang,
  setLang,
  activeView,
  setView,
  isAdminLoggedIn,
  onLogout
}: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const t = translations[currentLang];

  const menuItems = [
    { id: 'home', label: t.home },
    { id: 'courses', label: t.courses },
    { id: 'gallery', label: t.gallery },
    { id: 'contact', label: t.contact },
    { id: 'verify-certificate', label: t.verifyCert, icon: Award }
  ];

  const handleNav = (viewId: string) => {
    setView(viewId);
    setIsOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleLanguage = () => {
    const next = currentLang === 'en' ? 'pa' : 'en';
    setLang(next);
  };

  return (
    <header className="sticky top-0 z-50 bg-brand-dark-green text-brand-cream border-b border-[#16614d] shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Brand Name */}
          <div className="flex-shrink-0 cursor-pointer flex items-center space-x-3" onClick={() => handleNav('home')}>
            <div className="w-11 h-11 bg-brand-maroon border-2 border-brand-gold rounded-full flex items-center justify-center shadow-lg">
              <span className="font-serif text-xl font-bold text-brand-cream tracking-tight">K</span>
            </div>
            <div>
              <h1 className="font-serif text-lg sm:text-xl font-bold tracking-tight text-white leading-tight">
                Komal Creations
              </h1>
              <p className="text-[10px] text-brand-gold tracking-widest uppercase font-mono font-semibold">
                &amp; Training Center
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1 lg:space-x-4 items-center">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`px-3 py-2 rounded-md font-sans text-sm font-medium transition duration-150 flex items-center space-x-1.5 ${
                    activeView === item.id
                      ? 'bg-brand-secondary-green text-white font-semibold border border-brand-gold/30'
                      : 'text-brand-cream/80 hover:text-white hover:bg-brand-secondary-green/50'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4 text-brand-gold" />}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Controls */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Language Switch */}
            <button
              onClick={toggleLanguage}
              className="px-4 py-1.5 bg-brand-secondary-green/80 hover:bg-brand-secondary-green text-brand-cream border border-brand-gold/30 rounded-md text-xs font-mono font-medium flex items-center space-x-2 transition duration-150 shadow-sm hover:border-brand-gold cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-brand-gold animate-pulse" />
              <span>{t.toggleLang}</span>
            </button>

            {/* Admin Control */}
            {isAdminLoggedIn ? (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleNav('admin-dashboard')}
                  className={`px-3.5 py-1.5 rounded-md text-xs font-mono font-semibold transition border ${
                    activeView === 'admin-dashboard'
                      ? 'bg-brand-maroon border-brand-gold text-white'
                      : 'bg-brand-secondary-green/50 border-brand-gold/20 text-brand-gold hover:bg-brand-secondary-green'
                  } flex items-center space-x-1.5 cursor-pointer`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Dashboard</span>
                </button>
                <button
                  onClick={onLogout}
                  className="px-3 py-1.5 text-xs text-red-100 hover:text-white bg-red-900/30 hover:bg-red-900/60 border border-red-700/30 hover:border-red-600 rounded-md transition cursor-pointer"
                >
                  {t.logout}
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleNav('admin-login')}
                className={`py-1.5 px-3 rounded-md text-xs font-mono border transition flex items-center space-x-1.5 cursor-pointer ${
                  activeView === 'admin-login'
                    ? 'bg-brand-secondary-green text-white border-brand-gold'
                    : 'bg-[#0b3c2e] hover:bg-brand-secondary-green border-brand-gold/20 text-brand-gold hover:text-white'
                }`}
              >
                <Lock className="w-3 h-3" />
                <span>Admin</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={toggleLanguage}
              className="p-1 px-2.5 bg-brand-secondary-green/80 text-brand-cream border border-brand-gold/30 rounded text-[11px] font-mono flex items-center space-x-1 cursor-pointer"
            >
              <Globe className="w-3 h-3 text-brand-gold" />
              <span>{currentLang === 'en' ? 'PA' : 'EN'}</span>
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-brand-cream hover:text-white hover:bg-brand-secondary-green rounded-md focus:outline-none"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu dropdown */}
      {isOpen && (
        <div className="md:hidden bg-[#0a352a] px-2 pt-2 pb-4 space-y-1 sm:px-3 border-t border-[#12503f] animate-fadeIn">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`block w-full text-left px-3 py-3 rounded-md text-base font-medium font-sans ${
                activeView === item.id
                  ? 'bg-brand-secondary-green text-white border-l-4 border-brand-gold'
                  : 'text-brand-cream/80 hover:bg-brand-secondary-green/30 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-2">
                {item.icon && <item.icon className="w-4 h-4 text-brand-gold" />}
                <span>{item.label}</span>
              </div>
            </button>
          ))}
          
          <div className="pt-4 pb-2 border-t border-brand-secondary-green/50">
            {isAdminLoggedIn ? (
              <div className="space-y-2 px-3">
                <button
                  onClick={() => handleNav('admin-dashboard')}
                  className="w-full py-2.5 px-4 rounded-md text-center text-sm font-mono font-semibold bg-brand-maroon border border-brand-gold text-white flex items-center justify-center space-x-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Admin Dashboard</span>
                </button>
                <button
                  onClick={() => {
                    onLogout();
                    setIsOpen(false);
                  }}
                  className="w-full py-2.5 px-4 rounded-md text-center text-sm font-mono text-red-100 bg-red-900/40 hover:bg-red-800 border border-red-700/40"
                >
                  {t.logout}
                </button>
              </div>
            ) : (
              <div className="px-3">
                <button
                  onClick={() => handleNav('admin-login')}
                  className="w-full py-2.5 px-4 rounded-md text-center text-sm font-mono bg-brand-secondary-green border border-brand-gold/30 text-brand-gold hover:text-white flex items-center justify-center space-x-2"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Admin Login</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
