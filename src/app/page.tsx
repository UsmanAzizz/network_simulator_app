'use client';

import Header from '@/components/Header';
import NetworkCanvas from '@/components/NetworkCanvas';
import { ReactFlowProvider } from '@xyflow/react';
import { LiveblocksProvider } from '@liveblocks/react';
import LiveblocksRoomWrapper from '@/components/LiveblocksRoomWrapper';
import { liveblocksClient } from '@/store/useNetworkStore';

export default function Home() {
  return (
    <LiveblocksProvider client={liveblocksClient}>
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
      </main>
    </LiveblocksProvider>
  );
}
