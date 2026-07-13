'use client';

import useDialogStore from '@/store/useDialogStore';
import { X, Info, HelpCircle } from 'lucide-react';

export default function DialogManager() {
  const { isOpen, type, title, message, onConfirm, closeDialog } = useDialogStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center px-4 py-3 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            {type === 'confirm' ? (
              <HelpCircle size={18} className="text-blue-500" />
            ) : (
              <Info size={18} className="text-amber-500" />
            )}
            {title}
          </h3>
          {type === 'alert' && (
            <button onClick={closeDialog} className="text-slate-400 hover:text-slate-600 transition-colors">
              <X size={18} />
            </button>
          )}
        </div>
        
        <div className="p-5">
          <p className="text-slate-600 text-sm leading-relaxed">
            {message}
          </p>
        </div>

        <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
          {type === 'confirm' ? (
            <>
              <button
                onClick={closeDialog}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200/50 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  if (onConfirm) onConfirm();
                  closeDialog();
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
              >
                Ya, Lanjutkan
              </button>
            </>
          ) : (
            <button
              onClick={closeDialog}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm"
            >
              Mengerti
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
