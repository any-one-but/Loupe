import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { emptyLibrary, type Library, type MediaFile, type MediaSet, type Artist, type ViewMode, type ZoomMode } from "@/lib/library/types";

export interface ViewerState {
  library: Library;
  artistIndex: number;
  setIndex: number;
  fileIndex: number;
  view: ViewMode;
  zoom: ZoomMode;
  muted: boolean;
  help: boolean;
  filmstrip: boolean;
  stripPrefix: boolean;
  favorites: string[];
  browsingFavorites: boolean;
  favIndex: number;
  hudUntil: number;
  lastKey: string | null;
  scanning: { count: number; label: string } | null;
  cursorHidden: boolean;
  memory: Record<string, { setIndex: number; fileIndex: number }>;
  setMemory: Record<string, number>;

  setLibrary: (library: Library) => void;
  bumpHud: () => void;
  hideHud: () => void;
  setView: (view: ViewMode) => void;
  cycleViewBack: () => void;
  nextFile: (step?: number) => void;
  prevFile: (step?: number) => void;
  nextSet: () => void;
  prevSet: () => void;
  nextArtist: () => void;
  prevArtist: () => void;
  select: (artistIndex: number, setIndex: number, fileIndex?: number) => void;
  moveCursor: (artistIndex: number, setIndex: number, fileIndex?: number) => void;
  randomInSet: () => void;
  randomInLibrary: () => void;
  toggleFavorite: () => void;
  toggleFavoritesPlaylist: () => void;
  cycleZoom: () => void;
  setZoom: (zoom: ZoomMode) => void;
  toggleMute: () => void;
  toggleHelp: () => void;
  toggleStripPrefix: () => void;
  toggleFilmstrip: () => void;
  setScanning: (scanning: { count: number; label: string } | null) => void;
  setLastKey: (key: string) => void;
  setCursorHidden: (hidden: boolean) => void;
}

let keyTimer: ReturnType<typeof setTimeout> | null = null;

export function viewArtists(s: Pick<ViewerState, "library">): Artist[] {
  return s.library.artists;
}

export function currentArtist(s: ViewerState): Artist | undefined {
  return viewArtists(s)[s.artistIndex];
}

export function currentSet(s: ViewerState): MediaSet | undefined {
  return currentArtist(s)?.sets[s.setIndex];
}

export function favoriteFiles(s: Pick<ViewerState, "library" | "favorites">): MediaFile[] {
  if (!s.favorites.length) return [];
  const wanted = new Set(s.favorites);
  return s.library.artists
    .flatMap((artist) => artist.sets.flatMap((set) => set.files))
    .filter((file) => wanted.has(file.id));
}

export function currentFile(s: ViewerState): MediaFile | undefined {
  if (s.browsingFavorites) {
    const files = favoriteFiles(s);
    return files[s.favIndex];
  }
  return currentSet(s)?.files[s.fileIndex];
}

function clampCursor(
  s: ViewerState,
): Pick<ViewerState, "artistIndex" | "setIndex" | "fileIndex"> {
  const artists = viewArtists(s);
  if (!artists.length) return { artistIndex: 0, setIndex: 0, fileIndex: 0 };
  const artistIndex = Math.min(Math.max(0, s.artistIndex), artists.length - 1);
  const sets = artists[artistIndex]!.sets;
  const setIndex = Math.min(
    Math.max(0, s.setIndex),
    Math.max(0, sets.length - 1),
  );
  const files = sets[setIndex]?.files ?? [];
  const fileIndex = Math.min(
    Math.max(0, s.fileIndex),
    Math.max(0, files.length - 1),
  );
  return { artistIndex, setIndex, fileIndex };
}

function restoreArtist(s: ViewerState, artistIndex: number) {
  const artists = viewArtists(s);
  const artist = artists[artistIndex];
  if (!artist) return clampCursor({ ...s, artistIndex });
  const mem = s.memory[artist.id];
  const setIndex = Math.min(
    mem?.setIndex ?? 0,
    Math.max(0, artist.sets.length - 1),
  );
  const mediaSet = artist.sets[setIndex] ?? artist.sets[0];
  const fileIndex = mediaSet
    ? (s.setMemory[mediaSet.id] ?? mem?.fileIndex ?? 0)
    : 0;
  return clampCursor({ ...s, artistIndex, setIndex, fileIndex });
}

function remember(s: ViewerState) {
  const artist = currentArtist(s);
  const mediaSet = currentSet(s);
  const memory = { ...s.memory };
  const setMemory = { ...s.setMemory };
  if (artist) {
    memory[artist.id] = { setIndex: s.setIndex, fileIndex: s.fileIndex };
  }
  if (mediaSet) {
    setMemory[mediaSet.id] = s.fileIndex;
  }
  return { memory, setMemory };
}

