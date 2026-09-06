import React from "react";

// ── Inline SVG icons ────────────────────────────────────────────────────────

const LotusIcon = ({ className = "" }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 54 54"
        className={className}
        fill="none"
        stroke="#8A43BD"
        strokeWidth="2"
    >
        <path d="M27 39 C17 39 12 33 15 27 C18 22 23 24 27 31 C31 24 36 22 39 27 C42 33 37 39 27 39Z" />
        <path d="M27 31 C21 24 21 18 27 14 C33 18 33 24 27 31Z" />
        <path d="M27 39 V44" />
    </svg>
);

const LeafSprig = ({ className = "" }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 180 180"
        className={className}
        fill="none"
        stroke="#8C46C0"
        strokeWidth="2.5"
    >
        <path d="M20 155 C65 120 92 77 125 25" />
        <g>
            <path d="M50 130 C33 112 30 94 39 79 C55 91 59 109 50 130Z" />
            <path d="M75 104 C59 87 59 70 70 57 C84 70 86 87 75 104Z" />
            <path d="M101 70 C91 54 96 39 108 30 C119 44 115 60 101 70Z" />
            <path d="M55 127 C75 124 90 112 97 98 C78 99 63 109 55 127Z" />
        </g>
    </svg>
);

const BotanicalRight = ({ className = "" }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 320 250"
        className={className}
        fill="none"
        stroke="#D7B6EF"
        strokeWidth="2"
        opacity="0.75"
    >
        <path d="M305 230 C240 170 205 110 150 30" />
        <path d="M278 203 C295 175 298 149 286 125 C265 145 256 166 262 185" />
        <path d="M244 166 C263 137 260 110 243 91 C225 112 221 133 228 151" />
        <path d="M208 125 C218 99 209 77 190 61 C181 83 184 102 194 116" />
        <path d="M173 78 C175 55 161 38 142 30 C141 51 151 67 166 76" />
        <path d="M264 188 C238 181 217 165 207 144 C233 144 252 156 264 173" />
        <path d="M225 145 C200 138 181 122 172 103 C195 106 213 117 225 131" />
    </svg>
);

// ── Stat badge ───────────────────────────────────────────────────────────────

