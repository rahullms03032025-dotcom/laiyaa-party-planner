import React, { useState } from 'react';
import { User as UserIcon, Lock, Shield, CheckCircle2, Users } from 'lucide-react';
import type { User, UserRole } from '../types/party.ts';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  allUsers: User[];
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  allUsers,
}) => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('member');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const body = isRegister
        ? { username, name, password, phone, role }
        : { username, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication fail ho gaya!');
      }

      onLoginSuccess(data.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Kuch gadbad ho gayi!');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (uname: string, pass: string) => {
    setUsername(uname);
    setPassword(pass);
    setIsRegister(false);
  };

  const SEVEN_MEMBERS = [
    { username: 'rahul', name: 'Rahul Ranjan (Admin)', role: 'admin', pass: 'admin123' },
    { username: 'ankur', name: 'Ankur', role: 'member', pass: 'ankur123' },
    { username: 'yash', name: 'Yash', role: 'member', pass: 'yash123' },
    { username: 'nityanand', name: 'Nityanand', role: 'member', pass: 'nityanand123' },
    { username: 'ankita', name: 'Ankita', role: 'member', pass: 'ankita123' },
    { username: 'priyanka', name: 'Priyanka', role: 'member', pass: 'priyanka123' },
    { username: 'himani', name: 'Himani', role: 'member', pass: 'himani123' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div>
            <h3 className="text-lg font-bold text-stone-900">
              {isRegister ? 'Naya Khiladi Register Karo' : 'Khiladi Pehchaan & Entry (Login)'}
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              LMS Certifications Ki 7-Member Asli Mandali
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 text-sm p-1"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mt-3 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Aapka Pura Naam *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Yash, Ankur, Himani"
                className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:border-amber-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              User Name (Pehchaan) *
            </label>
            <div className="relative">
              <UserIcon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="rahul, ankur, yash, nityanand, ankita, priyanka, himani"
                className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Password *
            </label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Phone Number (WhatsApp Updates)
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:border-amber-500"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 mt-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg transition-colors shadow-sm"
          >
            {loading
              ? 'Checking...'
              : isRegister
              ? 'Account Banao & Join Karo'
              : 'Entry Maro (Log In)'}
          </button>
        </form>

        <div className="mt-3 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
            className="text-xs text-amber-800 hover:underline font-medium"
          >
            {isRegister
              ? 'Already account hai? Yahan se Log In karo'
              : 'Naye ho? Naya account register karo'}
          </button>
        </div>

        {/* 1-Click Fast Logins for the 7 Official Members */}
        <div className="mt-5 pt-4 border-t border-stone-100">
          <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>7 Asli Khiladi (Instant 1-Click Select):</span>
            <span className="text-[10px] text-amber-700 font-normal">LMS Certifications</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {SEVEN_MEMBERS.map((m) => (
              <button
                key={m.username}
                type="button"
                onClick={() => handleQuickLogin(m.username, m.pass)}
                className={`p-2 text-left rounded-lg border transition-all ${
                  m.role === 'admin'
                    ? 'bg-amber-50/80 border-amber-300 hover:bg-amber-100'
                    : 'bg-stone-50 hover:bg-amber-50/50 border-stone-200'
                }`}
              >
                <div className="text-xs font-bold text-stone-900 truncate flex items-center gap-1">
                  {m.role === 'admin' && <Shield className="w-3 h-3 text-amber-600 shrink-0" />}
                  <span className="truncate">{m.name}</span>
                </div>
                <div className="text-[10px] text-stone-500 font-mono">@{m.username}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
