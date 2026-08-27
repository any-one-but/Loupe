import { currentSet, favoriteFiles, useViewer } from "@/store/viewer";

export function SetProgress() {
  const browsingFavorites = useViewer((s) => s.browsingFavorites);
  const mediaSet = useViewer((s) => currentSet(s));
  const fileIndex = useViewer((s) => s.fileIndex);
  const favIndex = useViewer((s) => s.favIndex);
  const favs = useViewer((s) => favoriteFiles(s));

  const files = browsingFavorites ? favs : (mediaSet?.files ?? []);
  const index = browsingFavorites ? favIndex : fileIndex;
  if (!files.length) return null;

  const total = files.length;
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

  return (
    <div className="flex w-full gap-0.5">
      {files.map((file, i) => (
        <div
          key={file.id}
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
