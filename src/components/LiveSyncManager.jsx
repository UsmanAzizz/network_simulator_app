'use client';

import { useEffect, useRef } from 'react';
import useAuthStore from '@/store/useAuthStore';
import useNetworkStore from '@/store/useNetworkStore';
import Pusher from 'pusher-js';

export default function LiveSyncManager() {
  const { isTeacher, teacherId, isViewer, viewingTeacherId } = useAuthStore();
  const { nodes, edges, layoutMode, setNodes, setEdges } = useNetworkStore();
  
  const isUpdatingFromSync = useRef(false);
  const pusherRef = useRef(null);

  // Initialize Pusher Client
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_PUSHER_KEY) return;
    
    pusherRef.current = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    });

    return () => {
      if (pusherRef.current) {
        pusherRef.current.disconnect();
      }
    };
  }, []);

  // 1. TEACHER: Broadcast changes and keep channel alive
  useEffect(() => {
    if (!isTeacher || !teacherId || !pusherRef.current) return;
    
    // Subscribe to own channel to keep it "occupied" in Pusher
    const channelName = `channel-${teacherId}`;
    const channel = pusherRef.current.subscribe(channelName);

    if (isUpdatingFromSync.current) return;

    const payload = {
      nodes,
      edges,
      layoutMode,
      timestamp: Date.now()
    };

    // Send broadcast via our Next.js API
    fetch('/api/broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teacherId, payload }),
    }).catch(err => console.error("Broadcast error:", err));

    return () => {
      if (pusherRef.current) pusherRef.current.unsubscribe(channelName);
    };
  }, [isTeacher, teacherId, nodes, edges, layoutMode]);

  // 2. VIEWER: Listen for changes
  useEffect(() => {
    if (!isViewer || !viewingTeacherId || !pusherRef.current) return;

    const channelName = `channel-${viewingTeacherId}`;
    const channel = pusherRef.current.subscribe(channelName);

    channel.bind('topology-update', (data) => {
      isUpdatingFromSync.current = true;
      
      setNodes(data.nodes || []);
      setEdges(data.edges || []);
      
      if (useNetworkStore.getState().layoutMode !== data.layoutMode) {
         useNetworkStore.getState().toggleLayoutMode();
      }

      setTimeout(() => {
        isUpdatingFromSync.current = false;
      }, 50);
    });

    return () => {
      if (pusherRef.current) {
        channel.unbind_all();
        pusherRef.current.unsubscribe(channelName);
      }
    };
  }, [isViewer, viewingTeacherId, setNodes, setEdges]);

  return null;
}
