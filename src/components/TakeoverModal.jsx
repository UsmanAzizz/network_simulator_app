'use client';

import { X, Hand, Signal } from 'lucide-react';
import useNetworkStore from '@/store/useNetworkStore';

export default function TakeoverModal({ isOpen, onClose }) {
  const onlineStudents = useNetworkStore(state => state.onlineStudents);
  const grantTakeover = useNetworkStore(state => state.grantTakeover);

  if (!isOpen) return null;

  const handleGrant = (connectionId, name) => {
    if (confirm(`Apakah Anda yakin ingin memberikan kendali siaran kepada ${name}? Anda akan menjadi penonton.`)) {
      if (grantTakeover) {
        grantTakeover(connectionId);
        onClose();
      } else {
        alert("Koneksi belum siap.");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
        <div className="flex justify-between items-center px-4 py-3 border-b">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <Hand size={18} className="text-slate-600" />
            Beri Kendali
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4">
          <p className="text-sm text-slate-600 mb-4">
            Pilih siswa yang sedang online untuk menggantikan Anda sebagai pemandu jaringan.
          </p>
          
          <label className="block text-sm font-medium text-slate-700 mb-2">Siswa Aktif</label>
          
          {onlineStudents.length > 0 ? (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {onlineStudents.map((student) => (
                <button
                  key={student.connectionId}
                  onClick={() => handleGrant(student.connectionId, student.name)}
                  className="w-full flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-slate-700">{student.name}</span>
                  </div>
                  <Signal size={16} className="text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-slate-50 rounded-lg border border-slate-100">
              <Hand size={32} className="mx-auto text-slate-300 mb-2" />
              <p className="text-slate-500 text-sm font-medium">Belum ada siswa yang bergabung.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
