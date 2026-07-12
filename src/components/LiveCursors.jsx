'use client';

import { useOthers, useUpdateMyPresence } from "@liveblocks/react";
import { useEffect } from "react";
import { MousePointer2 } from "lucide-react";
import { useReactFlow } from "@xyflow/react";

export default function LiveCursors({ containerRef }) {
  const others = useOthers();
  const updateMyPresence = useUpdateMyPresence();
  const { screenToFlowPosition, flowToScreenPosition } = useReactFlow();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handlePointerMove = (e) => {
      // Get pointer position translated to React Flow's zoom/pan coordinate system
      const flowPos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      updateMyPresence({ cursor: { x: flowPos.x, y: flowPos.y } });
    };

    const handlePointerLeave = () => {
      updateMyPresence({ cursor: null });
    };

    const handleCableStart = (e) => {
      updateMyPresence({ activeCable: e.detail });
    };
    
    const handleCableEnd = () => {
      updateMyPresence({ activeCable: null });
    };

    container.addEventListener("pointermove", handlePointerMove);
    container.addEventListener("pointerleave", handlePointerLeave);
    window.addEventListener("active-cable-start", handleCableStart);
    window.addEventListener("active-cable-end", handleCableEnd);

    return () => {
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("active-cable-start", handleCableStart);
      window.removeEventListener("active-cable-end", handleCableEnd);
    };
  }, [containerRef, updateMyPresence]);

  return (
    <>
      {others.map(({ connectionId, presence, info }) => {
        if (presence.cursor === null || !presence.cursor) {
          return null;
        }

        // Map the remote cursor from React Flow coordinate system back to local screen coordinates
        const screenPos = flowToScreenPosition({ x: presence.cursor.x, y: presence.cursor.y });
        
        let containerRect;
        if (containerRef.current) {
          containerRect = containerRef.current.getBoundingClientRect();
        } else {
          return null; // fallback
        }
        
        // Final position relative to our container
        const localX = screenPos.x - containerRect.left;
        const localY = screenPos.y - containerRect.top;

        let activeCableSvg = null;
        if (presence.activeCable && presence.activeCable.nodeId && presence.activeCable.handleId && containerRef.current) {
          const handleSelector = `[data-nodeid="${presence.activeCable.nodeId}"][data-handleid="${presence.activeCable.handleId}"]`;
          const handleEl = document.querySelector(handleSelector);
          
          if (handleEl) {
            const rect = handleEl.getBoundingClientRect();
            
            // Start point at center of the handle
            const startX = rect.left + rect.width / 2 - containerRect.left;
            const startY = rect.top + rect.height / 2 - containerRect.top;
            
            activeCableSvg = (
              <svg className="absolute inset-0 pointer-events-none z-[90]" style={{ width: '100%', height: '100%' }}>
                <path
                  d={`M ${startX} ${startY} L ${localX} ${localY}`}
                  stroke="#b1b1b7"
                  strokeWidth="2"
                  fill="none"
                  className="animate-pulse"
                />
              </svg>
            );
          }
        }

        return (
          <div key={connectionId}>
            {activeCableSvg}
            <div
              className="absolute z-[100] pointer-events-none flex flex-col items-center"
              style={{
                left: localX,
                top: localY,
                transition: "left 0.1s linear, top 0.1s linear"
              }}
            >
              <MousePointer2
                className="w-5 h-5"
                style={{ fill: info?.color || '#000', color: info?.color || '#000' }}
              />
              {info?.name && (
                <div
                  className="px-2 py-0.5 mt-2 text-xs text-white rounded-md whitespace-nowrap drop-shadow-md font-medium"
                  style={{ backgroundColor: info?.color || '#000' }}
                >
                  {info.name}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}
