'use client';

import { useEffect, useState } from 'react';
import useAuthStore from '@/store/useAuthStore';
import { liveblocksClient } from '@/store/useNetworkStore';
import { RoomProvider } from '@liveblocks/react';
import { ClientSideSuspense } from '@liveblocks/react';
import useNetworkStore from '@/store/useNetworkStore';

export default function LiveblocksRoomWrapper({ children }) {
  const { isTeacher, teacherId, isViewer, viewingTeacherId, isTeacherOnboarding } = useAuthStore();
  
  let roomId = null;
  if (isTeacher && teacherId) {
    roomId = `room-${teacherId}`;
  } else if (isViewer && viewingTeacherId) {
    roomId = `room-${viewingTeacherId}`;
  }

  useEffect(() => {
    if (roomId) {
      // Bind Zustand store to the Liveblocks room!
      const leaveZustandRoom = useNetworkStore.getState().liveblocks.enterRoom(roomId);
      
      // Note: we don't need to manually call liveblocksClient.enterRoom anymore because 
      // RoomProvider handles the hooks connection, and the store handles its own!
      return () => {
        leaveZustandRoom();
      };
    }
  }, [roomId]);

  if (isTeacherOnboarding || (!isTeacher && !isViewer)) {
    // Solo mode, no room needed
    return <>{children}</>;
  }

  if (!roomId) {
    return <>{children}</>;
  }

function LiveSyncListener({ children }) {
  const { isTeacher, isViewer } = useAuthStore();
  const syncPayload = useNetworkStore(state => state.syncPayload);
  const setSyncPayload = useNetworkStore(state => state.setSyncPayload);

  // For Teacher: write changes to syncPayload
  useEffect(() => {
    if (!isTeacher) return;
    return useNetworkStore.subscribe((state, prevState) => {
      if (
        state.nodes !== prevState.nodes || 
        state.edges !== prevState.edges || 
        state.layoutMode !== prevState.layoutMode || 
        state.activeBrowserNode !== prevState.activeBrowserNode || 
        state.activeSettingsNode !== prevState.activeSettingsNode || 
        state.activeStatusNode !== prevState.activeStatusNode || 
        state.selectedEdgeForDelete !== prevState.selectedEdgeForDelete
      ) {
        const payload = JSON.stringify({
          nodes: state.nodes,
          edges: state.edges,
          layoutMode: state.layoutMode,
          activeBrowserNode: state.activeBrowserNode,
          activeSettingsNode: state.activeSettingsNode,
          activeStatusNode: state.activeStatusNode,
          selectedEdgeForDelete: state.selectedEdgeForDelete
        });
        
        if (state.syncPayload !== payload) {
           setSyncPayload(payload);
        }
      }
    });
  }, [isTeacher, setSyncPayload]);

  // For Student: read changes from syncPayload
  useEffect(() => {
    if (!isViewer || !syncPayload || syncPayload === "{}") return;
    try {
      const data = JSON.parse(syncPayload);
      // Update local state without triggering another sync
      useNetworkStore.setState(data);
    } catch (e) {
      console.error("Failed to sync payload", e);
    }
  }, [syncPayload, isViewer]);

  return <>{children}</>;
}

  return (
    <RoomProvider id={roomId} initialPresence={{ cursor: null, isDrawing: false, activeCable: null }}>
      <ClientSideSuspense fallback={<div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50 text-white font-mono">Memasuki Kelas Virtual...</div>}>
        {() => (
          <LiveSyncListener>
            {children}
          </LiveSyncListener>
        )}
      </ClientSideSuspense>
    </RoomProvider>
  );
}
