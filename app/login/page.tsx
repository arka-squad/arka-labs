'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Trace-Id': crypto.randomUUID(),
        credentials: 'include'},
        body: JSON.stringify({ email, password })});

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          setError(data.message || 'Trop de tentatives. Veuillez réessayer plus tard.');
        } else if (response.status === 401) {
          setError('Email ou mot de passe incorrect');
        } else {
          setError(data.message || 'Une erreur est survenue');
        }
        return;
      }

      // Stocker le token dans localStorage si "Se souvenir de moi" est coché
      if (rememberMe && data.token) {
        localStorage.setItem('arka_token', data.token);
        if (data.refresh_token) {
          localStorage.setItem('arka_refresh_token', data.refresh_token);
        }
      }

      // Stocker les informations utilisateur
      if (data.user) {
        localStorage.setItem('arka_user', JSON.stringify(data.user));
      }

      // Rediriger vers le cockpit
      router.push('/cockpit');
    } catch (err) {
      console.error('Login error:', err);
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  // Pré-remplir avec des credentials de démo pour faciliter les tests
  const fillDemoCredentials = (role: string) => {
    const credentials = {
      admin: { email: 'admin@arka.com', password: 'demo123' },
      manager: { email: 'manager@arka.com', password: 'demo123' },
      operator: { email: 'operator@arka.com', password: 'demo123' },
      viewer: { email: 'viewer@arka.com', password: 'demo123' }
    };

    const creds = credentials[role as keyof typeof credentials];
    if (creds) {
      setEmail(creds.email);
      setPassword(creds.password);
      setError('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F1621] via-[#1A2332] to-[#0F1621] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo et titre */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-xl mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Arka Console</h1>
          <p className="text-slate-400">Connectez-vous à votre espace</p>
        </div>

        {/* Formulaire */}
        <div className="bg-[#1A2332] rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Message d'erreur */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span className="text-red-400 text-sm">{error}</span>
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#0F1621] border border-[#2A3441] rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors"
                  placeholder="vous@exemple.com"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-[#0F1621] border border-[#2A3441] rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Options */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 bg-[#0F1621] border-[#2A3441] rounded text-blue-600 focus:ring-blue-500"
                  disabled={loading}
                />
                <span className="text-sm text-slate-400">Se souvenir de moi</span>
              </label>

              <button
                type="button"
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                disabled={loading}
              >
                Mot de passe oublié ?
              </button>
            </div>

            {/* Bouton de connexion */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Connexion...
                </>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>

          {/* Séparateur */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#2A3441]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[#1A2332] text-slate-500">Comptes de démonstration</span>
            </div>
          </div>

          {/* Boutons de démo */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => fillDemoCredentials('admin')}
              className="px-3 py-2 bg-[#0F1621] hover:bg-[#2A3441] border border-[#2A3441] text-slate-300 text-sm rounded-lg transition-colors"
              disabled={loading}
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => fillDemoCredentials('manager')}
              className="px-3 py-2 bg-[#0F1621] hover:bg-[#2A3441] border border-[#2A3441] text-slate-300 text-sm rounded-lg transition-colors"
              disabled={loading}
            >
              Manager
            </button>
            <button
              type="button"
              onClick={() => fillDemoCredentials('operator')}
              className="px-3 py-2 bg-[#0F1621] hover:bg-[#2A3441] border border-[#2A3441] text-slate-300 text-sm rounded-lg transition-colors"
              disabled={loading}
            >
              Operator
            </button>
            <button
              type="button"
              onClick={() => fillDemoCredentials('viewer')}
              className="px-3 py-2 bg-[#0F1621] hover:bg-[#2A3441] border border-[#2A3441] text-slate-300 text-sm rounded-lg transition-colors"
              disabled={loading}
            >
              Viewer
            </button>
          </div>

          <p className="text-xs text-slate-500 text-center mt-4">
            Mot de passe pour tous : <code className="text-slate-400">demo123</code>
          </p>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-slate-500">
            © 2025 Arka Labs. Tous droits réservés.
          </p>
        </div>
      </div>
    </div>
  );
}