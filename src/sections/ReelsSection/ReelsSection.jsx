import { useRef, useState, useEffect } from "react";

// ─── Data ─────────────────────────────────────────────────────────────────────

const reels = [
    { id: "DXRkO92DP5a", views: "12.4K", thumb: "" },
    { id: "DXt4NeRivSm", views: "8.7K", thumb: "" },
    { id: "DXRkO92DP5a", views: "15.2K", thumb: "" }, // replace id with actual reel id
    { id: "DXt4NeRivSm", views: "10.1K", thumb: "" }, // replace id with actual reel id
];

// ─── Instagram embed clip constants (desktop player) ──────────────────────────
const CARD_W = 240;
const IG_HDR = 64;
const IG_FTR = 190;
const VIDEO_H = Math.round(CARD_W * (16 / 9));
const IFRAME_H = IG_HDR + VIDEO_H + IG_FTR;
const IFRAME_W = CARD_W + 4;

// ─── Single Reel card ─────────────────────────────────────────────────────────
function ReelCard({ id, views, thumb, isActive, onPlay, onClose, mobile }) {
    const containerRef = useRef(null);

    // Close on outside click
    useEffect(() => {
        if (!isActive) return;
        const handle = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                onClose();
            }
        };
        const t = setTimeout(() => document.addEventListener("mousedown", handle), 150);
        return () => {
            clearTimeout(t);
            document.removeEventListener("mousedown", handle);
        };
    }, [isActive, onClose]);

    // ── Active / playing ──
    if (isActive) {
        const embedSrc = `https://www.instagram.com/reel/${id}/embed/?cr=1&v=14`;
        // On mobile fill full column width, on desktop use fixed CARD_W
        const w = mobile ? "100%" : CARD_W;
        const h = mobile ? undefined : VIDEO_H;

        return (
            <div
                ref={containerRef}
                className="relative rounded-2xl shadow-2xl overflow-hidden bg-black"
                style={mobile ? { width: "100%", aspectRatio: "9/16" } : { width: CARD_W, height: VIDEO_H }}
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    aria-label="Close player"
                    className="absolute top-2 right-2 z-30 w-7 h-7 rounded-full bg-black/70 hover:bg-black flex items-center justify-center transition-colors"
                >
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 stroke-white" strokeWidth="2.5" fill="none">
                        <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
                    </svg>
                </button>

                {/* Clipping wrapper */}
                <div className="absolute inset-0 overflow-hidden">
                    <iframe
                        src={embedSrc}
                        title={`Instagram Reel ${id}`}
                        frameBorder="0"
                        scrolling="no"
                        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                        allowFullScreen
                        style={{
                            width: "100%",
                            height: `calc(100% + ${IG_HDR + IG_FTR}px)`,
                            marginTop: -IG_HDR,
                            border: "none",
                            display: "block",
                            background: "#000",
                        }}
                    />
                    {/* Bottom mask */}
                    <div className="absolute bottom-0 left-0 right-0 h-2 bg-black z-10" />
                </div>
            </div>
        );
    }

    // ── Teaser card ──
    return (
        <button
            onClick={onPlay}
            className="relative w-full rounded-2xl overflow-hidden bg-[#1a0a2e] shadow-md group cursor-pointer border-0 p-0 focus:outline-none focus:ring-2 focus:ring-[#a34fc6]"
            style={{ aspectRatio: "9/16" }}
            aria-label={`Play reel — ${views} views`}
        >
            {/* Thumbnail or gradient */}
            {thumb ? (
                <img
                    src={thumb}
                    alt={`Reel ${views} views`}
                    className="absolute inset-0 w-full h-full object-cover"
                />
            ) : (
                <div className="absolute inset-0 bg-gradient-to-b from-[#4a1572] via-[#7b2d9e] to-[#2a0a4a]" />
            )}

            {/* Radial glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(160,80,220,0.35)_0%,_transparent_70%)]" />
            {/* Hover darken */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-200" />

            {/* Play button */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-white/25 backdrop-blur-sm border border-white/40 flex items-center justify-center group-hover:scale-110 group-hover:bg-white/40 transition-all duration-200 shadow-lg">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white ml-0.5" aria-hidden="true">
                        <path d="M8 5v14l11-7z" />
                    </svg>
                </div>
            </div>

            {/* View count */}
            <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 z-10">
                <svg viewBox="0 0 24 24" className="w-3 h-3 fill-white opacity-80" aria-hidden="true">
                    <path d="M8 5v14l11-7z" />
                </svg>
                <span className="text-white text-[11px] font-semibold drop-shadow-sm">{views}</span>
            </div>
        </button>
    );
}

// ─── Section ──────────────────────────────────────────────────────────────────
export default function ReelsSection() {
    const railRef = useRef(null);
    const [activeId, setActiveId] = useState(null);

    const scrollRight = () => {
        railRef.current?.scrollBy({ left: 340, behavior: "smooth" });
    };

    // Shared Follow Us link
    const FollowLink = ({ className = "" }) => (
        <a
            href="https://www.instagram.com/ishita.gallery/"
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-[#8526b5] transition-colors group ${className}`}
        >
            <span className="w-7 h-7 rounded-lg border border-[#d2a3e0] bg-white/80 flex items-center justify-center shadow-sm group-hover:border-[#8526b5] transition-colors">
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="2" y="2" width="20" height="20" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
                </svg>
            </span>
            Follow Us
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
        </a>
    );

    return (
        <section className="relative overflow-hidden bg-gradient-to-br from-[#f9f3ff] via-[#fdfbff] to-[#f4eaff] py-10 md:py-14">
            {/* Decorative botanicals */}
            <div className="absolute bottom-0 left-0 w-28 md:w-36 opacity-20 pointer-events-none select-none">
                <svg viewBox="0 0 320 250" fill="none" stroke="#D7B6EF" strokeWidth="2">
                    <path d="M15 230 C80 170 115 110 170 30" />
                    <path d="M42 203 C25 175 22 149 34 125 C55 145 64 166 58 185" />
                    <path d="M76 166 C57 137 60 110 77 91 C95 112 99 133 92 151" />
                    <path d="M56 188 C82 181 103 165 113 144 C87 144 68 156 56 173" />
                </svg>
            </div>
            <div className="absolute top-0 right-0 w-28 md:w-36 opacity-20 pointer-events-none select-none rotate-180">
                <svg viewBox="0 0 320 250" fill="none" stroke="#D7B6EF" strokeWidth="2">
                    <path d="M15 230 C80 170 115 110 170 30" />
                    <path d="M42 203 C25 175 22 149 34 125 C55 145 64 166 58 185" />
                    <path d="M56 188 C82 181 103 165 113 144 C87 144 68 156 56 173" />
                </svg>
            </div>

            <div className="relative z-10 w-full px-4 md:px-10 lg:px-20">

                {/* ══ MOBILE header (left-aligned, matches reference image) ══ */}
                <div className="sm:hidden mb-6">
                    <h2 className="text-3xl font-bold text-gray-900 mb-1">Reels</h2>
                    <p className="text-gray-500 text-sm leading-relaxed mb-3">
                        Discover our latest moments, behind the scenes, and special
                        collections through short videos.
                    </p>
                    <FollowLink />
                </div>

                {/* ══ DESKTOP header (centered) ══ */}
                <div className="hidden sm:flex relative flex-col items-center text-center gap-3 mb-10">
                    {/* Label */}
                    <div className="flex items-center gap-3">
                        <div className="h-px w-8 bg-[#a34fc6]" />
                        <span className="text-[11px] tracking-[0.18em] uppercase font-semibold text-[#a34fc6]">
                            Our Reels
                        </span>
                        <div className="h-px w-8 bg-[#a34fc6]" />
                    </div>
                    <h2 className="text-4xl md:text-5xl text-gray-900 mb-1">
                        Behind the scenes and more
                    </h2>
                    <p className="text-gray-600 text-sm max-w-md">
                        Get a closer look at our latest styles, customer moments
                        and the beauty of handcrafted jewellery.
                    </p>
                    {/* Follow Us pinned right */}
                    <FollowLink className="absolute right-0 top-1/2 -translate-y-1/2" />
                </div>

                {/* ══ Reels grid / rail ══ */}
                <div className="relative">
                    {/* Mobile: 2-column grid */}
                    <div className="grid grid-cols-2 gap-3 sm:hidden">
                        {reels.map((reel, i) => (
                            <ReelCard
                                key={`m-${reel.id}-${i}`}
                                id={reel.id}
                                views={reel.views}
                                thumb={reel.thumb}
                                isActive={activeId === `m-${i}`}
                                onPlay={() => setActiveId(`m-${i}`)}
                                onClose={() => setActiveId(null)}
                                mobile
                            />
                        ))}
                    </div>

                    {/* Tablet+: horizontal scroll rail */}
                    <div
                        ref={railRef}
                        className="hidden sm:flex gap-4 overflow-x-auto pb-2 items-start"
                        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                    >
                        {reels.map((reel, i) => (
                            <ReelCard
                                key={`d-${reel.id}-${i}`}
                                id={reel.id}
                                views={reel.views}
                                thumb={reel.thumb}
                                isActive={activeId === `d-${i}`}
                                onPlay={() => setActiveId(`d-${i}`)}
                                onClose={() => setActiveId(null)}
                            />
                        ))}
                    </div>

                    {/* Scroll arrow */}
                    {reels.length > 3 && (
                        <button
                            onClick={scrollRight}
                            aria-label="Scroll reels right"
                            className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-5 z-10 w-10 h-10 rounded-full bg-white border border-[#d2a3e0] shadow-md items-center justify-center hover:bg-[#f6ebf9] hover:border-[#a34fc6] transition-colors"
                        >
                            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="#7b21b0" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>
        </section>
    );
}
