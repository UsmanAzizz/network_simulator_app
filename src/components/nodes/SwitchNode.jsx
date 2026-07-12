import { Handle, Position } from '@xyflow/react';
import { Server, Trash2, CheckCircle2, AlertTriangle, Moon } from 'lucide-react';
import useNetworkStore from '@/store/useNetworkStore';

export default function SwitchNode({ id, data, selected }) {
  const statusEmoji = data?.status;
  const { setActiveStatusNode, removeNode } = useNetworkStore();
  const layoutMode = useNetworkStore(s => s.layoutMode);

  const getStatusIcon = (emoji) => {
    switch(emoji) {
      case '✅': return <CheckCircle2 size={20} className="text-emerald-500 bg-white rounded-full" />;
      case '❌': return <AlertTriangle size={20} className="text-red-500 bg-white rounded-full" />;
      case '⚠️': return <AlertTriangle size={20} className="text-amber-500 bg-white rounded-full" />;
      case '💤': return <Moon size={20} className="text-slate-400 bg-white rounded-full" />;
      default: return null;
    }
  };

  return (
    <div 
      className={`relative w-28 bg-white/80 backdrop-blur-md rounded-xl border transition-all duration-300 
        ${selected ? 'border-emerald-500 shadow-xl ring-2 ring-emerald-500/20' : 'border-slate-200 shadow-sm hover:border-emerald-300 hover:shadow-md'}`}
    >
      {/* Header Actions */}
      <div className="absolute -top-3 -right-3 flex gap-1 z-10">
        <button 
          onClick={(e) => { e.stopPropagation(); removeNode(id); }}
          className="bg-white rounded-full p-1 shadow-md border border-slate-200 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          title="Hapus Node"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {statusEmoji && (
        <div className="absolute -top-3 -left-3 z-10">
          <button 
            onClick={(e) => { e.stopPropagation(); setActiveStatusNode(id); }}
            className="hover:scale-110 transition-transform drop-shadow-sm"
            title="Detail status"
          >
            {getStatusIcon(statusEmoji)}
          </button>
        </div>
      )}

      <div className="flex flex-col items-center pt-6 pb-2 px-2">
        {/* Ikon Perangkat */}
        <div className="w-8 h-8 bg-white shadow-sm border border-slate-100 rounded-lg flex items-center justify-center mb-1 text-emerald-500 transform transition-transform hover:scale-105">
          <Server size={18} strokeWidth={1.5} />
        </div>
        
        {/* Info */}
        <div className="w-full border-t border-slate-100 pt-1.5 flex flex-col items-center">
          <h3 className="font-bold text-slate-700 text-[10px] tracking-tight truncate w-full text-center">{data.label || 'Switch'}</h3>
          <p className="text-[7px] text-slate-400 font-bold uppercase tracking-wider text-center mt-0.5">L2 Hub</p>
        </div>
      </div>

      {/* Input Handle (Top) */}
      <Handle 
        type="target" 
        position={layoutMode === 'horizontal' ? Position.Left : Position.Top} 
        style={{ width: '12px', height: '12px' }}
        className="!bg-slate-800 !border-2 !border-white hover:!bg-slate-900 hover:scale-150 transition-transform cursor-pointer !rounded-full shadow-md z-20"
        id="lan-in"
        isConnectable={1}
      />
      
      {/* Output Handles (Bottom) */}
      {[20, 40, 60, 80].map((pos, idx) => (
        <Handle 
          key={`out-${idx+1}`}
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
