import { create } from 'zustand';
import { applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react';

const getZoneStyle = (type, mode) => {
  const isVert = mode === 'vertical';
  const zH = 200; // Fixed virtual height
  const base = {
    position: 'absolute',
    zIndex: -1,
    borderTop: isVert ? '2px dashed' : 'none',
    borderLeft: isVert ? 'none' : '2px dashed',
    fontWeight: 'bold',
    opacity: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingLeft: '30px',
    fontSize: '3.5rem',
    textAlign: 'left',
    textTransform: 'uppercase',
    userSelect: 'none',
    pointerEvents: 'none',
    width: isVert ? 10000 : 250, height: isVert ? zH : 10000 
  };

  if (type === 'server') {
    return { ...base, backgroundColor: '#fdf4ff', borderColor: '#e879f9' };
  }
  if (type === 'modem') {
    return { ...base, backgroundColor: '#fffbeb', borderColor: '#fbbf24' };
  }
  if (type === 'router') {
    return { ...base, backgroundColor: '#fee2e2', borderColor: '#f87171' };
  }
  if (type === 'switch') {
    return { ...base, backgroundColor: '#ecfdf5', borderColor: '#34d399' };
  }
  if (type === 'pc') {
    return { ...base, backgroundColor: '#eff6ff', borderColor: '#60a5fa', width: isVert ? 10000 : 250, height: isVert ? zH : 10000 };
  }
};

const getZonePosition = (type, mode, containerHeight = 1000) => {
  const isVert = mode === 'vertical';
  const zH = 200; // Fixed virtual height (1000 / 5)
  if (type === 'server') return { x: 0, y: 0 };
  if (type === 'modem') return isVert ? { x: 0, y: zH } : { x: 250, y: 0 };
  if (type === 'router') return isVert ? { x: 0, y: zH * 2 } : { x: 500, y: 0 };
  if (type === 'switch') return isVert ? { x: 0, y: zH * 3 } : { x: 750, y: 0 };
  if (type === 'pc')    return isVert ? { x: 0, y: zH * 4 } : { x: 1000, y: 0 };
  return { x: 0, y: 0 };
};

const initialNodes = [
  { id: 'zone-server', type: 'zone', position: getZonePosition('server', 'vertical'), data: { label: 'INTERNET', color: 'rgba(217, 70, 239, 0.3)', solidColor: '#d946ef' }, selectable: false, draggable: false, style: getZoneStyle('server', 'vertical') },
  { id: 'zone-modem', type: 'zone', position: getZonePosition('modem', 'vertical'), data: { label: 'GATEWAY', color: 'rgba(245, 158, 11, 0.3)', solidColor: '#f59e0b' }, selectable: false, draggable: false, style: getZoneStyle('modem', 'vertical') },
  { id: 'zone-router', type: 'zone', position: getZonePosition('router', 'vertical'), data: { label: 'ROUTER', color: 'rgba(239, 68, 68, 0.3)', solidColor: '#ef4444' }, selectable: false, draggable: false, style: getZoneStyle('router', 'vertical') },
  { id: 'zone-switch', type: 'zone', position: getZonePosition('switch', 'vertical'), data: { label: 'SWITCH', color: 'rgba(16, 185, 129, 0.3)', solidColor: '#10b981' }, selectable: false, draggable: false, style: getZoneStyle('switch', 'vertical') },
  { id: 'zone-pc', type: 'zone', position: getZonePosition('pc', 'vertical'), data: { label: 'ENDPOINT', color: 'rgba(59, 130, 246, 0.3)', solidColor: '#3b82f6' }, selectable: false, draggable: false, style: getZoneStyle('pc', 'vertical') },
];

const initialEdges = [];

const useNetworkStore = create((set, get) => ({
  nodes: initialNodes,
  edges: initialEdges,
  
  layoutMode: 'vertical',
  
  toggleLayoutMode: () => {
    const newMode = get().layoutMode === 'vertical' ? 'horizontal' : 'vertical';
    get().saveHistory();
    set({ layoutMode: newMode });
    
    // Auto-recalc with new mode
    const updatedNodes = get().recalculatePositions(get().nodes);
    set({ nodes: updatedNodes });
  },

  history: [],
  historyIndex: -1,

  activeSettingsNode: null,
  activeStatusNode: null,

  containerHeight: 800,
  
  setContainerHeight: (height) => {
    set({ containerHeight: height });
    const { nodes, recalculatePositions } = get();
    // Update posisi semua node saat layar resize
    set({ nodes: recalculatePositions(nodes) });
  },

  aiMessage: '',
  isAiLoading: false,
  currentIssues: [],

  setAiMessage: (msg) => set({ aiMessage: msg }),
  setIsAiLoading: (loading) => set({ isAiLoading: loading }),
  setCurrentIssues: (issues) => set({ currentIssues: issues }),

  setActiveSettingsNode: (nodeId) => set({ activeSettingsNode: nodeId }),
  setActiveStatusNode: (nodeId) => set({ activeStatusNode: nodeId }),

  saveHistory: () => {
    const { nodes, edges, history, historyIndex, layoutMode } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ nodes, edges, layoutMode });
    set({ history: newHistory, historyIndex: newHistory.length - 1 });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const previousState = history[newIndex];
      set({ 
        nodes: previousState.nodes, 
        edges: previousState.edges, 
        layoutMode: previousState.layoutMode,
        historyIndex: newIndex 
      });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const nextState = history[newIndex];
      set({ 
        nodes: nextState.nodes, 
        edges: nextState.edges,
        layoutMode: nextState.layoutMode,
        historyIndex: newIndex 
      });
    }
  },

  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },

  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },

  onConnect: (connection) => {
    get().saveHistory();
    set({
      edges: addEdge({ ...connection, type: 'smoothstep' }, get().edges), // Default to smoothstep
    });
  },

  setNodes: (nodes) => {
    get().saveHistory();
    set({ nodes });
  },

  setEdges: (edges) => {
    get().saveHistory();
    set({ edges });
  },
  
  updateNodeData: (nodeId, dataUpdate) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId) {
          return { ...node, data: { ...node.data, ...dataUpdate } };
        }
        return node;
      })
    });
  },

  recalculatePositions: (currentNodes) => {
    const { layoutMode, containerHeight } = get();
    const isVert = layoutMode === 'vertical';
    let updatedNodes = [...currentNodes];

    updatedNodes = updatedNodes.map(node => {
      if (node.id === 'zone-server') return { ...node, style: getZoneStyle('server', layoutMode), position: getZonePosition('server', layoutMode) };
      if (node.id === 'zone-modem') return { ...node, style: getZoneStyle('modem', layoutMode), position: getZonePosition('modem', layoutMode) };
      if (node.id === 'zone-router') return { ...node, style: getZoneStyle('router', layoutMode), position: getZonePosition('router', layoutMode) };
      if (node.id === 'zone-switch') return { ...node, style: getZoneStyle('switch', layoutMode), position: getZonePosition('switch', layoutMode) };
      if (node.id === 'zone-pc') return { ...node, style: getZoneStyle('pc', layoutMode), position: getZonePosition('pc', layoutMode) };
      return node;
    });

    const types = ['server', 'modem', 'router', 'switch', 'pc'];

    types.forEach(type => {
      const typeNodes = updatedNodes.filter(n => n.type === type).sort((a, b) => {
        const numA = a.data.index !== undefined ? a.data.index : (parseInt(a.data.label.replace(/[^0-9]/g, ''), 10) || 0);
        const numB = b.data.index !== undefined ? b.data.index : (parseInt(b.data.label.replace(/[^0-9]/g, ''), 10) || 0);
        return numA - numB;
      });

      const zH = 200;
      const cardH = 90; // Tinggi kartu ultra-kompak
      const cardOffset = (zH - cardH) / 2;
      
      let basePos = 0;
      if (type === 'server') basePos = isVert ? cardOffset : 60;
      if (type === 'modem') basePos = isVert ? (zH) + cardOffset : 310;
      if (type === 'router') basePos = isVert ? (zH*2) + cardOffset : 560;
      if (type === 'switch') basePos = isVert ? (zH*3) + cardOffset : 810;
      if (type === 'pc') basePos = isVert ? (zH*4) + cardOffset : 1060;

      typeNodes.forEach((node, index) => {
        const offset = 120 + (index * 160); 
        let newPos = {};
        if (isVert) {
          newPos = { x: offset, y: basePos };
        } else {
          newPos = { x: basePos, y: offset };
        }
        
        const nodeIndex = updatedNodes.findIndex(n => n.id === node.id);
        if (nodeIndex !== -1) {
          updatedNodes[nodeIndex] = { ...updatedNodes[nodeIndex], position: newPos };
        }
      });
    });

    return updatedNodes;
  },

  addNode: (type) => {
    const { nodes, recalculatePositions, layoutMode } = get();
    const isVert = layoutMode === 'vertical';
    
    const typeNodes = nodes.filter(n => n.type === type);
    const existingNumbers = typeNodes.map(n => n.data.index !== undefined ? n.data.index : (parseInt(n.data.label.replace(/[^0-9]/g, ''), 10) || 0));
    const missingIntegers = Array.from({ length: 100 }, (_, i) => i + 1)
      .filter(num => !existingNumbers.includes(num));
    
    const count = missingIntegers.length > 0 ? missingIntegers[0] : 1;
    
    let label = `${type.toUpperCase()} ${count}`;
    if (type === 'server') {
      const brandNames = ['Server YouTube', 'Server TikTok', 'Server Roblox', 'Server Instagram', 'Server WhatsApp'];
      label = brandNames[(count - 1) % brandNames.length];
    }

    const id = `${type}-${Date.now()}`; 

    const zH = 200;
    const cardH = 90; 
    const cardOffset = (zH - cardH) / 2;

    let basePos = 0;
    if (type === 'server') basePos = isVert ? cardOffset : 60;
    if (type === 'modem') basePos = isVert ? (zH) + cardOffset : 310;
    if (type === 'router') basePos = isVert ? (zH*2) + cardOffset : 560;
    if (type === 'switch') basePos = isVert ? (zH*3) + cardOffset : 810;
    if (type === 'pc') basePos = isVert ? (zH*4) + cardOffset : 1060;

    let defaultData = { label, index: count, ip: '', gateway: '', dhcp: false, statusText: '' };
    if (type === 'pc') {
      defaultData = { label, index: count, ip: `192.168.1.${10 + count}`, gateway: '192.168.1.1', dhcp: true, statusText: '' };
    } else if (type === 'router') {
      defaultData = { label, index: count, eth0Ip: '192.168.1.1', wanIp: 'DHCP', dhcp: false, statusText: '' };
    } else if (type === 'server') {
      defaultData = { label, index: count, ip: '8.8.8.8', dhcp: false, statusText: '' };
    } else if (type === 'modem') {
      defaultData = { label, index: count, dhcp: false, statusText: '' };
    }

    const offset = 120 + ((count-1) * 160);
    const newNode = {
      id,
      type,
      position: isVert ? { x: offset, y: basePos } : { x: basePos, y: offset },
      data: defaultData,
    };

    get().saveHistory();
    const newNodes = [...nodes, newNode];
    set({ nodes: recalculatePositions(newNodes) });
  },

  removeEdge: (edgeId) => {
    get().saveHistory();
    set({ edges: get().edges.filter(e => e.id !== edgeId) });
  },

  removeNode: (nodeId) => {
    get().saveHistory();
    const { nodes, edges, recalculatePositions } = get();
    
    const remainingNodes = nodes.filter(n => n.id !== nodeId);
    
    set({ 
      nodes: recalculatePositions(remainingNodes),
      edges: edges.filter(e => e.source !== nodeId && e.target !== nodeId)
    });
  }
}));

export default useNetworkStore;
