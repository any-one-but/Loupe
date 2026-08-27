import { KeyCap } from "./key-cap";
import { useViewer } from "@/store/viewer";

export function HelpOverlay() {
  const close = () => useViewer.getState().toggleHelp();

  return (
    <div
      className="absolute inset-0 z-30 flex items-center justify-center bg-background/80 px-3 py-6 sm:px-4"
      onClick={close}
      onKeyDown={() => undefined}
      role="presentation"
    >
      <div
        className="max-h-[85dvh] w-full max-w-md overflow-y-auto rounded-xl border border-border bg-surface p-4 sm:p-6 md:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="font-display text-3xl tracking-tight text-foreground md:text-4xl">
          Keys
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Horizontal is the thing in front of you. Vertical moves up a folder.
        </p>

        <div className="mx-auto mt-6 grid w-56 grid-cols-3 justify-items-center gap-y-3">
          <span />
          <Pad keys="W" label="set −" />
          <span />
          <Pad keys="A" label="file −" />
          <span />
          <Pad keys="D" label="file +" />
          <span />
          <Pad keys="S" label="set +" />
          <span />
        </div>

        <div className="mt-6 flex justify-center gap-8">
          <Pad keys="Q" label="artist −" />
          <Pad keys="E" label="artist +" />
        </div>

        <p className="mt-4 text-center text-xs text-subtle">
          In the library, A/D are sets and W/S are artists.
        </p>

        <div className="mt-6 space-y-2.5 border-t border-border pt-5 text-sm text-muted">
          <Line keys={["Tab"]} text="Library" />
          <Line keys={["Esc"]} text="Back" />
          <Line keys={["Space"]} text="Pause clip / next still" wide />
          <Line keys={["F"]} text="Star — stays on this file" />
          <Line keys={["4"]} text="Jump to starred" />
          <Line keys={["P"]} text="Strip title prefixes" />
          <Line keys={["O"]} text="Open folder" />
          <Line keys={["Z"]} text="Fit / fill" />
          <Line keys={["R"]} text="Random in set" />
        </div>

        <button
          type="button"
          onClick={close}
          className="mt-5 text-xs tracking-wide text-subtle uppercase"
        >
          Press Esc or ` to close
        </button>
      </div>
    </div>
  );
}

function Pad({ keys, label }: { keys: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <KeyCap label={keys} large />
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}

function Line({
  keys,
  text,
  wide,
}: {
  keys: string[];
  text: string;
  wide?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex min-w-16 gap-1">
        {keys.map((key) => (
          <KeyCap key={key} label={key} wide={wide} />
        ))}
      </div>
      <p>{text}</p>
    </div>
  );
}

export function HelpGate() {
  const help = useViewer((s) => s.help);
  if (!help) return null;
  return <HelpOverlay />;
}
