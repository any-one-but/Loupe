import { FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pickLocalLibrary } from "@/lib/library/open";
import { KeyCap } from "./key-cap";
import { useViewer } from "@/store/viewer";

export function EmptyLibrary() {
  const scanning = useViewer((s) => s.scanning);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-background px-6 text-center">
      <p className="font-display text-5xl tracking-tight">Loupe</p>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
        Open the folder that holds artist → set → files. Left hand stays on A S D.
      </p>
      <Button
        type="button"
        className="mt-8"
        onClick={() => void pickLocalLibrary()}
      >
        <FolderOpen className="size-4" />
        Open folder
      </Button>
      <p className="mt-4 flex items-center gap-2 text-xs text-subtle">
        or press <KeyCap label="O" />
      </p>
      {scanning && (
        <p className="mt-6 text-sm text-muted">
          Reading {scanning.count} files · {scanning.label}
        </p>
      )}
    </div>
  );
}
