"use client";

import EventzGoPreloaderBlackPurple, { EventzGoPreloaderBlackPurpleGradient } from "./EventzGoPreloaderBlackPurple";

// Backwards-compatible wrapper for previous `Preloader` import
export default function Preloader(props: { onComplete?: () => void; duration?: number }) {
  return <EventzGoPreloaderBlackPurple {...props} />;
}

export { EventzGoPreloaderBlackPurpleGradient };
