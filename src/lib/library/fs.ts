export interface FsHandle {
  readonly kind: "file" | "directory";
  readonly name: string;
}

export interface FsFileHandle extends FsHandle {
  readonly kind: "file";
  getFile(): Promise<File>;
}

export interface FsDirHandle extends FsHandle {
  readonly kind: "directory";
  entries(): AsyncIterableIterator<[string, FsHandle]>;
  queryPermission?(descriptor?: {
    mode?: "read" | "readwrite";
  }): Promise<PermissionState>;
  requestPermission?(descriptor?: {
    mode?: "read" | "readwrite";
  }): Promise<PermissionState>;
}

export function asDir(handle: FsHandle | FileSystemDirectoryHandle): FsDirHandle {
  return handle as unknown as FsDirHandle;
}

export function asFile(handle: FsHandle): FsFileHandle {
  return handle as unknown as FsFileHandle;
}

export async function pickDirectory(): Promise<FsDirHandle | null> {
  const picker = window.showDirectoryPicker;
  if (typeof picker !== "function") return null;
  return asDir(await picker({ mode: "read" }));
}
