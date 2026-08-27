let el: HTMLVideoElement | null = null;

export const videoHost = {
  set(next: HTMLVideoElement | null) {
    el = next;
  },
  get() {
    return el;
  },
  toggle() {
    if (!el) return;
    if (el.paused) void el.play();
    else el.pause();
  },
  seek(delta: number) {
    if (!el) return;
    const duration = Number.isFinite(el.duration) ? el.duration : 0;
    el.currentTime = Math.max(0, Math.min(duration, el.currentTime + delta));
  },
};
