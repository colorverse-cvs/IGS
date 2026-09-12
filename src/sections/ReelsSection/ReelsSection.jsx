import { useState, useEffect } from "react";
import { fetchReelIds } from "../../utils/marketingApi";

const PAGE_SIZE = 4;

// ─── Single Reel card ─────────────────────────────────────────────────────────
// Clicking opens the Instagram reel directly — no in-page embed.
function ReelCard({ id, thumb }) {
    const reelUrl = `https://www.instagram.com/reel/${id}/`;

    return (
        <a
            href={reelUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Watch reel on Instagram`}
            className="relative block rounded-xl overflow-hidden bg-[#1a0a2e] shadow-md group focus:outline-none focus:ring-2 focus:ring-[#a34fc6]"
            style={{ aspectRatio: "9/16" }}
        >
            {/* Thumbnail or gradient */}
            {thumb ? (
                <img
                    src={thumb}
                    alt="Instagram Reel"
                    className="absolute inset-0 w-full h-full object-cover"
                />
            ) : (
                <div className="absolute inset-0 bg-[#720da8] flex items-center justify-center">
                    <img
                        src="/ishita-gallery-logo.jpg"
                        alt="Ishita Gallery"
                        className="w-4/5 h-4/5 object-contain opacity-90"
                    />
                </div>
            )}

            {/* Radial glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(160,80,220,0.35)_0%,_transparent_70%)]" />
            {/* Hover darken */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-200" />

            {/* Play button */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-9 h-9 rounded-full bg-white/25 backdrop-blur-sm border border-white/40 flex items-center justify-center group-hover:scale-110 group-hover:bg-white/40 transition-all duration-200 shadow-lg">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white ml-0.5" aria-hidden="true">
                        <path d="M8 5v14l11-7z" />
                    </svg>
                </div>
            </div>
        </a>
    );
}

// ─── Pagination button ─────────────────────────────────────────────────────────
function PaginationBtn({ onClick, disabled, direction, label }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            aria-label={label}
            className={`
                flex items-center justify-center w-10 h-10 rounded-full border shadow-sm
                transition-all duration-200
                ${disabled
                    ? "border-gray-200 bg-white/50 text-gray-300 cursor-not-allowed"
                    : "border-[#d2a3e0] bg-white text-[#7b21b0] hover:bg-[#f6ebf9] hover:border-[#a34fc6] hover:shadow-md active:scale-95"
                }
            `}
        >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5">
                {direction === "prev"
                    ? <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
                    : <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
                }
            </svg>
        </button>
    );
}

// ─── Section ──────────────────────────────────────────────────────────────────
export default function ReelsSection() {
    const [page, setPage] = useState(0);
    const [reels, setReels] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch reel IDs from API on mount
    useEffect(() => {
        fetchReelIds()
            .then((ids) => setReels(ids.map((id) => ({ id, thumb: "" }))))
            .catch(() => setReels([]))
            .finally(() => setLoading(false));
    }, []);

    const totalPages = Math.ceil(reels.length / PAGE_SIZE);
    const visibleReels = reels.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
    const hasPrev = page > 0;
    const hasNext = page < totalPages - 1;

    const goNext = () => setPage((p) => Math.min(p + 1, totalPages - 1));
    const goPrev = () => setPage((p) => Math.max(p - 1, 0));

    // Hide the whole section when there are no reels and we've finished loading
    if (!loading && reels.length === 0) return null;

    // Shared Follow Us link
    const FollowLink = ({ className = "" }) => (
        <a
            href="https://www.instagram.com/ishita_gallery_official/"
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

                {/* ══ MOBILE header ══ */}
                <div className="sm:hidden mb-5">
                    <h2 className="text-3xl font-bold text-gray-900 mb-1">Reels</h2>
                    <p className="text-gray-500 text-sm leading-relaxed mb-3">
                        Discover our latest moments, behind the scenes, and special
                        collections through short videos.
                    </p>
                    <FollowLink />
                </div>

                {/* ══ DESKTOP header (centered) ══ */}
                <div className="hidden sm:flex relative flex-col items-center text-center gap-3 mb-8">
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
                    <FollowLink className="absolute right-0 top-1/2 -translate-y-1/2" />
                </div>

                {/* ══ Reels grid — centered, 4 per page ══ */}
                <div className="flex flex-col items-center gap-6">

                    {/* Loading skeleton */}
                    {loading ? (
                        <div className="flex flex-wrap justify-center gap-3 w-full max-w-2xl mx-auto">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="rounded-xl bg-[#e8d8f5] animate-pulse flex-shrink-0"
                                    style={{ width: 140, aspectRatio: "9/16" }}
                                />
                            ))}
                        </div>
                    ) : (
                        /* Cards — flex+wrap so they centre when fewer than 4 */
                        <div className="flex flex-wrap justify-center gap-3 w-full max-w-2xl mx-auto">
                            {visibleReels.map((reel, i) => (
                                <div key={`${page}-${reel.id}-${i}`} className="flex-shrink-0" style={{ width: 140 }}>
                                    <ReelCard id={reel.id} thumb={reel.thumb} />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ── Pagination controls (only shown when >1 page) ── */}
                    {totalPages > 1 && (
                        <div className="flex items-center gap-4">
                            {/* Prev */}
                            <PaginationBtn
                                onClick={goPrev}
                                disabled={!hasPrev}
                                direction="prev"
                                label="Previous page"
                            />

                            {/* Dot indicators */}
                            <div className="flex items-center gap-2">
                                {Array.from({ length: totalPages }).map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setPage(idx)}
                                        aria-label={`Go to page ${idx + 1}`}
                                        className={`
                                            rounded-full transition-all duration-300
                                            ${idx === page
                                                ? "w-5 h-2 bg-[#a34fc6]"
                                                : "w-2 h-2 bg-[#d2a3e0] hover:bg-[#a34fc6]/60"
                                            }
                                        `}
                                    />
                                ))}
                            </div>

                            {/* Next */}
                            <PaginationBtn
                                onClick={goNext}
                                disabled={!hasNext}
                                direction="next"
                                label="Next page"
                            />
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

