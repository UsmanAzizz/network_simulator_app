'use client';

import Header from '@/components/Header';
import NetworkCanvas from '@/components/NetworkCanvas';
import DeviceSidebar from '@/components/DeviceSidebar';
import { ReactFlowProvider } from '@xyflow/react';

export default function Home() {
  return (
    <main className="w-full h-screen bg-slate-50 flex flex-col overflow-hidden">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <ReactFlowProvider>
          <DeviceSidebar />
          <div className="flex-1">
            <NetworkCanvas />
          </div>
        </ReactFlowProvider>
      </div>
    </main>
  );
}