function locateFile(s: ViewerState, file: MediaFile) {
  const artists = viewArtists(s);
  for (let artistIndex = 0; artistIndex < artists.length; artistIndex++) {
    const artist = artists[artistIndex]!;
    for (let setIndex = 0; setIndex < artist.sets.length; setIndex++) {
      const mediaSet = artist.sets[setIndex]!;
      const fileIndex = mediaSet.files.findIndex((item) => item.id === file.id);
      if (fileIndex >= 0) return { artistIndex, setIndex, fileIndex };
    }
  }
  return null;
}

export const useViewer = create<ViewerState>()(
  persist(
    (set, get) => ({
      library: emptyLibrary(),
      artistIndex: 0,
      setIndex: 0,
      fileIndex: 0,
      view: "library",
      zoom: "fit",
      muted: true,
      help: false,
      filmstrip: true,
      stripPrefix: true,
      favorites: [],
      browsingFavorites: false,
      favIndex: 0,
      hudUntil: 0,
      lastKey: null,
      scanning: null,
      cursorHidden: true,
      memory: {},
      setMemory: {},

      setLibrary: (library) => {
        set((s) => {
          const next = {
            ...s,
            library,
            artistIndex: 0,
            setIndex: 0,
            fileIndex: 0,
            browsingFavorites: false,
            favIndex: 0,
            memory: {},
            setMemory: {},
            view: library.artists.length ? ("loupe" as const) : ("library" as const),
            help: false,
          };
          return { ...next, ...clampCursor(next) };
        });
      },

      bumpHud: () => {
        const s = get();
        const hudUntil = Date.now() + 2400;
        if (!s.cursorHidden && s.hudUntil >= hudUntil - 200) return;
        set({ hudUntil, cursorHidden: false });
      },
      hideHud: () => set({ hudUntil: 0 }),

      setView: (view) => set({ view, help: false, browsingFavorites: false }),

      cycleViewBack: () => {
        const s = get();
        if (s.help) {
          set({ help: false });
          return;
        }
        if (s.browsingFavorites) {
          set({ browsingFavorites: false });
          return;
        }
        if (!s.library.artists.length) {
          set({ view: "library", help: false });
          return;
        }
        set({
          view: s.view === "library" ? "loupe" : "library",
          help: false,
        });
      },

      nextFile: (step = 1) => {
        set((s) => {
          if (s.browsingFavorites) {
            const files = favoriteFiles(s);
            if (!files.length) return s;
            const len = files.length;
            const favIndex = ((s.favIndex + step) % len + len) % len;
            return { ...s, favIndex };
          }
          const files = currentSet(s)?.files ?? [];
          if (!files.length) return s;
          const len = files.length;
          const fileIndex = ((s.fileIndex + step) % len + len) % len;
          const next = { ...s, fileIndex };
          return { ...next, ...remember(next) };
        });
      },

      prevFile: (step = 1) => get().nextFile(-step),

      nextSet: () => {
        const s = get();
        if (s.browsingFavorites) return;
        const artist = currentArtist(s);
        if (!artist?.sets.length) return;
        const remembered = remember(s);
        const setIndex = (s.setIndex + 1) % artist.sets.length;
        const mediaSet = artist.sets[setIndex]!;
        const fileIndex = remembered.setMemory[mediaSet.id] ?? 0;
        set({
          ...remembered,
          setIndex,
          fileIndex,
          view: s.view === "library" ? "library" : "loupe",
        });
      },

      prevSet: () => {
        const s = get();
        if (s.browsingFavorites) return;
        const artist = currentArtist(s);
        if (!artist?.sets.length) return;
        const remembered = remember(s);
        const setIndex =
          (s.setIndex - 1 + artist.sets.length) % artist.sets.length;
        const mediaSet = artist.sets[setIndex]!;
        const fileIndex = remembered.setMemory[mediaSet.id] ?? 0;
        set({
          ...remembered,
          setIndex,
          fileIndex,
          view: s.view === "library" ? "library" : "loupe",
        });
      },

      nextArtist: () => {
        const s = get();
        if (s.browsingFavorites) return;
        const artists = viewArtists(s);
        if (!artists.length) return;
        const remembered = remember(s);
        const artistIndex = (s.artistIndex + 1) % artists.length;
        const restored = restoreArtist({ ...s, ...remembered }, artistIndex);
        set({
          ...remembered,
          ...restored,
          view: s.view === "library" ? "library" : "loupe",
        });
      },

      prevArtist: () => {
        const s = get();
        if (s.browsingFavorites) return;
        const artists = viewArtists(s);
        if (!artists.length) return;
        const remembered = remember(s);
        const artistIndex =
          (s.artistIndex - 1 + artists.length) % artists.length;
        const restored = restoreArtist({ ...s, ...remembered }, artistIndex);
        set({
          ...remembered,
          ...restored,
          view: s.view === "library" ? "library" : "loupe",
        });
      },

      select: (artistIndex, setIndex, fileIndex = 0) => {
        set((s) => {
          const next = clampCursor({ ...s, artistIndex, setIndex, fileIndex });
          return {
            ...s,
            ...next,
            ...remember({ ...s, ...next }),
            view: "loupe" as const,
            help: false,
            browsingFavorites: false,
          };
        });
      },

      moveCursor: (artistIndex, setIndex, fileIndex = 0) => {
        set((s) => {
          const next = clampCursor({ ...s, artistIndex, setIndex, fileIndex });
          return {
            ...s,
            ...next,
            ...remember({ ...s, ...next }),
          };
        });
      },

      randomInSet: () => {
        const s = get();
        if (s.browsingFavorites) {
          const files = favoriteFiles(s);
          if (files.length < 2) return;
          let favIndex = s.favIndex;
          while (favIndex === s.favIndex) {
            favIndex = Math.floor(Math.random() * files.length);
          }
          set({ favIndex });
          return;
        }
        const files = currentSet(s)?.files ?? [];
        if (files.length < 2) return;
        let fileIndex = s.fileIndex;
        while (fileIndex === s.fileIndex) {
          fileIndex = Math.floor(Math.random() * files.length);
        }
        set({ fileIndex });
      },

      randomInLibrary: () => {
        const s = get();
        const artists = viewArtists(s);
        if (!artists.length) return;
        const artist = artists[Math.floor(Math.random() * artists.length)]!;
        const mediaSet =
          artist.sets[Math.floor(Math.random() * artist.sets.length)]!;
        const file =
          mediaSet.files[Math.floor(Math.random() * mediaSet.files.length)]!;
        const artistIndex = artists.findIndex((a) => a.id === artist.id);
        const setIndex = artist.sets.findIndex((item) => item.id === mediaSet.id);
        const fileIndex = mediaSet.files.findIndex((item) => item.id === file.id);
        set({
          artistIndex: Math.max(0, artistIndex),
          setIndex: Math.max(0, setIndex),
          fileIndex: Math.max(0, fileIndex),
          view: "loupe",
          browsingFavorites: false,
        });
      },

      toggleFavorite: () => {
        const file = currentFile(get());
        if (!file) return;
        set((s) => {
          const starred = s.favorites.includes(file.id);
          const favorites = starred
            ? s.favorites.filter((id) => id !== file.id)
            : [...s.favorites, file.id];
          if (!s.browsingFavorites) {
            return { ...s, favorites };
          }
          const files = favoriteFiles({ ...s, favorites });
          if (!files.length) {
            return {
              ...s,
              favorites,
              browsingFavorites: false,
              favIndex: 0,
            };
          }
          const still = files.findIndex((item) => item.id === file.id);
          const favIndex =
            still >= 0
              ? still
              : Math.min(s.favIndex, files.length - 1);
          return { ...s, favorites, favIndex };
        });
      },

      toggleFavoritesPlaylist: () => {
        const s = get();
        if (s.browsingFavorites) {
          const file = currentFile(s);
          const located = file ? locateFile(s, file) : null;
          set({
            browsingFavorites: false,
            view: "loupe",
            ...(located ?? {}),
          });
          return;
        }
        const files = favoriteFiles(s);
        if (!files.length) return;
        set({
          browsingFavorites: true,
          favIndex: 0,
          view: "loupe",
          help: false,
        });
      },

      cycleZoom: () => {
        const zoom: ZoomMode = get().zoom === "fit" ? "fill" : "fit";
        set({ zoom });
      },

      setZoom: (zoom) => set({ zoom }),

      toggleMute: () => set((s) => ({ muted: !s.muted })),

      toggleHelp: () =>
        set((s) => ({
          help: !s.help,
        })),

      toggleStripPrefix: () =>
        set((s) => ({ stripPrefix: !s.stripPrefix })),

      toggleFilmstrip: () =>
        set((s) => ({ filmstrip: !s.filmstrip })),

      setScanning: (scanning) => set({ scanning }),

      setLastKey: (key) => {
        if (keyTimer) clearTimeout(keyTimer);
        set({ lastKey: key });
        keyTimer = setTimeout(() => set({ lastKey: null }), 420);
      },

      setCursorHidden: (cursorHidden) => set({ cursorHidden }),
    }),
    {
      name: "loupe-v2",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (s) => ({
        favorites: s.favorites,
        zoom: s.zoom,
        muted: s.muted,
        filmstrip: s.filmstrip,
        stripPrefix: s.stripPrefix,
      }),
    },
  ),
);
