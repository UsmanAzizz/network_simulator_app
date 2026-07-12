import { Handle, Position } from '@xyflow/react';
import { Router, Settings, Trash2, CheckCircle2, XCircle, AlertTriangle, Moon } from 'lucide-react';
import useNetworkStore from '@/store/useNetworkStore';

export default function RouterNode({ id, data, selected }) {
  const statusEmoji = data.status;
  const { setActiveSettingsNode, setActiveStatusNode } = useNetworkStore();
  const layoutMode = useNetworkStore(s => s.layoutMode);

  const getStatusIcon = (emoji) => {
    switch(emoji) {
      case '✅': return <CheckCircle2 size={20} className="text-emerald-500 bg-white rounded-full" />;
      case '❌': return <XCircle size={20} className="text-red-500 bg-white rounded-full" />;
      case '⚠️': return <AlertTriangle size={20} className="text-amber-500 bg-white rounded-full" />;
      case '💤': return <Moon size={20} className="text-slate-400 bg-white rounded-full" />;
      default: return null;
    }
  };

  return (
    <div 
      className={`relative w-28 bg-gradient-to-b from-white to-slate-50 rounded-xl border transition-all duration-300 
        ${selected ? 'border-red-500 shadow-xl ring-2 ring-red-50' : 'border-slate-200 shadow hover:shadow-lg hover:border-red-300'}`}
    >
      {/* Header Actions */}
      <div className="absolute top-1 w-full px-1 flex justify-between items-center z-10 pointer-events-none">
        <div className="flex gap-1.5 pointer-events-auto">
          <button 
            onClick={() => setActiveSettingsNode(id)}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all group"
            title="Pengaturan Perangkat"
          >
            <Settings size={14} className="group-hover:animate-spin-slow" />
          </button>
          <button 
            onClick={() => useNetworkStore.getState().removeNode(id)}
            className="p-1.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
            title="Hapus Perangkat"
          >
            <Trash2 size={14} />
          </button>
        </div>
        
        {statusEmoji && (
          <button 
            onClick={() => setActiveStatusNode(id)}
            className="pointer-events-auto hover:scale-110 transition-transform drop-shadow-sm"
            title="Klik untuk melihat detail status"
          >
            {getStatusIcon(statusEmoji)}
          </button>
        )}
      </div>

      <div className="flex flex-col items-center pt-6 pb-2 px-2">
        {/* Ikon Perangkat */}
        <div className="w-8 h-8 bg-white shadow-sm border border-slate-100 rounded-lg flex items-center justify-center mb-1 text-red-500 transform transition-transform hover:scale-105">
          <Share2 size={18} strokeWidth={1.5} />
        </div>
        
        {/* Info */}
        <div className="w-full border-t border-slate-100 pt-1.5 flex flex-col items-center">
          <h3 className="font-bold text-slate-700 text-[10px] tracking-tight truncate w-full text-center">{data.label || 'Router'}</h3>
          
          <input 
            type="text" 
            placeholder="IP Address"
            className="w-full text-center text-[9px] mt-1 font-mono text-slate-700 bg-slate-100/80 border border-slate-200 rounded py-0.5 focus:outline-none focus:ring-1 focus:ring-red-400 transition-all shadow-inner"
            value={data.eth0Ip || ''}
            onChange={(e) => data.onDataChange && data.onDataChange(data.id, { eth0Ip: e.target.value })}
          />
        </div>
      </div>

      {/* Input Handle (WAN/Top) */}
      <Handle 
        type="target" 
        position={layoutMode === 'horizontal' ? Position.Left : Position.Top} 
        style={{ width: '12px', height: '12px' }}
        className="!bg-slate-800 !border-2 !border-white hover:!bg-slate-900 hover:scale-150 transition-transform cursor-pointer !rounded-full shadow-md z-20"
        id="wan-in"
        isConnectable={1}
      />
      
      {/* Output Handles (LAN/Bottom) */}
      {[20, 40, 60, 80].map((pos, idx) => (
        <Handle 
          key={`lan${idx+1}`}
          type="source" 
          position={layoutMode === 'horizontal' ? Position.Right : Position.Bottom} 
          style={layoutMode === 'horizontal' ? { top: `${pos}%`, width: '12px', height: '12px' } : { left: `${pos}%`, width: '12px', height: '12px' }}
          className="!bg-slate-800 !border-2 !border-white hover:!bg-slate-900 hover:scale-150 transition-transform cursor-pointer !rounded-full shadow-md z-20"
          id={`lan-out-${idx+1}`}
          isConnectable={1}
        />
      ))}
    </div>
  );
}
