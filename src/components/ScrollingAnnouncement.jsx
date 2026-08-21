import React from "react";

const DEFAULT_MESSAGES = [
  "🔥 Hurry Up! Limited Time Offer",
  "⚡ Limited Stock — Order Before It's Gone",
  "🎁 Free Shipping on Orders Above ₹999",
  "✨ Handcrafted with Love & Devotion",
  "🛕 Exclusive Festive Deals Available Now",
];

export default function ScrollingAnnouncement({
  messages = DEFAULT_MESSAGES,
  separator = "✦",
  speedSeconds = 30,
  bgClass = "bg-brand-800",
  textClass = "text-white",
}) {
  // Build one strip: messages joined by separator
  const strip = messages
    .map((m) => `${m}`)
    .join(`   ${separator}   `);

  // We duplicate the strip so the seam is invisible
  const fullContent = `${strip}   ${separator}   `;

  return (
    <div
      className={`w-full overflow-hidden ${bgClass} ${textClass} py-2.5 select-none`}
      aria-label="Announcement banner"
    >
      <style>{`
        @keyframes igs-marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .igs-marquee-track {
          display: flex;
          white-space: nowrap;
          will-change: transform;
          animation: igs-marquee ${speedSeconds}s linear infinite;
        }
        .igs-marquee-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="igs-marquee-track text-sm font-medium tracking-wide">
        {/* Two identical copies — when the first scrolls fully off-screen
            the second is already in view, making the loop seamless */}
        <span className="px-6">{fullContent}</span>
        <span className="px-6">{fullContent}</span>
      </div>
    </div>
  );
}
