export type MediaKind = "image" | "video";

export type ViewMode = "loupe" | "library";

export type ZoomMode = "fit" | "fill";

export type LibrarySource = "local";

export interface MediaFile {
  id: string;
  name: string;
  url: string;
  kind: MediaKind;
  artistId: string;
  setId: string;
}

export interface MediaSet {
  id: string;
  name: string;
  artistId: string;
  files: MediaFile[];
  coverUrl: string;
}

export interface Artist {
  id: string;
  name: string;
  sets: MediaSet[];
}

export interface Library {
  artists: Artist[];
  source: LibrarySource;
  rootName: string;
}

export const IMAGE_EXT = /\.(jpe?g|png|webp|gif|avif|bmp|jfif)$/i;
export const VIDEO_EXT = /\.(mp4|webm|mov|m4v|ogv)$/i;

export function mediaKind(name: string): MediaKind | null {
  if (IMAGE_EXT.test(name)) return "image";
  if (VIDEO_EXT.test(name)) return "video";
  return null;
}

export function shouldSkipName(name: string) {
  if (!name || name.startsWith(".")) return true;
  const lower = name.toLowerCase();
  return (
    lower === "thumbs.db" ||
    lower === "desktop.ini" ||
    lower === "@eadir" ||
    lower === "__macosx" ||
    lower === "node_modules"
  );
}

export function naturalCompare(a: string, b: string) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
}

export function fileId(artist: string, set: string, name: string) {
  return `${artist}/${set}/${name}`;
}

export function setId(artist: string, set: string) {
  return `${artist}/${set}`;
}

/** Strip a metadata prefix: everything through the first " - ". */
export function displayName(raw: string, strip: boolean) {
  if (!strip) return raw;
  const idx = raw.indexOf(" - ");
  if (idx === -1) return raw;
  const rest = raw.slice(idx + 3).trim();
  return rest || raw;
}

export function emptyLibrary(): Library {
  return { artists: [], source: "local", rootName: "" };
}
