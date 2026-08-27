import { useEffect } from "react";
import { videoHost } from "@/lib/library/video";
import { pickLocalLibrary } from "@/lib/library/open";
import {
  currentArtist,
  currentFile,
  useViewer,
  viewArtists,
} from "@/store/viewer";

function isTyping(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable;
}

export function useLoupeKeys() {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (isTyping(event.target)) {
        if (event.key === "Escape") (event.target as HTMLElement).blur();
        return;
      }

      const s = useViewer.getState();
      const key = event.key;
      const lower = key.toLowerCase();

      const consume = (label: string) => {
        event.preventDefault();
        event.stopPropagation();
        s.setLastKey(label);
      };

      if (key === "Escape") {
        consume("Esc");
        s.cycleViewBack();
        return;
      }

      if (key === "`" || key === "?") {
        consume("`");
        s.toggleHelp();
        return;
      }

      if (s.help) {
        consume(key.length === 1 ? key.toUpperCase() : key);
        s.toggleHelp();
        return;
      }

      switch (lower) {
        case "a":
        case "arrowleft": {
          consume("A");
          if (s.view === "library") {
            const artist = currentArtist(s);
            if (!artist?.sets.length) return;
            const setIndex =
              (s.setIndex - 1 + artist.sets.length) % artist.sets.length;
            s.moveCursor(s.artistIndex, setIndex, 0);
            return;
          }
          s.prevFile(event.shiftKey ? 5 : 1);
          return;
        }
        case "d":
        case "arrowright": {
          consume("D");
          if (s.view === "library") {
            const artist = currentArtist(s);
            if (!artist?.sets.length) return;
            const setIndex = (s.setIndex + 1) % artist.sets.length;
            s.moveCursor(s.artistIndex, setIndex, 0);
            return;
          }
          s.nextFile(event.shiftKey ? 5 : 1);
          return;
        }
        case "w":
        case "arrowup": {
          consume("W");
          if (s.view === "library") {
            const artists = viewArtists(s);
            if (!artists.length) return;
            const artistIndex =
              (s.artistIndex - 1 + artists.length) % artists.length;
            s.moveCursor(artistIndex, 0, 0);
            return;
          }
          s.prevSet();
          return;
        }
        case "s":
        case "arrowdown": {
          consume("S");
          if (s.view === "library") {
            const artists = viewArtists(s);
            if (!artists.length) return;
            const artistIndex = (s.artistIndex + 1) % artists.length;
            s.moveCursor(artistIndex, 0, 0);
            return;
          }
          s.nextSet();
          return;
        }
        case "q":
          consume("Q");
          s.prevArtist();
          return;
        case "e":
          consume("E");
          s.nextArtist();
          return;
        case "tab":
          consume("Tab");
          s.setView(s.view === "library" ? "loupe" : "library");
          return;
        case " ":
        case "enter":
          consume(key === "Enter" ? "Enter" : "Space");
          if (s.view !== "loupe") {
            if (s.library.artists.length) s.setView("loupe");
            return;
          }
          if (currentFile(s)?.kind === "video") {
            videoHost.toggle();
            return;
          }
          if (key === "Enter") return;
          s.nextFile();
          return;
        case "f":
          consume("F");
          s.toggleFavorite();
          return;
        case "r":
          consume("R");
          if (event.shiftKey) s.randomInLibrary();
          else s.randomInSet();
          return;
        case "z":
          consume("Z");
          s.cycleZoom();
          return;
        case "x":
          consume("X");
          videoHost.seek(-5);
          return;
        case "c":
          consume("C");
          videoHost.seek(5);
          return;
        case "v":
          consume("V");
          s.toggleMute();
          return;
        case "b":
          consume("B");
          s.toggleFilmstrip();
          return;
        case "o":
          consume("O");
          void pickLocalLibrary();
          return;
        case "p":
          consume("P");
          s.toggleStripPrefix();
          return;
        case "1":
          consume("1");
          s.setZoom("fit");
          return;
        case "2":
          consume("2");
          s.setZoom("fill");
          return;
        case "4":
          consume("4");
          s.toggleFavoritesPlaylist();
          return;
        default:
          return;
      }
    };

    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, []);
}
