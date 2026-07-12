import { Handle, Position } from '@xyflow/react';
import { Globe, Trash2, CheckCircle2, AlertTriangle, Moon, MonitorPlay, Music } from 'lucide-react';
import useNetworkStore from '@/store/useNetworkStore';

export default function ServerNode({ id, data, selected }) {
  const statusEmoji = data?.status;
  const { setActiveSettingsNode, setActiveStatusNode, removeNode } = useNetworkStore();
  const layoutMode = useNetworkStore(s => s.layoutMode);

  const getBrandIcon = (label) => {
    if (!label) return <Globe size={24} strokeWidth={1.5} />;
    if (label.includes('YouTube')) return <img src="https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg" alt="YouTube" className="w-8 h-8 object-contain" />;
    if (label.includes('TikTok')) return <img src="https://upload.wikimedia.org/wikipedia/en/a/a9/TikTok_logo.svg" alt="TikTok" className="w-8 h-8 object-contain" />;
    if (label.includes('Roblox')) return <img src="https://upload.wikimedia.org/wikipedia/commons/3/3a/Roblox_player_icon_black.svg" alt="Roblox" className="w-8 h-8 object-contain" />;
    if (label.includes('Instagram')) return <img src="https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg" alt="Instagram" className="w-8 h-8 object-contain" />;
    if (label.includes('WhatsApp')) return <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" className="w-8 h-8 object-contain" />;
    return <Globe size={24} strokeWidth={1.5} />;
  };

  const getStatusIcon = (emoji) => {
    switch(emoji) {
      case '✅': return <CheckCircle2 size={20} className="text-emerald-500 bg-white rounded-full" />;
      case '❌': return <AlertTriangle size={20} className="text-red-500 bg-white rounded-full" />;
      case '⚠️': return <AlertTriangle size={20} className="text-amber-500 bg-white rounded-full" />;
      case '💤': return <Moon size={20} className="text-slate-400 bg-white rounded-full" />;
      default: return null;
    }
  };

  const isTikTok = data?.label?.toLowerCase().includes('tiktok');

  return (
    <div 
      className={`relative w-28 bg-white/80 backdrop-blur-md rounded-xl border transition-all duration-300 
        ${selected ? 'border-purple-500 shadow-xl ring-2 ring-purple-500/20' : 'border-slate-200 shadow-sm hover:border-purple-300 hover:shadow-md'}`}
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
        <div className="w-8 h-8 bg-white shadow-sm border border-slate-100 rounded-lg flex items-center justify-center mb-1 text-red-500 transform transition-transform hover:scale-105">
          {isTikTok ? <Music size={18} strokeWidth={1.5} /> : <MonitorPlay size={18} strokeWidth={1.5} />}
        </div>
        
        {/* Info */}
        <div className="w-full border-t border-slate-100 pt-1.5 flex flex-col items-center">
          <h3 className="font-bold text-slate-700 text-[10px] tracking-tight truncate w-full text-center">{data.label || 'Server YouTube'}</h3>
          
          <div className="w-full mt-1 text-center text-[9px] font-semibold text-slate-600 bg-slate-100/80 border border-slate-200 rounded py-0.5 shadow-inner">
            {data.ip || '8.8.8.8'}
          </div>
        </div>
      </div>

      <Handle 
        type="source" 
        position={layoutMode === 'horizontal' ? Position.Right : Position.Bottom} 
        style={{ width: '12px', height: '12px' }}
        className="!bg-slate-800 !border-2 !border-white hover:!bg-slate-900 hover:scale-150 transition-transform cursor-pointer !rounded-full shadow-md z-20"
        id="lan-out"
        isConnectable={1}
      />
    </div>
  );
}
