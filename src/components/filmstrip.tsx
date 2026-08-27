import { useEffect, useRef } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { currentSet, useViewer } from "@/store/viewer";

export function Filmstrip() {
  const mediaSet = useViewer((s) => currentSet(s));
  const fileIndex = useViewer((s) => s.fileIndex);
  const favorites = useViewer((s) => s.favorites);
  const visible = useViewer((s) => s.filmstrip);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const active = scroller.current?.querySelector("[data-active='true']");
    if (active instanceof HTMLElement) {
      active.scrollIntoView({
        inline: "center",
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [fileIndex, mediaSet?.id]);

  if (!visible || !mediaSet) return null;

  return (
    <div
      ref={scroller}
      className="flex max-w-full gap-1.5 overflow-x-auto px-1 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      onPointerDown={(event) => event.stopPropagation()}
    >
      {mediaSet.files.map((file, index) => {
        const active = index === fileIndex;
        const starred = favorites.includes(file.id);
        return (
          <button
            key={file.id}
            type="button"
            data-active={active}
            onClick={() =>
              useViewer.getState().moveCursor(
                useViewer.getState().artistIndex,
                useViewer.getState().setIndex,
                index,
              )
            }
            className={cn(
              "relative h-16 w-11 shrink-0 overflow-hidden rounded-sm bg-surface-2 ring-1 transition-[opacity,box-shadow] duration-150",
              active
                ? "ring-accent opacity-100"
                : "ring-transparent opacity-55 hover:opacity-90",
            )}
            aria-label={file.name}
          >
            {file.kind === "video" ? (
              <video
                src={file.url}
                muted
                playsInline
                preload="metadata"
                className="h-full w-full object-cover"
              />
            ) : (
              <img
                src={file.url}
                alt=""
                className="h-full w-full object-cover"
              />
            )}
            {starred && (
              <Star className="absolute top-0.5 right-0.5 size-2.5 fill-accent text-accent" />
            )}
          </button>
        );
      })}
    </div>
  );
}
