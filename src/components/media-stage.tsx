import { useEffect, useState } from "react";
import { videoHost } from "@/lib/library/video";
import { cn } from "@/lib/utils";
import { currentFile, useViewer } from "@/store/viewer";

export function MediaStage() {
  const file = useViewer((s) => currentFile(s));
  const zoom = useViewer((s) => s.zoom);
  const muted = useViewer((s) => s.muted);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(false);
    setProgress(0);
    return () => videoHost.set(null);
  }, [file?.id]);

  if (!file) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted">
        No files in this set
      </div>
    );
  }

  const mediaClass = cn(
    "max-h-full max-w-full select-none",
    zoom === "fill" ? "h-full w-full object-cover" : "h-full w-full object-contain",
  );

  return (
    <div className="relative flex h-full w-full items-center justify-center bg-background">
      {!ready && (
        <div className="absolute inset-0 bg-surface/40" aria-hidden="true" />
      )}
      {file.kind === "video" ? (
        <video
          key={file.id}
          ref={(node) => videoHost.set(node)}
          src={file.url}
          className={mediaClass}
          autoPlay
          loop
          muted={muted}
          playsInline
          draggable={false}
          onLoadedData={() => setReady(true)}
          onTimeUpdate={(event) => {
            const el = event.currentTarget;
            if (!el.duration) return;
            setProgress(el.currentTime / el.duration);
          }}
        />
      ) : (
        <img
          key={file.id}
          src={file.url}
          alt=""
          className={mediaClass}
          draggable={false}
          onLoad={() => setReady(true)}
        />
      )}
      {file.kind === "video" && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-foreground/10">
          <div
            className="h-full bg-accent"
            style={{ width: `${Math.max(0, Math.min(1, progress)) * 100}%` }}
          />
        </div>
      )}
    </div>
  );
}
