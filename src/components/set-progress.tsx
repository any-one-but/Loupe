import { currentSet, useViewer } from "@/store/viewer";

export function SetProgress() {
  const browsingFavorites = useViewer((s) => s.browsingFavorites);
  const mediaSet = useViewer((s) => currentSet(s));
  const fileIndex = useViewer((s) => s.fileIndex);
  const favIndex = useViewer((s) => s.favIndex);
  const favorites = useViewer((s) => s.favorites);

  const total = browsingFavorites
    ? favorites.length
    : (mediaSet?.files.length ?? 0);
  const index = browsingFavorites ? favIndex : fileIndex;
  if (!total) return null;

  if (total > 40) {
    return (
      <div className="h-0.5 w-full overflow-hidden bg-foreground/10">
        <div
          className="h-full bg-accent transition-[width] duration-150"
          style={{ width: `${((index + 1) / total) * 100}%` }}
        />
      </div>
    );
  }

  const keys = browsingFavorites
    ? favorites
    : (mediaSet?.files.map((file) => file.id) ?? []);

  return (
    <div className="flex w-full gap-0.5">
      {keys.map((id, i) => (
        <div
          key={id}
          className={
            i <= index
              ? "h-0.5 flex-1 rounded-full bg-accent"
              : "h-0.5 flex-1 rounded-full bg-foreground/15"
          }
        />
      ))}
    </div>
  );
}
