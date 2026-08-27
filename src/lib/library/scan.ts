import type { Artist, Library, MediaFile, MediaSet } from "./types";
import {
  fileId,
  mediaKind,
  naturalCompare,
  setId,
  shouldSkipName,
} from "./types";
import { asDir, asFile, type FsDirHandle } from "./fs";

interface RawFile {
  artist: string;
  set: string;
  name: string;
  url: string;
}

const livingUrls: string[] = [];

export function releaseObjectUrls() {
  while (livingUrls.length) {
    const url = livingUrls.pop();
    if (url) URL.revokeObjectURL(url);
  }
}

function track(url: string) {
  livingUrls.push(url);
  return url;
}

function nest(raw: RawFile[], rootName: string): Library {
  const byArtist = new Map<string, Map<string, MediaFile[]>>();

  for (const item of raw) {
    let sets = byArtist.get(item.artist);
    if (!sets) {
      sets = new Map();
      byArtist.set(item.artist, sets);
    }
    let files = sets.get(item.set);
    if (!files) {
      files = [];
      sets.set(item.set, files);
    }
    const sid = setId(item.artist, item.set);
    files.push({
      id: fileId(item.artist, item.set, item.name),
      name: item.name,
      url: item.url,
      kind: mediaKind(item.name)!,
      artistId: item.artist,
      setId: sid,
    });
  }

  const artists: Artist[] = [...byArtist.entries()]
    .sort(([a], [b]) => naturalCompare(a, b))
    .map(([artistName, sets]) => {
      const mediaSets: MediaSet[] = [...sets.entries()]
        .sort(([a], [b]) => naturalCompare(a, b))
        .map(([setName, files]) => {
          const sorted = [...files].sort((a, b) =>
            naturalCompare(a.name, b.name),
          );
          const cover = sorted.find((f) => f.kind === "image") ?? sorted[0];
          return {
            id: setId(artistName, setName),
            name: setName,
            artistId: artistName,
            files: sorted,
            coverUrl: cover.url,
          };
        })
        .filter((set) => set.files.length > 0);

      return {
        id: artistName,
        name: artistName,
        sets: mediaSets,
      };
    })
    .filter((artist) => artist.sets.length > 0);

  return {
    artists,
    source: "local",
    rootName,
  };
}

function relativeParts(file: File): string[] {
  const rel =
    (file as File & { webkitRelativePath?: string }).webkitRelativePath ||
    file.name;
  return rel.split("/").filter(Boolean);
}

export function libraryFromFileList(
  list: FileList | File[],
  rootName = "Local library",
): Library {
  releaseObjectUrls();
  const raw: RawFile[] = [];
  for (const file of Array.from(list)) {
    const parts = relativeParts(file);
    if (parts.length < 3) continue;
    const artist = parts[parts.length - 3]!;
    const set = parts[parts.length - 2]!;
    const name = parts[parts.length - 1]!;
    if (shouldSkipName(artist) || shouldSkipName(set) || shouldSkipName(name)) {
      continue;
    }
    if (!mediaKind(name)) continue;
    raw.push({
      artist,
      set,
      name,
      url: track(URL.createObjectURL(file)),
    });
  }
  return nest(raw, rootName);
}

export async function libraryFromDirectory(
  root: FsDirHandle,
  onProgress?: (count: number, label: string) => void,
): Promise<Library> {
  releaseObjectUrls();
  const raw: RawFile[] = [];
  let count = 0;

  for await (const [artistName, artistHandle] of root.entries()) {
    if (artistHandle.kind !== "directory") continue;
    if (shouldSkipName(artistName)) continue;
    const artistDir = asDir(artistHandle);

    for await (const [setName, setHandle] of artistDir.entries()) {
      if (setHandle.kind !== "directory") continue;
      if (shouldSkipName(setName)) continue;
      const setDir = asDir(setHandle);

      for await (const [fileName, fileHandle] of setDir.entries()) {
        if (fileHandle.kind !== "file") continue;
        if (shouldSkipName(fileName) || !mediaKind(fileName)) continue;
        const file = await asFile(fileHandle).getFile();
        raw.push({
          artist: artistName,
          set: setName,
          name: fileName,
          url: track(URL.createObjectURL(file)),
        });
        count += 1;
        if (count % 40 === 0) {
          onProgress?.(count, `${artistName} / ${setName}`);
          await new Promise<void>((resolve) => {
            requestAnimationFrame(() => resolve());
          });
        }
      }
    }
  }

  onProgress?.(count, root.name);
  return nest(raw, root.name);
}
