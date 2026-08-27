import { Star } from "lucide-react";
import { Filmstrip } from "./filmstrip";
import { KeyCap } from "./key-cap";
import { SetProgress } from "./set-progress";
import { displayName } from "@/lib/library/types";
import { cn } from "@/lib/utils";
import { currentArtist, currentFile, currentSet, useViewer } from "@/store/viewer";

export function Hud({ visible }: { visible: boolean }) {
  const artist = useViewer((s) => currentArtist(s));
  const mediaSet = useViewer((s) => currentSet(s));
  const file = useViewer((s) => currentFile(s));
  const fileIndex = useViewer((s) => s.fileIndex);
  const favorites = useViewer((s) => s.favorites);
  const stripPrefix = useViewer((s) => s.stripPrefix);
  const browsingFavorites = useViewer((s) => s.browsingFavorites);
  const favIndex = useViewer((s) => s.favIndex);
  const scanning = useViewer((s) => s.scanning);
  const rootName = useViewer((s) => s.library.rootName);

  const starred = file ? favorites.includes(file.id) : false;
  const total = browsingFavorites
    ? favorites.length
    : (mediaSet?.files.length ?? 0);
  const index = browsingFavorites ? favIndex : fileIndex;

  return (
    <div
      className={cn(
        "hud-fade pointer-events-none absolute inset-0 z-20 flex flex-col justify-between",
        visible ? "opacity-100" : "opacity-0",
      )}
      aria-hidden={!visible}
    >
      <div className="scrim-top px-4 pt-4 pb-10 md:px-6">
        <SetProgress />
        <div className="mt-3 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="font-display text-2xl leading-tight tracking-tight md:text-3xl">
              {browsingFavorites
                ? "Starred"
                : displayName(artist?.name ?? "Loupe", stripPrefix)}
            </p>
            <p className="mt-1 truncate text-sm text-muted">
              {browsingFavorites
                ? displayName(file?.name ?? "", stripPrefix)
                : displayName(mediaSet?.name ?? "—", stripPrefix)}
              {total > 0 && (
                <span className="ml-2 tabular-nums text-subtle">
                  {" · "}
                  {index + 1} / {total}
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs tracking-wide text-subtle uppercase">
            <span>{rootName || "Loupe"}</span>
            {starred && (
              <Star className="size-3.5 fill-accent text-accent" />
            )}
          </div>
        </div>
      </div>

      <div
        className={cn(
          "scrim-bottom px-3 pt-12 pb-3 md:px-5",
          visible && "pointer-events-auto",
        )}
      >
        {!browsingFavorites && <Filmstrip />}
        <div className="mt-2 flex items-end justify-between gap-3">
          <p className="min-h-5 text-sm text-muted">{scanningLabel(scanning)}</p>
          <div className="hidden items-center gap-3 md:flex">
            <Hint keys={["A", "D"]} label="file" />
            <Hint keys={["W", "S"]} label="set" />
            <Hint keys={["Q", "E"]} label="artist" />
            <Hint keys={["Tab"]} label="library" />
            <Hint keys={["`"]} label="keys" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Hint({ keys, label }: { keys: string[]; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-subtle">
      {keys.map((key) => (
        <KeyCap key={key} label={key} />
      ))}
      <span>{label}</span>
    </span>
  );
}

function scanningLabel(scanning: { count: number; label: string } | null) {
  if (!scanning) return "";
  return `Reading ${scanning.count} files · ${scanning.label}`;
}
