import { libraryFromDirectory, libraryFromFileList } from "./scan";
import { saveDirectoryHandle } from "./idb";
import { pickDirectory } from "./fs";
import { useViewer } from "@/store/viewer";

export const FOLDER_INPUT_ID = "loupe-folder-input";

export function loadFromFileList(list: FileList | File[] | null, rootName?: string) {
  if (!list || (list as FileList).length === 0) return;
  const library = libraryFromFileList(list, rootName ?? "Local library");
  useViewer.getState().setLibrary(library);
}

export async function pickLocalLibrary() {
  const viewer = useViewer.getState();

  try {
    const handle = await pickDirectory();
    if (handle) {
      await saveDirectoryHandle(handle);
      viewer.setScanning({ count: 0, label: handle.name });
      const library = await libraryFromDirectory(handle, (count, label) => {
        viewer.setScanning({ count, label });
      });
      viewer.setScanning(null);
      viewer.setLibrary(library);
      return;
    }
  } catch (error) {
    const name = (error as { name?: string }).name;
    if (name === "AbortError") return;
  }

  document.getElementById(FOLDER_INPUT_ID)?.click();
}
