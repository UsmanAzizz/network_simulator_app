'use client';

import { useEffect, useRef } from 'react';
import useAuthStore from '@/store/useAuthStore';
import useNetworkStore from '@/store/useNetworkStore';

export default function LiveSyncManager() {
  const { isTeacher, teacherId, isViewer, viewingTeacherId } = useAuthStore();
  const { nodes, edges, layoutMode, setNodes, setEdges, toggleLayoutMode } = useNetworkStore();
  
  // Track if we are currently ignoring local store updates to prevent infinite loops during viewer mode
  const isUpdatingFromSync = useRef(false);

  // 1. TEACHER: Broadcast changes to localStorage
  useEffect(() => {
    if (!isTeacher || !teacherId) return;
    
    if (isUpdatingFromSync.current) return; // Prevent echoing back own reads if any

    const stateToBroadcast = {
      nodes,
      edges,
      layoutMode,
      timestamp: Date.now()
    };

    localStorage.setItem(`broadcast_${teacherId}`, JSON.stringify(stateToBroadcast));

    // Also update online heartbeat
    const onlineStr = localStorage.getItem('online_teachers');
    if (onlineStr) {
      let online = JSON.parse(onlineStr);
      if (online[teacherId]) {
        online[teacherId].lastActive = Date.now();
        localStorage.setItem('online_teachers', JSON.stringify(online));
      }
    }
  }, [isTeacher, teacherId, nodes, edges, layoutMode]);

  // 2. VIEWER: Listen for changes
  useEffect(() => {
    if (!isViewer || !viewingTeacherId) return;

    const pullData = () => {
      const broadcastStr = localStorage.getItem(`broadcast_${viewingTeacherId}`);
      if (broadcastStr) {
        try {
          const data = JSON.parse(broadcastStr);
          isUpdatingFromSync.current = true;
          
          setNodes(data.nodes || []);
          setEdges(data.edges || []);
          
          if (useNetworkStore.getState().layoutMode !== data.layoutMode) {
             useNetworkStore.getState().toggleLayoutMode();
          }

          setTimeout(() => {
            isUpdatingFromSync.current = false;
          }, 50);
        } catch (e) {
          console.error("Error parsing broadcast data", e);
        }
      }
    };

    // Initial pull
    pullData();

    // Listen to storage events from other tabs
    const handleStorage = (e) => {
      if (e.key === `broadcast_${viewingTeacherId}`) {
        pullData();
      }
    };
    
    window.addEventListener('storage', handleStorage);
    
    // Fallback polling for same-tab tests (since storage event only fires across tabs)
    const interval = setInterval(() => {
       pullData();
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, [isViewer, viewingTeacherId, setNodes, setEdges]);

  return null;
}
