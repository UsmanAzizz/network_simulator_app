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

  return (
    <RoomProvider id={roomId} initialPresence={{ cursor: null, isDrawing: false, activeCable: null }}>
      <ClientSideSuspense fallback={<div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50 text-white font-mono">Memasuki Kelas Virtual...</div>}>
        {() => children}
      </ClientSideSuspense>
    </RoomProvider>
  );
}
