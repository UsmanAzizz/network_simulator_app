import { Handle, Position } from '@xyflow/react';
import { Wifi, Trash2, CheckCircle2, AlertCircle, Moon } from 'lucide-react';
import useNetworkStore from '@/store/useNetworkStore';

export default function ModemNode({ id, data, selected }) {
  const statusEmoji = data?.status;
  const { setActiveStatusNode, removeNode } = useNetworkStore();
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

  const getBrandIcon = (label) => {
    if (!label) return <Wifi size={20} strokeWidth={1.5} />;
    const l = label.toLowerCase();
    if (l.includes('indihome')) return <span className="font-black text-red-600 text-xs italic">IndiHome</span>;
    if (l.includes('biznet')) return <span className="font-black text-orange-500 text-xs italic">Biznet</span>;
    if (l.includes('firstmedia')) return <span className="font-black text-yellow-500 text-xs italic">FirstMedia</span>;
    if (l.includes('myrepublic')) return <span className="font-black text-purple-600 text-xs italic">MyRep</span>;
    if (l.includes('oxygen')) return <span className="font-bold text-blue-500 text-xs">Oxygen</span>;
    return <Wifi size={20} strokeWidth={1.5} />;
  };

  return (
    <div 
      className={`relative w-36 bg-white/80 backdrop-blur-md rounded-xl border transition-all duration-300 
        ${selected ? 'border-amber-500 shadow-xl ring-2 ring-amber-500/20' : 'border-slate-200 shadow-sm hover:border-amber-300 hover:shadow-md'}`}
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
        <div className="w-10 h-10 bg-white shadow-sm border border-slate-100 rounded-xl flex items-center justify-center mb-2 text-amber-500 transform transition-transform hover:scale-105">
          {getBrandIcon(data.label)}
        </div>
        
        {/* Info */}
        <div className="w-full flex flex-col items-center">
          <h3 className="font-bold text-slate-700 text-[11px] tracking-tight truncate w-full text-center">{data.label || 'Modem IndiHome'}</h3>
          
          <div className={`w-full mt-1.5 text-center text-[10px] font-semibold rounded-md py-1 shadow-inner border ${data.invalidIp ? 'text-red-600 bg-red-100 border-red-300 animate-pulse' : 'text-slate-600 bg-slate-100 border-slate-200'}`}>
            {data.invalidIp ? 'Invalid' : (data.ip || '202.134.1.10')}
          </div>
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
          key={`lan-out-${idx+1}`}
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