const StatBadge = ({ icon, label }) => (
    <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-full bg-[#e0d1f0] border border-[#e0bee8] flex items-center justify-center shadow-sm flex-shrink-0">
            {icon}
        </div>
        <span className="text-[13px] leading-tight text-gray-500 font-medium">
            {label}
        </span>
    </div>
);

// ── Founder card ─────────────────────────────────────────────────────────────

const FounderCard = ({
    image,
    imageAlt,
    name,
    role,
    bio,
    quote,
    imageBgColor = "#9B59B6",
    quoteAlign = "left",
}) => {
    return (
        <div className="flex flex-col sm:flex-row items-start gap-6 w-full max-w-[480px]">
            {/* ── Circular photo ── */}
            <div className="flex-shrink-0 mx-auto sm:mx-0">
                <div
                    className="relative w-44 h-44 md:w-52 md:h-52 rounded-full overflow-hidden border-4 border-[#c9a0e0] shadow-lg"
                    style={{ backgroundColor: imageBgColor }}
                >
                    <img
                        src={image}
                        alt={imageAlt}
                        className="w-full h-full object-cover object-top"
                    />
                </div>
            </div>

            {/* ── Text content ── */}
            <div className="flex-1 text-center sm:text-left">
                {/* Large decorative quote mark */}
                <div
                    className={`text-[72px] leading-none text-[#c9a0e0] font-serif opacity-80 -mb-4 ${quoteAlign === "right" ? "text-right" : "text-left"
                        }`}
                    aria-hidden="true"
                >
                    &ldquo;
                </div>

                <h3 className="text-xl md:text-2xl !font-semibold text-[#7b21b0]">
                    {name}
                </h3>
                <p className="text-[10px] tracking-widest font-semibold uppercase text-gray-400 mt-0.5 mb-3">
                    {role}
                </p>

                <p className="text-[13px] md:text-sm leading-relaxed text-gray-600">
                    {bio}
                </p>

                {quote && (
                    <p className="mt-3 text-[13px] italic text-gray-700 font-medium">
                        &ldquo;{quote}&rdquo;
                    </p>
                )}
            </div>
        </div>
    );
};

// ── Main section ─────────────────────────────────────────────────────────────

export default function FounderDetailsSection() {
    return (
        <section className="relative overflow-hidden py-16 md:py-20">
            {/* ── Background decorative botanical (top-left) ── */}
            <div className="absolute top-0 left-0 w-48 md:w-64 opacity-40 pointer-events-none select-none -translate-x-6 -translate-y-4">
                <LeafSprig className="w-full h-full" />
            </div>

            {/* ── Background decorative botanical (top-right) ── */}
            <div className="absolute top-0 right-0 w-48 md:w-64 opacity-40 pointer-events-none select-none translate-x-6 -translate-y-4">
                <BotanicalRight className="w-full h-full" />
            </div>

            <div className="relative z-10 w-full px-4 md:px-10 lg:px-20">
                {/* ── Section header ── */}
                <div className="text-center mb-10 md:mb-14">
                    {/* OUR TEAM label with horizontal rules */}
                    <div className="flex items-center justify-center gap-3 mb-3">
                        <div className="h-px w-12 md:w-20 bg-[#a34fc6]" />
                        <span className="text-[11px] tracking-[0.2em] uppercase font-semibold text-[#a34fc6]">
                            Our Team
                        </span>
                        <div className="h-px w-12 md:w-20 bg-[#a34fc6]" />
                    </div>

                    <h2 className="text-3xl md:text-4xl lg:text-5xl !font-medium text-gray-900 leading-tight">
                        Meet the Minds Behind the Craft
                    </h2>
                    <p className="mt-3 text-sm md:text-base text-gray-500 max-w-md mx-auto leading-relaxed">
                        Two passionate creators, one shared dream—to bring India&rsquo;s
                        art, culture, and pride to every home.
                    </p>
                </div>

                {/* ── Founders row ── */}
                <div className="relative flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-6">
                    {/* Left founder — Shital */}
                    <div className="flex-1 flex justify-center lg:justify-end">
                        <FounderCard
                            image="/assets/images/1AU.png"
                            imageAlt="Shital Kulkarni"
                            name="Shital Kulkarni"
                            role="Founder & CEO"
                            bio="A visionary entrepreneur with a passion for innovation and growth, Shital Kulkarni founded the company with the goal of delivering quality products and creating meaningful customer experiences."
                            quote="Better Products for a Brighter Tomorrow"
                            imageBgColor="#9B59B6"
                            quoteAlign="left"
                        />
                    </div>

                    {/* Center decorative divider — desktop */}
                    <div className="hidden lg:flex flex-col items-center gap-3 flex-shrink-0 px-4">
                        <div className="w-px h-16 bg-[#d2a3e0]" />
                        <LotusIcon className="w-10 h-10" />
                        <div className="w-px h-16 bg-[#d2a3e0]" />
                    </div>

                    {/* Center decorative divider — mobile */}
                    <div className="flex lg:hidden items-center gap-3 w-full max-w-xs">
                        <div className="h-px flex-1 bg-[#d2a3e0]" />
                        <LotusIcon className="w-8 h-8" />
                        <div className="h-px flex-1 bg-[#d2a3e0]" />
                    </div>

                    {/* Right founder — Ishita */}
                    <div className="flex-1 flex justify-center lg:justify-start">
                        <FounderCard
                            image="/assets/images/Rectangle 33.png"
                            imageAlt="Ishita Kulkarni"
                            name="Ishita Kulkarni"
                            role="Co-Founder & Creative Head"
                            bio="A creative thinker and design enthusiast, Ishita brings fresh ideas to life. She leads the creative vision of the brand, blending tradition with modern aesthetics."
                            quote="Where Tradition Meets Modernity"
                            imageBgColor="#8526b5"
                            quoteAlign="right"
                        />
                    </div>

                    {/* Decorative flower — left edge */}
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 hidden xl:block pointer-events-none select-none opacity-70">
                        <LotusIcon className="w-10 h-10" />
                    </div>

                    {/* Decorative leaf sprig — bottom right */}
                    <div className="absolute right-4 bottom-0 hidden xl:block pointer-events-none select-none opacity-60">
                        <LeafSprig className="w-20 h-20" />
                    </div>
                </div>

                {/* ── Bottom stats bar ── */}
                <div className="mt-14 md:mt-16 border-t border-[#e0bee8] pt-8">
                    <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 md:gap-x-14">
                        {/* Authentic Indian Art */}
                        <StatBadge
                            label={
                                <>
                                    Authentic
                                    <br />
                                    Indian Art
                                </>
                            }
                            icon={
                                <svg
                                    viewBox="0 0 24 24"
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="#8A43BD"
                                    strokeWidth="1.5"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 3C8.5 3 6 5.5 6 8c0 2 1 3.5 3 4.5V18h6v-5.5c2-1 3-2.5 3-4.5 0-2.5-2.5-5-6-5Z"
                                    />
                                    <path strokeLinecap="round" d="M9 18h6M10 21h4" />
                                </svg>
                            }
                        />

                        {/* Premium Quality */}
                        <StatBadge
                            label={
                                <>
                                    Premium
                                    <br />
                                    Quality
                                </>
                            }
                            icon={
                                <svg
                                    viewBox="0 0 24 24"
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="#8A43BD"
                                    strokeWidth="1.5"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                    />
                                </svg>
                            }
                        />

                        {/* Customer First */}
                        <StatBadge
                            label={
                                <>
                                    Customer
                                    <br />
                                    First
                                </>
                            }
                            icon={
                                <svg
                                    viewBox="0 0 24 24"
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="#8A43BD"
                                    strokeWidth="1.5"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                    />
                                </svg>
                            }
                        />

                        {/* Sustainable Choices */}
                        <StatBadge
                            label={
                                <>
                                    Sustainable
                                    <br />
                                    Choices
                                </>
                            }
                            icon={
                                <svg
                                    viewBox="0 0 24 24"
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="#8A43BD"
                                    strokeWidth="1.5"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 8v8M8 12h8"
                                    />
                                </svg>
                            }
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
