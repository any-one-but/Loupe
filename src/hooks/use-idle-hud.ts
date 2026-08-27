import { useEffect } from "react";
import { useViewer } from "@/store/viewer";

export function useIdleHud() {
  useEffect(() => {
    let frame = 0;
    const tick = () => {
      const s = useViewer.getState();
      const idle = Date.now() > s.hudUntil;
      if (s.view === "loupe" && !s.help && idle) {
        if (!s.cursorHidden) s.setCursorHidden(true);
      } else if (s.cursorHidden && s.view !== "loupe") {
        s.setCursorHidden(false);
      }
      frame = window.setTimeout(tick, 200);
    };
    frame = window.setTimeout(tick, 200);

    const bump = () => useViewer.getState().bumpHud();
    window.addEventListener("mousemove", bump);
    return () => {
      window.clearTimeout(frame);
      window.removeEventListener("mousemove", bump);
    };
  }, []);
}
