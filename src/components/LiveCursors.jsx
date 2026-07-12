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

    container.addEventListener("pointermove", handlePointerMove);
    container.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [containerRef, updateMyPresence]);

  return (
    <>
      {others.map(({ connectionId, presence, info }) => {
        if (presence.cursor === null || !presence.cursor) {
          return null;
        }

        return (
          <div
            key={connectionId}
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
        );
      })}
    </>
  );
}
