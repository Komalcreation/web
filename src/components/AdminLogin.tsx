/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Lock, ShieldAlert, AlertCircle, RefreshCw } from 'lucide-react';
import { translations } from '../localization';

interface AdminLoginProps {
  currentLang: 'en' | 'pa';
  onLoginSuccess: (token: string) => void;
  setView: (view: string) => void;
}

export default function AdminLogin({ currentLang, onLoginSuccess, setView }: AdminLoginProps) {
  const t = translations[currentLang];

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!username.trim() || !password.trim()) {
      setErrorMsg(t.loginError);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        onLoginSuccess(data.token);
        // Clean fields
        setUsername('');
        setPassword('');
        // Navigate
        setView('admin-dashboard');
      } else {
        setErrorMsg(data.error || t.loginError);
      }
    } catch {
      setErrorMsg(currentLang === 'en' 
        ? "Network error. Failed to initiate administration check." 
        : "ਨੈੱਟਵਰਕ ਗਲਤੀ। ਐਡਮਿਨ ਪ੍ਰਮਾਣੀਕਰਨ ਸ਼ੁਰੂ ਕਰਨ ਵਿੱਚ ਅਸਫਲ।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-brand-off-white min-h-[calc(100vh-200px)] py-16 px-4 flex items-center justify-center font-sans">
      <div className="max-w-md w-full bg-white rounded-2xl border border-brand-cream/50 shadow-xl overflow-hidden">
        
        {/* Banner */}
        <div className="bg-brand-dark-green text-brand-cream p-8 text-center relative border-b border-brand-secondary-green/30">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff4df_1px,transparent_1px)] [background-size:12px_12px]"></div>
          <div className="w-12 h-12 rounded-full bg-brand-maroon mx-auto flex items-center justify-center border border-brand-gold/30 mb-3 shadow z-10 relative">
            <Lock className="w-5 h-5 text-brand-gold" />
          </div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-white relative z-10 leading-tight">
            {t.adminLoginTitle}
          </h2>
          <p className="text-[11px] text-brand-cream/70 mt-1 relative z-10">
            {t.adminLoginSub}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="p-8 space-y-6">
          
          {/* Error Banner */}
          {errorMsg && (
            <div className="p-4 bg-red-50 text-red-800 border-l-4 border-red-600 rounded flex items-start space-x-2.5 text-xs animate-shake">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <span className="font-medium leading-relaxed">{errorMsg}</span>
            </div>
          )}

          {/* Username */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
              {t.username}
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. admin"
              disabled={loading}
              className="w-full px-4 py-2.5 max-w-full rounded-md border border-slate-300 text-sm focus:outline-none focus:border-brand-secondary-green"
              autoComplete="username"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
              {t.password}
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              className="w-full px-4 py-2.5 max-w-full rounded-md border border-slate-300 text-sm focus:outline-none focus:border-brand-secondary-green"
              autoComplete="current-password"
            />
          </div>

          {/* Security details advice */}
          <div className="p-3 bg-brand-cream/60 rounded border border-brand-gold/15 flex items-start space-x-2">
            <ShieldAlert className="w-4 h-4 text-brand-maroon flex-shrink-0 mt-0.5" />
            <p className="text-[10px] text-brand-dark-green leading-relaxed">
              {currentLang === 'en'
                ? "Notice: By default, the testing credentials for preview check are: Username: admin / Password: admin"
                : "ਨੋਟਿਸ: ਡਿਫਾਲਟ ਰੂਪ 'ਚ, ਪ੍ਰੀਵਿਊ ਚੈੱਕ ਕਰਨ ਲਈ ਲੌਗਇਨ ਵੇਰਵੇ ਹਨ: ਯੂਜ਼ਰਨਾਮ: admin / ਪਾਸਵਰਡ: admin"}
            </p>
          </div>

          {/* Submit */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-brand-maroon hover:bg-red-800 text-white font-serif font-bold text-sm tracking-wider uppercase rounded-lg shadow-md border border-brand-gold/25 transition flex items-center justify-center space-x-2.5 cursor-pointer disabled:bg-slate-400 disabled:border-slate-300"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 text-brand-gold animate-spin" />
                  <span>{t.loggingIn}</span>
                </>
              ) : (
                <span>{t.loginSubmit}</span>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
