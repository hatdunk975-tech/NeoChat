import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Lock, User as UserIcon } from 'lucide-react';

interface LoginProps {
  onLogin: (user: any) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        onLogin(data.user);
      } else {
        setError('Invalid credentials');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-cyber-bg overflow-hidden relative">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-blue/10 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-purple/10 rounded-full blur-[100px] animate-pulse delay-700" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 bg-cyber-card/80 backdrop-blur-xl border border-cyber-border rounded-2xl shadow-2xl relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-neon-blue/10 rounded-2xl flex items-center justify-center mb-4 border border-neon-blue/30 neon-glow">
            <Shield className="text-neon-blue" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight">NEON_CHAT</h1>
          <p className="text-slate-500 text-sm mt-2">KIRISH_PROTOKOLI: XAVFSIZ_KANAL</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Foydalanuvchi nomi</label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-3 text-slate-500" size={18} />
              <input 
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-cyber-bg/50 border border-cyber-border rounded-lg py-2.5 pl-10 pr-4 text-slate-200 focus:outline-none focus:border-neon-blue transition-colors placeholder-slate-600"
                placeholder="Taxallusingizni kiriting"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Kirish kaliti</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-500" size={18} />
              <input 
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-cyber-bg/50 border border-cyber-border rounded-lg py-2.5 pl-10 pr-4 text-slate-200 focus:outline-none focus:border-neon-blue transition-colors placeholder-slate-600"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && <div className="text-red-500 text-xs font-bold text-center animate-shake">Ma'lumotlar noto'g'ri</div>}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-neon-blue hover:bg-neon-blue/80 text-cyber-bg font-bold py-3 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(0,243,255,0.3)]"
          >
            {loading ? 'AVTORIZATSIYA...' : 'ALOQA_O\'RNATISH'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-cyber-border/50 text-center">
          <p className="text-slate-500 text-xs">
            RUXSATSIZ KIRISH TAQIQLANADI. <br/>
            BARCHA MA'LUMOTLAR SHIFRLANGAN.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
