import { useEffect, useState } from "react";
import { EmptyLibrary } from "./empty-library";
import { FolderInput } from "./folder-input";
import { HelpGate } from "./help-overlay";
import { Hud } from "./hud";
import { LibraryView } from "./library-view";
import { LoupeView } from "./loupe-view";
import { useHydrateLoupe } from "@/hooks/use-hydrate";
import { useIdleHud } from "@/hooks/use-idle-hud";
import { useLoupeKeys } from "@/hooks/use-loupe-keys";
import { usePreload } from "@/hooks/use-preload";
import { loadFromFileList } from "@/lib/library/open";
import { cn } from "@/lib/utils";
import { useViewer } from "@/store/viewer";

export function LoupeApp() {
  useHydrateLoupe();
  useLoupeKeys();
  useIdleHud();
  usePreload();

  const view = useViewer((s) => s.view);
  const help = useViewer((s) => s.help);
  const empty = useViewer((s) => s.library.artists.length === 0);
  const hudUntil = useViewer((s) => s.hudUntil);
  const cursorHidden = useViewer((s) => s.cursorHidden);
  const now = useClock(hudUntil);

  const hudVisible = !help && !empty && view === "loupe" && now < hudUntil;

  useEffect(() => {
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = prev;
    };
  }, []);

  return (
    <main
      className={cn(
        "relative h-dvh w-full overflow-hidden bg-background text-foreground select-none",
        cursorHidden && view === "loupe" && !hudVisible
          ? "cursor-none"
          : "cursor-auto",
      )}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        loadFromFileList(event.dataTransfer.files, "Dropped folder");
      }}
    >
      {empty ? (
        <EmptyLibrary />
      ) : (
        <>
          {view === "loupe" && <LoupeView />}
          {view === "library" && <LibraryView />}
          {view === "loupe" && <Hud visible={hudVisible} />}
        </>
      )}
      <HelpGate />
      <FolderInput />
    </main>
  );
}

function useClock(hudUntil: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (now >= hudUntil) return;
    const id = window.setInterval(() => setNow(Date.now()), 200);
    return () => window.clearInterval(id);
  }, [hudUntil, now]);
  return now;
}
