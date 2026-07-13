'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import useAuthStore from '@/store/useAuthStore';
import useNetworkStore from '@/store/useNetworkStore';
import useDialogStore from '@/store/useDialogStore';
import PCNode from './nodes/PCNode';
import SwitchNode from './nodes/SwitchNode';
import RouterNode from './nodes/RouterNode';
import ModemNode from './nodes/ModemNode';
import ServerNode from './nodes/ServerNode';
import ZoneNode from './nodes/ZoneNode';
import { validateNetworkTopology } from '@/utils/networkEngine';
import { CheckCircle2, XCircle, AlertTriangle, Moon, Settings, Trash2 } from 'lucide-react';
import BrowserDialog from '@/components/BrowserDialog';
import LiveCursors from '@/components/LiveCursors';

function AutoFitView() {
  const { setViewport } = useReactFlow();
  const layoutMode = useNetworkStore(state => state.layoutMode);
  
  useEffect(() => {
    // Permintaan user: TIDAK BOLEH mengecil (zoom harus selalu 1.0)
    // Biarkan overflow ke kanan/bawah agar bisa discroll manual
    setViewport({ x: 0, y: 0, zoom: 1 }, { duration: 400 });
  }, [layoutMode, setViewport]);
  
  return null;
}

const nodeTypes = {
  pc: PCNode,
  switch: SwitchNode,
  router: RouterNode,
  modem: ModemNode,
  server: ServerNode,
  zone: ZoneNode,
};

let id = 1;
const getId = (type) => `${type}-${id++}`;

