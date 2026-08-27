import { useEffect } from "react";
import { loadDirectoryHandle } from "@/lib/library/idb";
import { libraryFromDirectory } from "@/lib/library/scan";
import { useViewer } from "@/store/viewer";

export function useHydrateLoupe() {
  useEffect(() => {
    void Promise.resolve(useViewer.persist.rehydrate());

    void (async () => {
      try {
        const handle = await loadDirectoryHandle();
        if (!handle) return;
        const permission = handle.queryPermission
          ? await handle.queryPermission({ mode: "read" })
          : "granted";
        if (permission !== "granted") return;
        useViewer.getState().setScanning({ count: 0, label: handle.name });
        const library = await libraryFromDirectory(handle, (count, label) => {
          useViewer.getState().setScanning({ count, label });
        });
        useViewer.getState().setScanning(null);
        if (library.artists.length) {
          useViewer.getState().setLibrary(library);
        }
      } catch {
        useViewer.getState().setScanning(null);
      }
    })();
  }, []);
}
