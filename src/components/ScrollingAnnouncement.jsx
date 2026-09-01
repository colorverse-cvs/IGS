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
  height,          // e.g. "100px", "3rem" — leave undefined for auto
  rows = 2,        // number of scrolling rows to show
}) {
  // Build a single segment: all messages joined by the separator + trailing sep
  const segment = messages.join(`   ${separator}   `) + `   ${separator}   `;

  // Repeat the segment FILL_REPEAT times to make each half wide enough
  const halfContent = Array(FILL_REPEAT).fill(segment).join("");

  // For multi-row: offset each row so different messages appear simultaneously.
  // Row i starts its animation at -(i / rows * speedSeconds)s delay.
  const rowCount = Math.max(1, rows);
  const rowHeight = height ? `calc(${height} / ${rowCount})` : undefined;

  return (
    <div
      className={`w-full overflow-hidden flex flex-col justify-around ${bgClass} ${textClass} select-none`}
      style={height ? { height } : {}}
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

      {Array.from({ length: rowCount }).map((_, i) => (
        <div
          key={i}
          className="w-full overflow-hidden flex items-center"
          style={rowHeight ? { height: rowHeight } : { paddingTop: "0.625rem", paddingBottom: "0.625rem" }}
        >
          <div
            className="igs-strip-track text-sm font-medium tracking-wide"
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
