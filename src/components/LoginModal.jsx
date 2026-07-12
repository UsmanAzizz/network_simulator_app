'use client';

import { useState } from 'react';
import useAuthStore from '@/store/useAuthStore';
import { X, KeyRound } from 'lucide-react';

export default function LoginModal({ isOpen, onClose }) {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  const login = useAuthStore((state) => state.login);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const success = login(key);
    if (success) {
      setError('');
      setKey('');
      onClose();
    } else {
      setError('Kode akses salah.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
        <div className="flex justify-between items-center px-4 py-3 border-b">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <KeyRound size={18} className="text-slate-600" />
            Akses Guru
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          <p className="text-sm text-slate-600 mb-4">
            Masukkan Static Key untuk masuk ke mode Live Broadcast.
          </p>
          
          <input
            type="password"
            placeholder="Static Key (787898)"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800 mb-2"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            autoFocus
          />
          
          {error && <p className="text-xs text-red-500 mb-3">{error}</p>}
          
          <button
            type="submit"
            className="w-full bg-slate-800 text-white font-medium py-2 rounded-lg hover:bg-slate-700 transition-colors"
          >
            Masuk
          </button>
        </form>
      </div>
    </div>
  );
}
