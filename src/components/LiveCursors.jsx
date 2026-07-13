'use client';

import { useOthers, useUpdateMyPresence } from "@liveblocks/react";
import { useEffect } from "react";
import { MousePointer2 } from "lucide-react";
import { useReactFlow } from "@xyflow/react";

const VIBRANT_COLORS = [
  '#f43f5e', // rose
  '#a855f7', // purple
  '#3b82f6', // blue
  '#0ea5e9', // sky
  '#f59e0b', // amber
  '#ec4899', // pink
  '#8b5cf6', // violet
  '#ef4444', // red
];

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

    const handleCableStart = (e) => {
      updateMyPresence({ activeCable: e.detail });
    };
    
    const handleCableEnd = () => {
      updateMyPresence({ activeCable: null });
    };

    container.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("active-cable-start", handleCableStart);
    window.addEventListener("active-cable-end", handleCableEnd);

    return () => {
      container.removeEventListener("pointermove", handlePointerMove);
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

          const isOriginalTeacher = presence.isTeacher && presence.name === 'Usman Aziz, S.Kom.';
          const cursorColor = isOriginalTeacher 
            ? '#10b981' // Green for original teacher
            : VIBRANT_COLORS[connectionId % VIBRANT_COLORS.length]; // Random vibrant for others

          return (
            <div key={connectionId}>
              {activeCableSvg}
              <div
                className="absolute z-[100] pointer-events-none"
                style={{
                  left: localX,
                  top: localY,
                  transition: "left 0.1s linear, top 0.1s linear"
                }}
              >
                <MousePointer2
                  className="w-5 h-5 absolute top-0 left-0"
                  style={{ 
                    fill: cursorColor, 
                    color: cursorColor,
                    transform: 'translate(-2px, -2px)' // align the actual tip of the lucide icon to the origin
                  }}
                />
                { (presence.name || info?.name) && (
                  <div
                    className="px-2 py-0.5 mt-5 ml-4 text-xs text-white rounded-md whitespace-nowrap drop-shadow-md font-medium"
                    style={{ backgroundColor: cursorColor }}
                  >
                    {presence.name || info?.name}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </>
    );
  }
