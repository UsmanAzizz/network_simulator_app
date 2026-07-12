import { Handle, Position } from '@xyflow/react';
import { Plus } from 'lucide-react';
import useNetworkStore from '@/store/useNetworkStore';

export default function ZoneNode({ id, data }) {
  const { layoutMode, addNode } = useNetworkStore();
  
  const typeMap = {
    'INTERNET': 'server',
    'GATEWAY': 'modem',
    'ROUTER': 'router',
    'SWITCH': 'switch',
    'ENDPOINT': 'pc'
  };

  const nodeType = typeMap[data.label];

  return (
    <div className="relative w-full h-full flex items-center justify-start pointer-events-auto overflow-hidden">
      {/* Tombol Plus di Kiri Atas (Menempel Pojok) */}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          addNode(nodeType);
        }}
        className="absolute top-0 left-0 w-16 h-14 bg-white shadow-sm border-b border-r border-slate-200 rounded-br-3xl flex items-center justify-center transition-transform active:scale-95 z-50 cursor-pointer"
        style={{ color: data.solidColor || '#333' }}
        title={`Tambah ${data.label}`}
      >
        <Plus size={32} strokeWidth={2.5} />
      </button>

      {/* Watermark Teks */}
      <div 
        className="text-[4rem] font-bold uppercase select-none pointer-events-none pl-[90px]" 
        style={{ color: data.color }}
      >
        {data.label}
      </div>
    </div>
  );
}
