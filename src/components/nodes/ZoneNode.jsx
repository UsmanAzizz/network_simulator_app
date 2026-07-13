import { Handle, Position } from '@xyflow/react';
import { Plus } from 'lucide-react';
import useNetworkStore from '@/store/useNetworkStore';
import useAuthStore from '@/store/useAuthStore';

export default function ZoneNode({ id, data }) {
  const { layoutMode, addNode, nodes } = useNetworkStore();
  const { isViewer } = useAuthStore();
  
  const typeMap = {
    'INTERNET': 'server',
    'GATEWAY': 'modem',
    'ROUTER': 'router',
    'SWITCH': 'switch',
    'END DEVICE': 'pc'
  };

  const nodeType = typeMap[data.label] || 'pc';
  const hasDevices = nodes.some(n => n.type === nodeType && !n.id.startsWith('zone-'));

  const isVert = layoutMode === 'vertical';

  return (
    <div className={`relative w-full h-full flex ${isVert ? 'items-center flex-row' : 'items-start flex-col pt-16'} justify-start pointer-events-auto overflow-hidden`}>
      {/* Tombol Plus Dinamis (Kiri di mode baris, Atas di mode kolom) */}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          if (isViewer) return;
          addNode(nodeType);
        }}
        className={`absolute top-0 left-0 ${isVert ? 'w-14 h-full border-r' : 'w-full h-14 border-b'} bg-white/80 border-slate-200 flex items-center justify-center transition-all duration-150 active:scale-90 z-50 ${isViewer ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-slate-50'}`}
        style={{ color: data.solidColor || '#333' }}
        title={`Tambah ${data.label}`}
      >
        <Plus size={28} strokeWidth={2.5} />
      </button>

      {/* Watermark Teks */}
      <div 
        className={`font-bold uppercase select-none pointer-events-none transition-all duration-500 ${isVert ? 'text-[4rem] pl-[80px]' : 'text-3xl text-center w-full mt-4'} ${hasDevices ? 'blur-md opacity-20' : 'opacity-100'}`} 
        style={{ color: data.color, minWidth: isVert ? '300px' : 'auto' }}
      >
        {data.label}
      </div>
    </div>
  );
}