export default function NetworkCanvas() {
  const reactFlowWrapper = useRef(null);
  const { screenToFlowPosition, setViewport, getViewport } = useReactFlow();
  const { isTeacher, isViewer } = useAuthStore();
  const { showAlert } = useDialogStore();
  
  const { nodes, edges, layoutMode, toggleLayoutMode, onNodesChange, onEdgesChange, onConnect: storeOnConnect, setNodes, updateNodeData, setContainerHeight, containerHeight, activeBrowserNode, selectedEdgeForDelete, setSelectedEdgeForDelete } = useNetworkStore();
  const { aiMessage, setAiMessage, currentIssues, setCurrentIssues, isAiLoading, setIsAiLoading } = useNetworkStore();

  const [windowWidth, setWindowWidth] = useState(1000);
  const [containerWidth, setContainerWidth] = useState(1000);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWindowWidth(window.innerWidth);
      const handleResize = () => setWindowWidth(window.innerWidth);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const isVertical = layoutMode === 'vertical';
  // Untuk mobile (vertical layout): kita cari device dengan posisi X terbesar. 
  // Gunakan onMove untuk membatasi scroll secara manual guna menghindari bug auto-center React Flow
  const deviceNodes = nodes.filter(n => !n.id.startsWith('zone-'));
  const maxNodeX = deviceNodes.length > 0 ? Math.max(...deviceNodes.map(n => n.position.x + 280)) : 0;
  
  const handleMove = useCallback((event, viewport) => {
    if (layoutMode === 'vertical') {
      let newX = viewport.x;
      let changed = false;
      
      // Batasi geser ke kiri (maksimal sampai ujung device terakhir, tanpa padding ekstra)
      // Jika maxScroll 0 (belum overflow), maka canvas tidak akan bisa digeser sama sekali
      const maxScroll = Math.max(0, maxNodeX - containerWidth);
      if (newX < -maxScroll) {
        newX = -maxScroll;
        changed = true;
      }
      
      // Jika melewati batas, paksa kembali ke batas tersebut
      if (changed) {
        setViewport({ x: newX, y: viewport.y, zoom: viewport.zoom });
      }
    }
  }, [layoutMode, maxNodeX, containerWidth, setViewport]);

  // Pantau ukuran layar untuk menghitung tinggi zona dinamis dan menerapkan zoom layar
  useEffect(() => {
    const updateSize = () => {
      if (reactFlowWrapper.current) {
        const h = reactFlowWrapper.current.offsetHeight;
        const w = reactFlowWrapper.current.offsetWidth;
        if (w > 0) setContainerWidth(w);
        if (h > 0) {
          setContainerHeight(h);
          
          // RASIO LAYAR: Sesuaikan virtual canvas 1000px ke tinggi fisik layar HP
          if (layoutMode === 'vertical') {
            const zoomRatio = h / 1050; // Extra 50px buffer to prevent bottom overflow
            const currentZoom = getViewport().zoom;
            // Hanya update jika berbeda jauh, agar tidak mengganggu interaksi
            if (Math.abs(currentZoom - zoomRatio) > 0.01) {
              setViewport({ x: 0, y: 0, zoom: zoomRatio });
            }
          } else {
             // Di mode horizontal, biarkan zoom 1.0 (karena bisa scroll ke kanan)
             setViewport({ x: 0, y: 0, zoom: 1 });
          }
        }
      }
    };
    
    updateSize(); // Initial call
    
    // Gunakan ResizeObserver agar lebih akurat walau tanpa window.resize
    const resizeObserver = new ResizeObserver(() => updateSize());
    if (reactFlowWrapper.current) {
      resizeObserver.observe(reactFlowWrapper.current);
    }
    
    return () => resizeObserver.disconnect();
  }, [setContainerHeight]);

  useEffect(() => {
    useNetworkStore.getState().saveHistory();
  }, []);

  // Auto-evaluate network dynamically on any change
  useEffect(() => {
    // Filter out background zones
    const deviceNodes = nodes.filter(n => !n.id.startsWith('zone-'));
    
    // Only run if there are devices
    if (deviceNodes.length === 0) return;

    const { results, issues, statusTexts } = validateNetworkTopology(deviceNodes, edges);
    
    let hasChanges = false;
    deviceNodes.forEach(node => {
      if (node.data.status !== results[node.id] || node.data.statusText !== statusTexts[node.id]) {
        hasChanges = true;
      }
    });

      if (hasChanges) {
      const updatedNodes = nodes.map(node => {
        if (!node.id.startsWith('zone-')) {
          return { ...node, data: { ...node.data, status: results[node.id], statusText: statusTexts[node.id] } };
        }
        return node;
      });
      setNodes(updatedNodes);
      setCurrentIssues(issues);
    }
  }, [nodes, edges, setNodes, setCurrentIssues]);

  const onConnect = useCallback(
    (params) => {
      // 1. Cek apakah port fisik sudah dicolok kabel lain (Enforce isConnectable=1 secara manual)
      const sourceNodeTemp = nodes.find(n => n.id === params.source);
      const targetNodeTemp = nodes.find(n => n.id === params.target);
      
      const isSourceUsed = edges.find(e => e.source === params.source && e.sourceHandle === params.sourceHandle);
      const isTargetUsed = edges.find(e => e.target === params.target && e.targetHandle === params.targetHandle);
      
      // Khusus SERVER, biarkan output (source) memiliki banyak kabel ke bawah (ke banyak Modem)
      // Khusus MODEM (gateway), biarkan input (target) menerima banyak kabel dari atas (dari banyak Server)
      const isTargetModem = targetNodeTemp?.type === 'gateway';
      
      if ((isTargetUsed && !isTargetModem) || (isSourceUsed && sourceNodeTemp?.type !== 'server')) {
        showAlert("Port fisik sudah penuh! Setiap port hanya bisa dicolok maksimal 1 kabel (kecuali Server/Modem).", "Peringatan Port");
        return; // Tolak koneksi
      }

      // Format custom edge jika perlu styling
      const edge = { 
        ...params, 
        animated: true, 
        style: { stroke: '#3b82f6', strokeWidth: 2, zIndex: 100 } // zIndex tinggi agar di atas device
      };
      storeOnConnect(edge);
    },
    [nodes, storeOnConnect, edges]
  );

  const onConnectStart = useCallback((event, params) => {
    if (!isViewer) {
      window.dispatchEvent(new CustomEvent('active-cable-start', { detail: params }));
    }
  }, [isViewer]);

  const onConnectEnd = useCallback((event) => {
    if (!isViewer) {
      window.dispatchEvent(new CustomEvent('active-cable-end'));
    }
  }, [isViewer]);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      
      const newNode = {
        id: getId(type),
        type,
        position,
        data: { label: `${type.toUpperCase()} Baru`, ip: '' },
      };

      setNodes(nodes.concat(newNode));
    },
    [screenToFlowPosition, setNodes, nodes],
  );

  const onEdgeClick = useCallback((event, edge) => {
    event.stopPropagation(); // Mencegah onPaneClick terpanggil
    
    const isInvalid = edge.className?.includes('animate-danger-cable');
    
    setSelectedEdgeForDelete({
      id: edge.id,
      x: event.clientX,
      y: event.clientY,
      isInvalid
    });
  }, []);

  const onPaneClick = useCallback(() => {
    if (selectedEdgeForDelete) {
      setSelectedEdgeForDelete(null);
    }
  }, [selectedEdgeForDelete]);

  // Ambil state UI overlay dari store
  const { activeSettingsNode, activeStatusNode, setActiveSettingsNode, setActiveStatusNode } = useNetworkStore.getState();
  const activeSettingsNodeData = nodes.find(n => n.id === activeSettingsNode);
  const activeStatusNodeData = nodes.find(n => n.id === activeStatusNode);

  return (
    <div className="w-full h-full bg-slate-100 overflow-hidden relative flex flex-col" ref={reactFlowWrapper}>
      
      {/* AI Message Toast */}
      {aiMessage && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 w-[90%] max-w-md bg-white border-2 border-slate-800 rounded-xl p-4 shadow-xl animate-in fade-in slide-in-from-top-4">
          <div className="flex items-start gap-3">
            <div className="text-2xl">🤖</div>
            <div>
              <h4 className="font-semibold text-slate-800 text-sm mb-1">Guru AI Berkata:</h4>
              <p className="text-slate-600 text-sm leading-relaxed">{aiMessage}</p>
              <button 
                onClick={() => setAiMessage('')} 
                className="mt-3 text-xs font-medium text-slate-500 hover:text-slate-700 underline"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 w-full relative">
        <ReactFlow
          nodesDraggable={false}
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={isViewer ? undefined : onNodesChange}
          onEdgesChange={isViewer ? undefined : onEdgesChange}
          onConnect={isViewer ? undefined : onConnect}
          onConnectStart={onConnectStart}
          onConnectEnd={onConnectEnd}
          onEdgeClick={onEdgeClick}
          onPaneClick={onPaneClick}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onMove={handleMove}
          translateExtent={[[0, 0], [10000, isVertical ? 1050 : 10000]]} // Kunci mutlak batas atas, kiri, dan bawah
          nodesConnectable={!isViewer}
          elementsSelectable={!isViewer}
          panOnDrag={true}
          panOnScroll={true}
          zoomOnScroll={!isVertical}
          zoomOnPinch={!isVertical}
          zoomOnDoubleClick={false}
          connectOnClick={true} // Berbasis Klik (Click-to-connect)
          defaultEdgeOptions={{ type: 'smoothstep' }} // Tipe garis sudut 90 derajat!
        >
          <AutoFitView />
          <Background gap={16} size={1.5} color="#cbd5e1" />
        </ReactFlow>
      </div>

        {selectedEdgeForDelete && (
          <div 
            className="fixed z-50 flex flex-col gap-2 animate-in fade-in zoom-in duration-200"
            style={{ top: selectedEdgeForDelete.y, left: selectedEdgeForDelete.x }}
          >
            {selectedEdgeForDelete.isInvalid && <div className="bg-red-50 border border-red-200 p-2.5 rounded-lg shadow-xl text-[11px] text-red-700 w-52 leading-relaxed relative">
                  <div className="font-bold mb-1 text-red-800 flex items-center gap-1">🚨 Kesalahan Topologi</div>
                  Kabel dari Server/Internet harus dicolokkan ke Modem/Gateway terlebih dahulu. Tidak bisa langsung ke Router/Switch.
                <div className="absolute -bottom-1.5 left-4 w-3 h-3 bg-red-50 border-r border-b border-red-200 rotate-45"></div>
              </div>
            }
            
            <div className="bg-white border border-slate-200 p-2 rounded-lg shadow-xl flex items-center gap-2">
              <button 
                onClick={() => {
                  useNetworkStore.getState().removeEdge(selectedEdgeForDelete.id);
                  setSelectedEdgeForDelete(null);
                }}
                className="bg-red-50 text-red-600 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded-md text-xs font-bold transition-colors shadow-sm flex items-center gap-1"
              >
                ✂️ Potong Kabel
              </button>
              <button 
                onClick={() => setSelectedEdgeForDelete(null)}
                className="text-slate-400 hover:text-slate-600 px-2 py-1 text-xs"
              >
                Batal
              </button>
            </div>
          </div>
        )}
      {/* UI Modal Settings */}
      {activeSettingsNodeData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white p-6 rounded-2xl shadow-2xl border w-96 max-w-full">
            <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">⚙️ Pengaturan {activeSettingsNodeData.data.label}</h3>
            
            <div className="space-y-4">
              {/* DHCP Toggle */}
              {activeSettingsNodeData.type === 'pc' && (
                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border">
                  <div>
                    <p className="font-semibold text-sm text-slate-700">Mode IP</p>
                    <p className="text-xs text-slate-500">Otomatis / Statis</p>
                  </div>
                  <select 
                    value={activeSettingsNodeData.data.dhcp ? 'dhcp' : 'static'}
                    onChange={(e) => updateNodeData(activeSettingsNodeData.id, { dhcp: e.target.value === 'dhcp' })}
                    className="text-sm bg-white border border-slate-300 rounded px-2 py-1 font-medium text-slate-700"
                  >
                    <option value="dhcp">Dinamis (DHCP)</option>
                    <option value="static">Statis (Manual)</option>
                  </select>
                </div>
              )}

              {/* IP Input */}
              {(activeSettingsNodeData.type === 'pc' || activeSettingsNodeData.type === 'server' || activeSettingsNodeData.type === 'router') && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">IP Address</label>
                  <input 
                    type="text" 
                    value={activeSettingsNodeData.type === 'router' ? activeSettingsNodeData.data.eth0Ip : activeSettingsNodeData.data.ip}
                    disabled={activeSettingsNodeData.data.dhcp}
                    onChange={(e) => {
                      if (activeSettingsNodeData.type === 'router') {
                        updateNodeData(activeSettingsNodeData.id, { eth0Ip: e.target.value });
                      } else {
                        updateNodeData(activeSettingsNodeData.id, { ip: e.target.value });
                      }
                    }}
                    placeholder={activeSettingsNodeData.data.dhcp ? "Otomatis dari DHCP..." : "192.168.x.x"}
                    className={`w-full text-sm border rounded px-3 py-2 ${activeSettingsNodeData.data.dhcp ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-white text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'}`}
                  />
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setActiveSettingsNode(null)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2 rounded-lg transition-colors shadow-sm"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UI Modal Status / Diagnostik */}
      {activeStatusNodeData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm animate-in fade-in" onClick={() => setActiveStatusNode(null)}>
          <div className="bg-white p-5 rounded-2xl shadow-xl border border-slate-200 max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 flex items-center justify-center rounded-full border bg-slate-50">
                {activeStatusNodeData.data.status === '✅' && <CheckCircle2 size={28} className="text-emerald-500" />}
                {activeStatusNodeData.data.status === '❌' && <XCircle size={28} className="text-red-500" />}
                {activeStatusNodeData.data.status === '⚠️' && <AlertTriangle size={28} className="text-amber-500" />}
                {activeStatusNodeData.data.status === '💤' && <Moon size={28} className="text-slate-400" />}
              </div>
              <div>
                <h4 className="font-bold text-slate-800">Status {activeStatusNodeData.data.label}</h4>
                <p className="text-xs font-medium text-slate-500">Diagnostik Sistem</p>
              </div>
            </div>
            <p className="text-sm text-slate-700 bg-blue-50 p-3 rounded-lg border border-blue-100 leading-relaxed font-medium">
              {activeStatusNodeData.data.statusText || "Tidak ada informasi tersedia."}
            </p>
            <button 
              onClick={() => setActiveStatusNode(null)}
              className="mt-4 w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Browser Dialog */}
      {activeBrowserNode && <BrowserDialog nodeId={activeBrowserNode} />}

      {/* Live Cursors layer - only render if in a room */}
      {((isTeacher && useAuthStore.getState().teacherId) || (isViewer && useAuthStore.getState().viewingTeacherId)) && (
        <LiveCursors containerRef={reactFlowWrapper} />
      )}
    </div>
  );
}
