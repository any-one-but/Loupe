import { cn } from "@/lib/utils";
import { useViewer } from "@/store/viewer";

export function KeyCap({
  label,
  wide,
  large,
}: {
  label: string;
  wide?: boolean;
  large?: boolean;
}) {
  const lastKey = useViewer((s) => s.lastKey);
  const active = lastKey?.toLowerCase() === label.toLowerCase();

  return (
    <kbd
      className={cn(
        "transition-[background-color,color,transform] duration-150",
        large ? "h-10 min-w-10 text-sm" : "h-7 min-w-7 text-[11px]",
        wide && (large ? "min-w-24 px-3" : "min-w-16 px-2"),
        active && "scale-[0.96] bg-accent text-accent-foreground",
      )}
    >
      {label}
    </kbd>
  );
}
