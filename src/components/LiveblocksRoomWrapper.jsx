'use client';

import { useEffect, useState } from 'react';
import useAuthStore from '@/store/useAuthStore';
import { liveblocksClient } from '@/store/useNetworkStore';
import { RoomProvider, useOthers, useUpdateMyPresence, useSelf } from '@liveblocks/react';
import { ClientSideSuspense } from '@liveblocks/react';
import useNetworkStore from '@/store/useNetworkStore';
import useDialogStore from '@/store/useDialogStore';

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
  const { showAlert } = useDialogStore();
  const syncPayload = useNetworkStore(state => state.syncPayload);
  const setSyncPayload = useNetworkStore(state => state.setSyncPayload);
  const setTriggerTakeover = useNetworkStore(state => state.setTriggerTakeover);
  const setOnlineStudents = useNetworkStore(state => state.setOnlineStudents);
  
  const others = useOthers();
  const updateMyPresence = useUpdateMyPresence();

  // Sync online students to store for the Teacher UI
  useEffect(() => {
    if (others) {
      const students = others
        .filter(o => !o.presence?.isTeacher && o.presence?.name && o.presence.name.trim() !== '')
        .map(o => ({
          connectionId: o.connectionId,
          name: o.presence.name,
        }));
      setOnlineStudents(students);
    }
  }, [others, setOnlineStudents]);

    // For Teacher: Handle being taken over by a student
    useEffect(() => {
      // Original teacher detecting student taking over
      if (isTeacher && useAuthStore.getState().teacherName === 'Usman Aziz, S.Kom.' && others) {
        const taker = others.find(o => o.presence?.isTakingOver);
        if (taker) {
          showAlert(`${taker.presence?.name || 'Seorang siswa'} telah mengambil alih siaran! Anda sekarang menjadi penonton.`, "Siaran Diambil Alih");
          useAuthStore.setState({ 
            isTeacher: false, 
            isViewer: true, 
            viewingTeacherId: useAuthStore.getState().teacherId 
          });
        }
      }

      // Student host detecting original teacher taking back control
      if (isTeacher && useAuthStore.getState().teacherName !== 'Usman Aziz, S.Kom.' && others) {
        const originalTeacher = others.find(o => o.presence?.isTeacher && !o.presence?.isTakingOver);
        if (originalTeacher) {
          showAlert("Guru telah mengambil alih kembali siaran. Anda sekarang kembali menjadi penonton.", "Siaran Diputus");
          useAuthStore.setState({ 
            isTeacher: false, 
            isViewer: true, 
            viewingTeacherId: useAuthStore.getState().teacherId 
          });
          updateMyPresence({ isTakingOver: false, isTeacher: false });
        }
      }
    }, [isTeacher, others, updateMyPresence]);

  // For Student: Observe if Teacher allowed them to takeover
  const self = useSelf();
  
  useEffect(() => {
    if (isViewer && others && self) {
      const teacher = others.find(o => o.presence?.isTeacher);
      if (teacher && teacher.presence?.allowedTakeoverId === self.connectionId) {
        // Teacher allowed ME to takeover!
        // Prevent infinite loops by checking a ref or just executing once
        const auth = useAuthStore.getState();
        if (auth.isViewer) {
          showAlert("Guru telah memberikan Anda kendali untuk melakukan Live Broadcast!", "Kendali Diberikan");
          
          useAuthStore.setState({ 
            isTeacher: true, 
            teacherId: auth.viewingTeacherId, 
            teacherName: auth.studentName || 'Siswa',
            isViewer: false,
            viewingTeacherId: ''
          });

          updateMyPresence({ isTakingOver: true });
          
          // Let the store know to clear allowedTakeoverId since we took it
          const triggerTakeover = useNetworkStore.getState().grantTakeover;
          if (triggerTakeover) {
             triggerTakeover(null);
          }
        }
      }
    }
  }, [isViewer, others, self, updateMyPresence]);

  // Expose triggerTakeover so Header can call it
  useEffect(() => {
    setTriggerTakeover(() => {
      // 1. Announce intention to take over
      updateMyPresence({ isTakingOver: true });
      
          isTeacher: true, 
          teacherId: auth.viewingTeacherId, 
          teacherName: auth.studentName || 'Siswa',
          isViewer: false,
          viewingTeacherId: ''
        });
      }, 800);
    });
    
    // Also expose grantTakeover for Teacher
    useNetworkStore.getState().setGrantTakeover((connectionId) => {
      updateMyPresence({ allowedTakeoverId: connectionId });
    });
  }, [setTriggerTakeover, updateMyPresence]);

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
    <RoomProvider id={roomId} initialPresence={{ 
      cursor: null, 
      isDrawing: false, 
      activeCable: null, 
      name: useAuthStore.getState().studentName || useAuthStore.getState().teacherName || null,
      isTeacher: useAuthStore.getState().isTeacher
    }}>
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
