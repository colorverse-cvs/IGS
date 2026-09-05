import React from "react";

const DEFAULT_MESSAGES = [
  "🔥 Hurry Up! Limited Time Offer",
  "⚡ Limited Stock — Order Before It's Gone",
  "🎁 Free Shipping on Orders Above ₹999",
  "✨ Handcrafted with Love & Devotion",
  "🛕 Exclusive Festive Deals Available Now",
];

// How many times to repeat the text within EACH half of the track.
// 8 repetitions × 2 halves = 16× the text length — enough for any viewport.
const FILL_REPEAT = 8;

export default function ScrollingAnnouncement({
  messages = DEFAULT_MESSAGES,
  separator = "✦",
  speedSeconds = 180,
  bgClass = "bg-brand-800",
  textClass = "text-white",
  height,        // e.g. "100px", "3rem" — leave undefined for auto
  rows,          // when provided: join all messages into this many combined rows
  // when omitted: each message gets its own dedicated row
  trackClass = "text-sm font-medium tracking-wide",  // override per usage
  bgStyle,       // optional inline style for gradient/custom backgrounds
  gap = 7,       // non-breaking spaces on each side of the separator
}) {
  //   (non-breaking space) is used instead of regular spaces because
  // HTML collapses multiple regular spaces into one even with white-space:nowrap
  const sp = "\u00a0".repeat(gap);
  const sep = `${sp}${separator}${sp}`;

  const tracks = rows
    ? Array.from({ length: Math.max(1, rows) }, () => {
      const segment = messages.join(sep) + sep;
      return Array(FILL_REPEAT).fill(segment).join("");
    })
    : messages.map((msg) => {
      const segment = msg + sep;
      return Array(FILL_REPEAT).fill(segment).join("");
    });

  const rowCount = tracks.length;
  const rowHeight = height ? `calc(${height} / ${rowCount})` : undefined;

  return (
    <div
      className={`w-full overflow-hidden flex flex-col justify-around ${bgStyle ? "" : bgClass} ${textClass} select-none`}
      style={{ ...(height ? { height } : {}), ...(bgStyle ?? {}) }}
      aria-label="Promotional announcement"
    >
      <style>{`
        @keyframes igs-rtl {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }

        .igs-strip-track {
          display: inline-flex;
          width: max-content;
          white-space: nowrap;
          will-change: transform;
        }

        .igs-strip-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      {tracks.map((halfContent, i) => (
        <div
          key={i}
          className={`w-full overflow-hidden flex items-center justify-center md:justify-start${!rowHeight ? " mt-6 md:mt-0 md:pt-[0.6rem]" : ""}`}
          style={rowHeight ? { height: rowHeight } : { paddingBottom: "0.625rem" }}
        >
          <div
            className={`igs-strip-track ${trackClass}`}
            style={{
              animation: `igs-rtl ${speedSeconds}s linear infinite`,
              animationDelay: `-${(i / rowCount) * speedSeconds}s`,
            }}
          >
            <span>{halfContent}</span>
            <span aria-hidden="true">{halfContent}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
