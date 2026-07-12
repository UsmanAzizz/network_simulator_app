import { create } from 'zustand';
import { applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react';
import { createClient } from "@liveblocks/client";
import { liveblocks } from "@liveblocks/zustand";

export const liveblocksClient = createClient({
  authEndpoint: "/api/liveblocks-auth",
});

const getZoneStyle = (type, mode) => {
  const isVert = mode === 'vertical';
  const zH = 200; // Fixed virtual height
  const base = {
    position: 'absolute',
    zIndex: -1,
    borderTopWidth: isVert ? '2px' : '0',
    borderTopStyle: isVert ? 'dashed' : 'none',
    borderLeftWidth: isVert ? '0' : '2px',
    borderLeftStyle: isVert ? 'none' : 'dashed',
    fontWeight: 'bold',
    opacity: 1,
    color: '#00000022',
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
  { id: 'zone-pc', type: 'zone', position: getZonePosition('pc', 'vertical'), data: { label: 'END DEVICE', color: 'rgba(59, 130, 246, 0.3)', solidColor: '#3b82f6' }, selectable: false, draggable: false, style: getZoneStyle('pc', 'vertical') },
];

const initialEdges = [];

const useNetworkStore = create(
  liveblocks(
    (set, get) => ({
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
  activeBrowserNode: null,
  setActiveBrowserNode: (nodeId) => set({ activeBrowserNode: nodeId }),
  
  selectedEdgeForDelete: null,
  setSelectedEdgeForDelete: (edge) => set({ selectedEdgeForDelete: edge }),

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
    if (changes.some(c => c.type === 'remove')) {
      get().recalculateIPs();
    }
  },

  onConnect: (connection) => {
    get().saveHistory();
    set({
      edges: addEdge({ ...connection, type: 'smoothstep' }, get().edges), 
    });
    get().recalculateIPs();
  },

  recalculateIPs: () => {
    set((state) => {
      const newNodes = JSON.parse(JSON.stringify(state.nodes)); // deep copy to ensure reactivity
      let newEdges = JSON.parse(JSON.stringify(state.edges));

      // 1. Reset dynamic IPs & Status
      newNodes.forEach(n => {
        if (n.type === 'router') { n.data.ip = ''; }
        if (n.type === 'switch') { n.data.ip = ''; }
        if (n.type === 'pc') { n.data.ip = ''; n.data.accessibleServers = []; }
        n.data.status = ''; // Clear status initially
        n.data.invalidIp = false; // Clear invalid IP flag
      });

      // Reset edge animations
      newEdges = newEdges.map(e => ({...e, animated: false, className: ''}));

      // Connection validation map (source -> valid targets)
      const validConnections = {
        'server': ['modem'],
        'modem': ['router', 'switch', 'pc'],
        'router': ['switch', 'router', 'pc'],
        'switch': ['switch', 'pc']
      };

      // Validate all edges
      newEdges.forEach(edge => {
        const sourceNode = newNodes.find(n => n.id === edge.source);
        const targetNode = newNodes.find(n => n.id === edge.target);
        if (sourceNode && targetNode) {
          const allowedTargets = validConnections[sourceNode.type] || [];
          if (!allowedTargets.includes(targetNode.type)) {
            // Mark invalid!
            edge.animated = true; // Make it dashed
            edge.className = 'animate-danger-cable';
            sourceNode.data.status = 'danger';
            targetNode.data.status = 'danger';
            targetNode.data.invalidIp = true; // Only target node gets IP blinking
          } else {
            // Valid connection!
            edge.animated = true; // keep standard running dash
            if (!sourceNode.data.status) sourceNode.data.status = 'success';
            if (!targetNode.data.status) targetNode.data.status = 'success';
          }
        }
      });

      // Helper to get targets (only follow valid paths)
      const getTargets = (sourceId) => newEdges
        .filter(e => e.source === sourceId && e.className !== 'animate-danger-cable')
        .map(e => newNodes.find(n => n.id === e.target)).filter(Boolean);

      // Helper to get sources (only follow valid paths)
      const getSources = (targetId) => newEdges
        .filter(e => e.target === targetId && e.className !== 'animate-danger-cable')
        .map(e => newNodes.find(n => n.id === e.source)).filter(Boolean);

      // 2. Propagate
      const modems = newNodes.filter(n => n.type === 'modem');
      modems.forEach(modem => {
        const modemServers = getSources(modem.id).filter(n => n.type === 'server').map(n => n.data.label);

        // Modem -> Router (MikroTik)
        const routers = getTargets(modem.id).filter(n => n.type === 'router');
        let routerSwDhcpCount = 10;
        let routerPcDhcpCount = 50;

        routers.forEach(router => {
          router.data.ip = '192.168.1.1'; // Router gets IP from Modem
          
          const switches = getTargets(router.id).filter(n => n.type === 'switch');
          switches.forEach(sw => {
            sw.data.ip = '192.168.88.2'; // Switch gets IP from MikroTik
            
            const pcs = getTargets(sw.id).filter(n => n.type === 'pc');
            pcs.forEach(pc => {
              pc.data.ip = `192.168.88.${routerSwDhcpCount}`;
              pc.data.accessibleServers = [...new Set([...(pc.data.accessibleServers || []), ...modemServers])];
              routerSwDhcpCount++;
            });
          });

          // Handle direct Router -> PC valid crossover connection
          const directPcs = getTargets(router.id).filter(n => n.type === 'pc');
          directPcs.forEach(pc => {
             pc.data.ip = `192.168.88.${routerPcDhcpCount}`;
             pc.data.accessibleServers = [...new Set([...(pc.data.accessibleServers || []), ...modemServers])];
             routerPcDhcpCount++;
          });
        });

        // Modem -> Switch (Bypass MikroTik, uses ISP DHCP)
        const modemSwitches = getTargets(modem.id).filter(n => n.type === 'switch');
        let modemSwDhcpCount = 20;
        let modemPcDhcpCount = 30;

        modemSwitches.forEach(sw => {
          sw.data.ip = '192.168.1.2';
          
          const pcs = getTargets(sw.id).filter(n => n.type === 'pc');
          pcs.forEach(pc => {
            pc.data.ip = `192.168.1.${modemSwDhcpCount}`;
            pc.data.accessibleServers = [...new Set([...(pc.data.accessibleServers || []), ...modemServers])];
            modemSwDhcpCount++;
          });
        });

        // Modem -> PC (Bypass MikroTik, uses ISP DHCP)
        const modemPcs = getTargets(modem.id).filter(n => n.type === 'pc');
        modemPcs.forEach(pc => {
           pc.data.ip = `192.168.1.${modemPcDhcpCount}`;
           pc.data.accessibleServers = [...new Set([...(pc.data.accessibleServers || []), ...modemServers])];
           modemPcDhcpCount++;
        });
      });

      return { nodes: newNodes, edges: newEdges };
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
      const cardH = 120; // Tinggi kartu baru
      const cardOffset = (zH - cardH) / 2;
      let basePos = 0;
      if (type === 'server') basePos = isVert ? cardOffset : 60;
      if (type === 'modem') basePos = isVert ? (zH) + cardOffset : 310;
      if (type === 'router') basePos = isVert ? (zH*2) + cardOffset : 560;
      if (type === 'switch') basePos = isVert ? (zH*3) + cardOffset : 810;
      if (type === 'pc') basePos = isVert ? (zH*4) + cardOffset : 1060;

      typeNodes.forEach((node, index) => {
        const offset = 80 + (index * 180); 
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
    } else if (type === 'modem') {
      const brandNames = ['Modem IndiHome', 'Modem Biznet', 'Modem FirstMedia', 'Modem MyRepublic', 'Modem Oxygen'];
      label = brandNames[(count - 1) % brandNames.length];
    } else if (type === 'router') {
      const brandNames = ['Router MikroTik'];
      label = brandNames[(count - 1) % brandNames.length];
    }

    const id = `${type}-${Date.now()}`; 

    const zH = 200;
    const cardH = 120; 
    const cardOffset = (zH - cardH) / 2;
    let basePos = 0;
    if (type === 'server') basePos = isVert ? cardOffset : 60;
    if (type === 'modem') basePos = isVert ? (zH) + cardOffset : 310;
    if (type === 'router') basePos = isVert ? (zH*2) + cardOffset : 560;
    if (type === 'switch') basePos = isVert ? (zH*3) + cardOffset : 810;
    if (type === 'pc') basePos = isVert ? (zH*4) + cardOffset : 1060;

    let defaultData = { label, statusText: '' };
    if (type === 'server') {
      defaultData = { label, index: count, ip: `8.8.8.${count*8}`, statusText: '' };
    } else if (type === 'router') {
      defaultData = { label, index: count, eth0Ip: '192.168.1.1', eth1Ip: '10.0.0.1', statusText: '' };
    } else if (type === 'pc') {
      defaultData = { label, index: count, ip: '', gateway: '192.168.1.1', dhcp: false, statusText: '', accessibleServers: [] };
    } else if (type === 'switch') {
      defaultData = { label, index: count, ports: 24, statusText: '' };
    } else if (type === 'modem') {
      const isps = ['IndiHome', 'Biznet', 'First Media', 'MyRepublic'];
      const isp = isps[(count - 1) % isps.length];
      defaultData = { label: isp, index: count, dhcp: false, statusText: '' };
    }

    const offset = 80 + ((count-1) * 180);
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
    get().recalculateIPs();
  },

  removeNode: (nodeId) => {
    get().saveHistory();
    const { nodes, edges, recalculatePositions } = get();
    
    const remainingNodes = nodes.filter(n => n.id !== nodeId);
    
    set({ 
      nodes: recalculatePositions(remainingNodes),
      edges: edges.filter(e => e.source !== nodeId && e.target !== nodeId)
    });
    get().recalculateIPs();
  },
  
  syncPayload: "{}",
  setSyncPayload: (payload) => set({ syncPayload: payload })
}),
{
  client: liveblocksClient,
  storageMapping: { 
    syncPayload: true
  }
}));

export default useNetworkStore;
