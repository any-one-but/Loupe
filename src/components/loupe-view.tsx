import { useRef } from "react";
import { MediaStage } from "./media-stage";
import { useViewer } from "@/store/viewer";

export function LoupeView() {
  const start = useRef<{ x: number; y: number; t: number } | null>(null);
  const lastTap = useRef(0);

  return (
    <div
      className="absolute inset-0 touch-none"
      onPointerDown={(event) => {
        start.current = { x: event.clientX, y: event.clientY, t: Date.now() };
      }}
      onPointerUp={(event) => {
        if (!start.current) return;
        const dx = event.clientX - start.current.x;
        const dy = event.clientY - start.current.y;
        const dt = Date.now() - start.current.t;
        start.current = null;
        const s = useViewer.getState();
        if (dt > 850) return;
        if (Math.abs(dx) < 36 && Math.abs(dy) < 36) {
          const now = Date.now();
          if (now - lastTap.current < 280) {
            s.cycleZoom();
            lastTap.current = 0;
            return;
          }
          lastTap.current = now;
          s.bumpHud();
          return;
        }
        if (Math.abs(dx) > Math.abs(dy)) {
          if (dx < 0) s.nextFile();
          else s.prevFile();
        } else if (dy < 0) {
          s.nextSet();
        } else {
          s.prevSet();
        }
      }}
    >
      <MediaStage />
    </div>
  );
}
