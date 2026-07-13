'use client';

import Header from '@/components/Header';
import NetworkCanvas from '@/components/NetworkCanvas';
import { ReactFlowProvider } from '@xyflow/react';
import { LiveblocksProvider } from '@liveblocks/react';
import LiveblocksRoomWrapper from '@/components/LiveblocksRoomWrapper';
import DialogManager from '@/components/DialogManager';

export default function Home() {
  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
      <main className="w-full h-screen bg-slate-50 flex flex-col overflow-hidden">
        <Header />
        <div className="flex-1 flex overflow-hidden">
          <ReactFlowProvider>
            <div className="flex-1">
              <LiveblocksRoomWrapper>
                <NetworkCanvas />
              </LiveblocksRoomWrapper>
            </div>
          </ReactFlowProvider>
        </div>
        <DialogManager />
      </main>
    </LiveblocksProvider>
  );
}
