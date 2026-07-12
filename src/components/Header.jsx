'use client';

import { useState, useEffect } from 'react';
import useAuthStore from '@/store/useAuthStore';
import { Network, LogOut, LogIn, Users, MonitorPlay, RefreshCw, Play, Bot, Undo, Redo } from 'lucide-react';
import LoginModal from './LoginModal';
import useNetworkStore from '@/store/useNetworkStore';

export default function Header() {
  const { isTeacher, logout } = useAuthStore();
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { layoutMode, toggleLayoutMode, currentIssues, setAiMessage, setIsAiLoading, isAiLoading, undo, redo, history, historyIndex } = useNetworkStore();

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
      <header className="w-full bg-white border-b border-black/10 px-4 py-3 flex items-center justify-between shadow-sm z-20 relative overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-4 shrink-0">
          <div className="bg-black text-white p-1.5 rounded-md flex items-center justify-center">
            <Network size={20} />
          </div>

          <div className="hidden md:block h-6 w-px bg-black/10 mx-1 shrink-0"></div>

          <div className="flex items-center gap-1">
            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              className={`p-1.5 rounded-md transition-colors ${historyIndex <= 0 ? 'text-black/20 cursor-not-allowed' : 'text-black/60 hover:bg-black/5 hover:text-black'}`}
              title="Undo (Kembali)"
            >
              <Undo size={16} />
            </button>
            <button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className={`p-1.5 rounded-md transition-colors ${historyIndex >= history.length - 1 ? 'text-black/20 cursor-not-allowed' : 'text-black/60 hover:bg-black/5 hover:text-black'}`}
              title="Redo (Maju)"
            >
              <Redo size={16} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0 pl-4">
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 border-r border-black/10 pr-4 mr-2">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isTeacher ? 'bg-emerald-500' : 'bg-black'}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isTeacher ? 'bg-emerald-500' : 'bg-black'}`}></span>
              </span>
              <span className="text-xs font-medium text-black">
                {isTeacher ? 'Live Broadcast' : 'Playground'}
              </span>
            </div>
            
            <button 
              onClick={toggleLayoutMode}
              className="flex items-center gap-1.5 text-xs font-medium bg-white text-black px-3 py-1.5 rounded-md hover:bg-black/5 transition-colors border border-black/10"
              title="Ubah Orientasi Jaringan"
            >
              <RefreshCw size={12} />
              Layout: {layoutMode === 'vertical' ? 'Baris' : 'Kolom'}
            </button>
            <button 
              onClick={handleTestNetwork}
              className="flex items-center gap-1.5 text-xs font-medium bg-black text-white px-3 py-1.5 rounded-md hover:bg-black/80 transition-colors shadow-sm"
            >
              <Play size={12} fill="currentColor" />
              Uji Jaringan
            </button>
            <button 
              onClick={handleAskAI}
              className="flex items-center gap-1.5 text-xs font-medium bg-white border border-black/10 text-black px-3 py-1.5 rounded-md hover:bg-black/5 transition-colors shadow-sm"
              disabled={isAiLoading}
            >
              <Bot size={14} className="text-black/60" />
              {isAiLoading ? 'Memanggil AI...' : 'Tanya AI'}
            </button>
          </div>

          <div className="hidden md:block h-6 w-px bg-black/10 mx-1 shrink-0"></div>

          {isTeacher ? (
            <button
              onClick={logout}
              className="flex items-center gap-2 text-sm text-black hover:text-red-600 transition-colors bg-white hover:bg-red-50 border border-transparent hover:border-red-100 px-3 py-1.5 rounded-md font-medium shrink-0"
            >
              <LogOut size={16} />
              Keluar
            </button>
          ) : (
            <div className="flex items-center gap-2 shrink-0">
              <button
                className="flex items-center gap-2 text-sm text-white bg-black hover:bg-black/80 transition-colors px-3 py-1.5 rounded-md font-medium shrink-0"
                title="Bergabung ke kelas guru yang sedang online"
              >
                <MonitorPlay size={16} />
                Join Kelas
              </button>
              <button
                onClick={() => setLoginModalOpen(true)}
                className="flex items-center gap-2 text-sm text-black hover:text-black/80 transition-colors bg-white border border-black/10 hover:bg-black/5 px-3 py-1.5 rounded-md font-medium shrink-0"
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
