import { useEffect, useRef } from "react";
import { FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pickLocalLibrary } from "@/lib/library/open";
import { displayName } from "@/lib/library/types";
import { cn } from "@/lib/utils";
import { useViewer, viewArtists } from "@/store/viewer";

export function LibraryView() {
  const artists = useViewer((s) => viewArtists(s));
  const artistIndex = useViewer((s) => s.artistIndex);
  const setIndex = useViewer((s) => s.setIndex);
  const rootName = useViewer((s) => s.library.rootName);
  const stripPrefix = useViewer((s) => s.stripPrefix);
  const rowRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    rowRefs.current[artistIndex]?.scrollIntoView({
      block: "nearest",
      behavior: "smooth",
    });
  }, [artistIndex, setIndex]);

  return (
    <div className="absolute inset-0 overflow-y-auto bg-background px-4 py-6 md:px-8 md:py-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="font-display text-4xl tracking-tight md:text-5xl">Library</p>
          <p className="mt-1 text-sm text-muted">
            {rootName || "Local"} · W/S artists · A/D sets · Enter opens
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={stripPrefix ? "primary" : "ghost"}
            size="sm"
            onClick={() => useViewer.getState().toggleStripPrefix()}
          >
            Strip prefixes
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => void pickLocalLibrary()}
          >
            <FolderOpen className="size-3.5" />
            Open folder
          </Button>
        </div>
      </div>

      <div className="mt-8 space-y-8">
        {artists.map((artist, aIndex) => {
          const activeArtist = aIndex === artistIndex;
          return (
            <div
              key={artist.id}
              ref={(node) => {
                rowRefs.current[aIndex] = node;
              }}
            >
              <p
                className={cn(
                  "font-display text-2xl tracking-tight",
                  activeArtist ? "text-foreground" : "text-muted",
                )}
              >
                {displayName(artist.name, stripPrefix)}
              </p>
              <div className="mt-3 flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {artist.sets.map((mediaSet, sIndex) => {
                  const active = activeArtist && sIndex === setIndex;
                  return (
                    <button
                      key={mediaSet.id}
                      type="button"
                      onClick={() => useViewer.getState().select(aIndex, sIndex, 0)}
                      className="w-36 shrink-0 text-left md:w-44"
                    >
                      <div
                        className={cn(
                          "aspect-portrait overflow-hidden rounded-md bg-surface-2 ring-1 transition-opacity duration-150",
                          active
                            ? "ring-accent opacity-100"
                            : "ring-transparent opacity-70 hover:opacity-100",
                        )}
                      >
                        <img
                          src={mediaSet.coverUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <p className="mt-2 truncate text-sm text-foreground">
                        {displayName(mediaSet.name, stripPrefix)}
                      </p>
                      <p className="text-xs text-subtle tabular-nums">
                        {mediaSet.files.length} files
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
