'use client';

import { useState, useEffect } from 'react';
import useAuthStore from '@/store/useAuthStore';
import { X, Users, Signal } from 'lucide-react';

export default function JoinClassModal({ isOpen, onClose }) {
  const [onlineTeachers, setOnlineTeachers] = useState({});
  const [studentName, setStudentName] = useState('');
  const joinClass = useAuthStore((state) => state.joinClass);

  useEffect(() => {
    // For MVP with Liveblocks, we just hardcode the teacher since rooms are dynamic
    if (isOpen) {
      setOnlineTeachers({
        'usman_aziz': { name: 'Usman Aziz, S.Kom.', lastActive: Date.now() }
      });
      const cachedName = useAuthStore.getState().studentName;
      if (cachedName) setStudentName(cachedName);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleJoin = (teacherId) => {
    if (!studentName.trim()) {
      alert("Silakan masukkan nama Anda terlebih dahulu!");
      return;
    }
    joinClass(teacherId, studentName.trim());
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
            Masukkan nama Anda dan pilih kelas yang sedang aktif untuk bergabung.
          </p>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Nama Anda</label>
            <input 
              type="text" 
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="Contoh: Budi Santoso"
              className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
            />
          </div>
          
          <label className="block text-sm font-medium text-slate-700 mb-2">Kelas Online</label>
          
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
