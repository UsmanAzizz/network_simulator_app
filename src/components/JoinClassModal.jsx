'use client';

import { useState, useEffect } from 'react';
import useAuthStore from '@/store/useAuthStore';
import { X, Users, Signal } from 'lucide-react';

export default function JoinClassModal({ isOpen, onClose }) {
  const [onlineTeachers, setOnlineTeachers] = useState({});
  const joinClass = useAuthStore((state) => state.joinClass);

  useEffect(() => {
    let interval;

    const fetchTeachers = async () => {
      if (!isOpen) return;
      try {
        const res = await fetch('/api/teachers');
        if (res.ok) {
          const data = await res.json();
          setOnlineTeachers(data);
        }
      } catch (err) {
        console.error("Failed to fetch teachers", err);
      }
    };

    if (isOpen) {
      fetchTeachers();
      interval = setInterval(fetchTeachers, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleJoin = (teacherId) => {
    joinClass(teacherId);
    onClose();
  };

  const teachersList = Object.entries(onlineTeachers);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
        <div className="flex justify-between items-center px-4 py-3 border-b">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <Users size={18} className="text-slate-600" />
            Join Kelas
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4">
          <p className="text-sm text-slate-600 mb-4">
            Pilih guru yang sedang online untuk bergabung dan melihat aktivitas jaringan mereka secara langsung.
          </p>
          
          {teachersList.length > 0 ? (
            <div className="space-y-2">
              {teachersList.map(([id, data]) => (
                <button
                  key={id}
                  onClick={() => handleJoin(id)}
                  className="w-full flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                      {data.name.charAt(0)}
                    </div>
                    <span className="font-medium text-slate-700">{data.name}</span>
                  </div>
                  <Signal size={16} className="text-emerald-500 animate-pulse" />
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-slate-50 rounded-lg border border-slate-100">
              <Signal size={32} className="mx-auto text-slate-300 mb-2" />
              <p className="text-slate-500 text-sm font-medium">Belum ada guru yang online.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
