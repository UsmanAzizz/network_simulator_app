'use client';

import { Monitor, Server, Undo2, Redo2, Network, Router, Globe } from 'lucide-react';
import useNetworkStore from '@/store/useNetworkStore';

export default function DeviceSidebar() {
  const { undo, redo, history, historyIndex, addNode } = useNetworkStore();

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return (
    <div className="w-16 bg-white border-r flex flex-col items-center py-4 shadow-sm z-10">
      
      {/* Undo / Redo Controls */}
      <div className="flex flex-col gap-2 mb-6 border-b pb-4 w-full items-center">
        <button 
          onClick={undo}
          disabled={!canUndo}
          className={`p-2 rounded-lg transition-colors ${canUndo ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900' : 'text-slate-300 cursor-not-allowed'}`}
          title="Undo"
        >
          <Undo2 size={20} />
        </button>
        <button 
          onClick={redo}
          disabled={!canRedo}
          className={`p-2 rounded-lg transition-colors ${canRedo ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900' : 'text-slate-300 cursor-not-allowed'}`}
          title="Redo"
        >
          <Redo2 size={20} />
        </button>
      </div>

      <div className="flex-1 w-full overflow-y-auto no-scrollbar pb-4 flex flex-col items-center">
        {/* Category: End Devices */}
        <div className="w-full flex flex-col items-center mb-5">
          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3 text-center w-full bg-slate-50 py-1 border-y">End Devices</div>
          <div className="flex flex-col gap-4">
            <button 
              className="w-12 h-12 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-center text-blue-500 hover:ring-2 hover:ring-blue-100 transition-all shadow-sm"
              onClick={() => addNode('pc')}
              title="Klik untuk tambah PC"
            >
              <Monitor size={22} strokeWidth={1.5} />
            </button>
            
            <button 
              className="w-12 h-12 bg-red-50 border border-red-200 rounded-xl flex items-center justify-center text-red-500 hover:ring-2 hover:ring-red-100 transition-all shadow-sm"
              onClick={() => addNode('server')}
              title="Klik untuk tambah Server"
            >
              <Globe size={22} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Category: LAN / Data Link */}
        <div className="w-full flex flex-col items-center mb-5">
          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3 text-center w-full bg-slate-50 py-1 border-y">LAN / L2</div>
          <div className="flex flex-col gap-4">
            <button 
              className="w-12 h-12 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-center text-emerald-500 hover:ring-2 hover:ring-emerald-100 transition-all shadow-sm"
              onClick={() => addNode('switch')}
              title="Klik untuk tambah Switch"
            >
              <Server size={22} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Category: WAN / Routing */}
        <div className="w-full flex flex-col items-center">
          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3 text-center w-full bg-slate-50 py-1 border-y">WAN / L3</div>
          <div className="flex flex-col gap-4">
            <button 
              className="w-12 h-12 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-center text-purple-500 hover:ring-2 hover:ring-purple-100 transition-all shadow-sm"
              onClick={() => addNode('router')}
              title="Klik untuk tambah Router"
            >
              <Network size={22} strokeWidth={1.5} />
            </button>
            
            <button 
              className="w-12 h-12 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-center text-amber-500 hover:ring-2 hover:ring-amber-100 transition-all shadow-sm"
              onClick={() => addNode('modem')}
              title="Klik untuk tambah Modem"
            >
              <Router size={22} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>
      
    </div>
  );
}
