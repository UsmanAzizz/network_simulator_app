'use client';

import { useState, useEffect } from 'react';
import useAuthStore from '@/store/useAuthStore';
import { Network, LogOut, LogIn, Users, MonitorPlay, RefreshCw, Play, Bot } from 'lucide-react';
import LoginModal from './LoginModal';
import useNetworkStore from '@/store/useNetworkStore';

export default function Header() {
  const { isTeacher, logout } = useAuthStore();
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { layoutMode, toggleLayoutMode, currentIssues, setAiMessage, setIsAiLoading, isAiLoading } = useNetworkStore();

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleTestNetwork = () => {
    if (currentIssues.length === 0) {
      setAiMessage("Wah, jaringanmu sudah sempurna! Tidak ada masalah yang terdeteksi. ✅");
    } else {
      setAiMessage(`Terdapat ${currentIssues.length} masalah di jaringan. Klik 'Tanya AI' untuk solusi.`);
    }
  };

  const handleAskAI = async () => {
    if (currentIssues.length === 0) {
      setAiMessage("Wah, jaringanmu sudah sempurna! Tidak ada masalah yang terdeteksi. ✅");
      return;
    }
    
    setIsAiLoading(true);
    setAiMessage('');
    
    try {
      const response = await fetch('/api/grader', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issues: currentIssues })
      });
      
      const data = await response.json();
      setAiMessage(data.hint || "Terjadi kesalahan saat memanggil AI.");
    } catch (e) {
      setAiMessage("Gagal terhubung ke AI Guru. Pastikan koneksi internet aktif.");
    } finally {
      setIsAiLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <>
      <header className="w-full bg-white border-b px-4 py-3 flex items-center justify-between shadow-sm z-20 relative overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 shrink-0">
          <div className="bg-slate-800 text-white p-1.5 rounded-md">
            <Network size={20} />
          </div>
          <div>
            <h1 className="font-semibold text-slate-800 leading-tight">NetSim</h1>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">SMK Kelas 2</p>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0 pl-4">
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 border-r border-slate-200 pr-3">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isTeacher ? 'bg-emerald-400' : 'bg-blue-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isTeacher ? 'bg-emerald-500' : 'bg-blue-500'}`}></span>
              </span>
              <span className="text-xs font-semibold text-slate-700">
                {isTeacher ? 'Live Broadcast' : 'Playground'}
              </span>
            </div>
            
            <button 
              onClick={toggleLayoutMode}
              className="flex items-center gap-1.5 text-xs font-semibold bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors shadow-sm border border-slate-200"
              title="Ubah Orientasi Jaringan"
            >
              <RefreshCw size={12} />
              Layout: {layoutMode === 'vertical' ? 'Baris' : 'Kolom'}
            </button>
            <button 
              onClick={handleTestNetwork}
              className="flex items-center gap-1.5 text-xs font-semibold bg-slate-800 text-white px-3 py-1.5 rounded-lg hover:bg-slate-700 transition-colors shadow-sm"
            >
              <Play size={12} fill="currentColor" />
              Uji Jaringan
            </button>
            <button 
              onClick={handleAskAI}
              className="flex items-center gap-1.5 text-xs font-semibold bg-white border border-slate-300 text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
              disabled={isAiLoading}
            >
              <Bot size={14} className="text-purple-500" />
              {isAiLoading ? 'Memanggil AI...' : 'Tanya AI'}
            </button>
          </div>

          <div className="hidden md:block h-6 w-px bg-slate-200 mx-1 shrink-0"></div>

          {isTeacher ? (
            <button
              onClick={logout}
              className="flex items-center gap-2 text-sm text-slate-600 hover:text-red-600 transition-colors bg-slate-100 hover:bg-red-50 px-3 py-1.5 rounded-lg font-medium shrink-0"
            >
              <LogOut size={16} />
              Keluar
            </button>
          ) : (
            <div className="flex items-center gap-2 shrink-0">
              <button
                className="flex items-center gap-2 text-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors px-3 py-1.5 rounded-lg font-medium shrink-0"
                title="Bergabung ke kelas guru yang sedang online"
              >
                <MonitorPlay size={16} />
                Join Kelas
              </button>
              <button
                onClick={() => setLoginModalOpen(true)}
                className="flex items-center gap-2 text-sm text-slate-700 hover:text-slate-900 transition-colors bg-white border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-lg font-medium shrink-0"
              >
                <LogIn size={16} />
                Akses Guru
              </button>
            </div>
          )}
        </div>
      </header>

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setLoginModalOpen(false)} />
    </>
  );
}
