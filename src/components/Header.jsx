'use client';

import { useState, useEffect } from 'react';
import useAuthStore from '@/store/useAuthStore';
import { Network, LogOut, LogIn, Users, MonitorPlay, RefreshCw, Play, Bot, Undo, Redo, Shield, ShieldCheck } from 'lucide-react';
import LoginModal from './LoginModal';
import JoinClassModal from './JoinClassModal';
import useNetworkStore from '@/store/useNetworkStore';

export default function Header() {
  const { isTeacher, isViewer, teacherName, viewingTeacherId, logout, leaveClass } = useAuthStore();
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [isJoinModalOpen, setJoinModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { toggleLayoutMode, undo, redo, history, historyIndex } = useNetworkStore();

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

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
            <button 
              onClick={toggleLayoutMode}
              className="flex items-center gap-1.5 text-xs font-medium bg-white text-black px-3 py-1.5 rounded-md hover:bg-black/5 transition-colors border border-black/10"
              title="Ubah Orientasi Jaringan"
            >
              <RefreshCw size={12} />
              Layout
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
          ) : isViewer ? (
            <div className="flex items-center gap-2 md:gap-3 shrink-0">
              <span className="text-xs md:text-sm font-medium text-emerald-600 bg-emerald-50 px-2 md:px-3 py-1.5 rounded-md border border-emerald-100 flex items-center gap-1 md:gap-2">
                <ShieldCheck size={16} />
                <span className="hidden sm:inline">Menonton:</span> {viewingTeacherId}
              </span>
              <button
                onClick={() => {
                  const trigger = useNetworkStore.getState().triggerTakeover;
                  if (trigger) {
                    if (confirm("Ambil alih siaran dari guru? Anda akan menjadi host.")) {
                      trigger();
                    }
                  } else {
                    alert("Koneksi belum siap.");
                  }
                }}
                className="flex items-center gap-1.5 text-xs md:text-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors px-2 md:px-3 py-1.5 rounded-md font-medium shrink-0 shadow-sm"
              >
                <MonitorPlay size={16} />
                <span className="hidden sm:inline">Ambil Alih</span>
              </button>
              <button
                onClick={leaveClass}
                className="flex items-center gap-1.5 text-xs md:text-sm text-black hover:text-red-600 transition-colors bg-white hover:bg-red-50 border border-black/10 hover:border-red-100 px-2 md:px-3 py-1.5 rounded-md font-medium shrink-0"
              >
                <LogOut size={16} />
                <span className="hidden md:inline">Keluar</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setJoinModalOpen(true)}
                className="flex items-center gap-2 text-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors px-3 py-1.5 rounded-md font-medium shrink-0 shadow-sm"
              >
                <Users size={16} />
                Join Kelas
              </button>
              <button
                onClick={() => setLoginModalOpen(true)}
                className="flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors bg-white border border-slate-200 hover:bg-slate-50 p-2 rounded-md shrink-0"
                title="Akses Guru"
              >
                <Shield size={16} />
              </button>
            </div>
          )}
        </div>
      </header>

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setLoginModalOpen(false)} />
      <JoinClassModal isOpen={isJoinModalOpen} onClose={() => setJoinModalOpen(false)} />
    </>
  );
}
