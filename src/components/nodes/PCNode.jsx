import { Handle, Position } from '@xyflow/react';
import { Monitor, Trash2, CheckCircle2, AlertCircle, Moon, PlayCircle } from 'lucide-react';
import useNetworkStore from '@/store/useNetworkStore';

export default function PCNode({ id, data, selected }) {
  const statusEmoji = data?.status;
  const { setActiveStatusNode, removeNode, setActiveBrowserNode } = useNetworkStore();
  const layoutMode = useNetworkStore(s => s.layoutMode);

  const getStatusIcon = (statusStr) => {
    switch(statusStr) {
      case 'danger': return <AlertCircle size={20} className="text-red-500 bg-white rounded-full animate-pulse shadow-sm" />;
      case 'success': return <CheckCircle2 size={20} className="text-emerald-500 bg-white rounded-full" />;
      case 'warning': return <AlertCircle size={20} className="text-amber-500 bg-white rounded-full" />;
      case 'offline': return <Moon size={20} className="text-slate-400 bg-white rounded-full" />;
      default: return null;
    }
  };

  return (
    <div 
      className={`relative w-36 bg-white/80 backdrop-blur-md rounded-xl border transition-all duration-300 
        ${selected ? 'border-blue-500 shadow-xl ring-2 ring-blue-500/20' : 'border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md'}`}
    >
      {/* Header Actions (Inside Card) */}
      <div className="absolute top-2 w-full px-2 flex justify-between items-start z-10">
        {statusEmoji ? (
          <button 
            onClick={(e) => { e.stopPropagation(); setActiveStatusNode(id); }}
            className="hover:scale-110 transition-transform drop-shadow-sm"
            title="Detail status"
          >
            {getStatusIcon(statusEmoji)}
          </button>
        ) : (
          <div className="w-5 h-5"></div>
        )}
        
        <button 
          onClick={(e) => { e.stopPropagation(); removeNode(id); }}
          className="p-1 rounded-md text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          title="Hapus Node"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="flex flex-col items-center pt-8 pb-3 px-2 min-h-[110px]">
        {/* Ikon Perangkat */}
        {data.accessibleServers && data.accessibleServers.length > 0 ? (
          <button 
            onClick={(e) => { e.stopPropagation(); setActiveBrowserNode(id); }}
            className="w-12 h-12 bg-white shadow-sm border border-slate-100 rounded-xl flex items-center justify-center mb-2 text-blue-500 transform transition-transform hover:scale-110 hover:bg-blue-50 hover:border-blue-200 group relative"
            title="Buka Browser"
          >
            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full animate-pulse border border-white"></div>
            <PlayCircle size={24} strokeWidth={1.5} className="group-hover:fill-blue-100" />
          </button>
        ) : (
          <button
            onClick={(e) => { e.stopPropagation(); setActiveBrowserNode(id); }} 
            className="w-10 h-10 bg-white shadow-sm border border-slate-100 rounded-xl flex items-center justify-center mb-2 text-blue-500 transform transition-transform hover:scale-105 opacity-80 cursor-pointer hover:bg-slate-50"
            title="Buka Browser (Tidak Ada Internet)"
          >
            <Monitor size={20} strokeWidth={1.5} />
          </button>
        )}
        
        {/* Info */}
        <div className="w-full flex flex-col items-center">
          <h3 className="font-bold text-slate-700 text-[11px] tracking-tight truncate w-full text-center">PC {data.index || 1}</h3>
          
          <div className={`w-full mt-1.5 text-center text-[10px] font-semibold rounded-md py-1 shadow-inner border ${data.invalidIp ? 'text-red-600 bg-red-100 border-red-300 animate-pulse' : 'text-slate-600 bg-slate-100 border-slate-200'}`}>
            {data.invalidIp ? 'Invalid' : (data.ip || <span className="text-red-400 text-[9px]">Not Connected</span>)}
          </div>
        </div>
      </div>

      {/* Input Handle (Top) */}
      <Handle 
        type="target" 
        position={layoutMode === 'horizontal' ? Position.Left : Position.Top} 
        style={{ width: '12px', height: '12px' }}
        className="!bg-slate-800 !border-2 !border-white hover:!bg-slate-900 hover:scale-150 transition-transform cursor-pointer !rounded-full shadow-md z-20"
        id="eth0"
        isConnectable={1}
      />
    </div>
  );
}
