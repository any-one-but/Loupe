import { useEffect } from "react";
import { currentFile, currentSet, useViewer } from "@/store/viewer";

export function usePreload() {
  const fileId = useViewer((s) => currentFile(s)?.id);

  useEffect(() => {
    const s = useViewer.getState();
    const files = currentSet(s)?.files ?? [];
    const i = s.fileIndex;
    for (const delta of [-1, 1, 2]) {
      const file = files[i + delta];
      if (file?.kind === "image" && file.url) {
        const img = new Image();
        img.src = file.url;
      }
    }
  }, [fileId]);
}
