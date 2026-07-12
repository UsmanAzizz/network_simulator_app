'use client';

import { useOthers, useUpdateMyPresence } from "@liveblocks/react";
import { useEffect } from "react";
import { MousePointer2 } from "lucide-react";

export default function LiveCursors({ containerRef }) {
  const others = useOthers();
  const updateMyPresence = useUpdateMyPresence();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handlePointerMove = (e) => {
      // Get pointer position relative to container
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      updateMyPresence({ cursor: { x, y } });
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

        let activeCableSvg = null;
        if (presence.activeCable && presence.activeCable.nodeId && presence.activeCable.handleId && containerRef.current) {
          const handleSelector = `[data-nodeid="${presence.activeCable.nodeId}"][data-handleid="${presence.activeCable.handleId}"]`;
          const handleEl = document.querySelector(handleSelector);
          
          if (handleEl) {
            const rect = handleEl.getBoundingClientRect();
            const containerRect = containerRef.current.getBoundingClientRect();
            
            // Start point at center of the handle
            const startX = rect.left + rect.width / 2 - containerRect.left;
            const startY = rect.top + rect.height / 2 - containerRect.top;
            
            activeCableSvg = (
              <svg className="absolute inset-0 pointer-events-none z-[90]" style={{ width: '100%', height: '100%' }}>
                <path
                  d={`M ${startX} ${startY} L ${presence.cursor.x} ${presence.cursor.y}`}
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
                left: presence.cursor.x,
                top: presence.cursor.y,
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
