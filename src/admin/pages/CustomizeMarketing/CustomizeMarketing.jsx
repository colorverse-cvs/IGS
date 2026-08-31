import { useRef, useState, useEffect, useCallback } from "react";
import {
    ImageIcon,
    Plus,
    Trash2,
    X,
    AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { loadMarketingItems, saveMarketingItems } from "../../../utils/marketingStorage";

/* ─────────────────────────────────
   Banner dimension requirements
───────────────────────────────── */
const BANNER_REQUIRED_WIDTH = 1200;
const BANNER_REQUIRED_HEIGHT = 400;

/* ─────────────────────────────────
   Unique ID helper
───────────────────────────────── */
let _id = Date.now(); // seed from timestamp to avoid collisions on reload
const uid = () => String(++_id);

/* ─────────────────────────────────
   Convert File → base64 data-URL
───────────────────────────────── */
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

/* ─────────────────────────────────
   Validate image pixel dimensions
───────────────────────────────── */
function validateImageDimensions(file, reqW, reqH) {
    return new Promise((resolve) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve({
                valid: img.naturalWidth === reqW && img.naturalHeight === reqH,
                actual: { width: img.naturalWidth, height: img.naturalHeight },
            });
        };
        img.onerror = () => { URL.revokeObjectURL(url); resolve({ valid: false, actual: null }); };
        img.src = url;
    });
}

/* ─────────────────────────────────
   MAIN COMPONENT
───────────────────────────────── */
export default function CustomizeMarketing() {
    /* ── Banner state ── */
    const [bannerFile, setBannerFile] = useState(null);
    const [bannerPreview, setBannerPreview] = useState(null);
    const [bannerError, setBannerError] = useState("");
    const [isValidating, setIsValidating] = useState(false);
    const bannerInputRef = useRef(null);

    /* ── Strip texts state ── */
    const [stripTexts, setStripTexts] = useState(["", ""]);

    /* ── Recent items (loaded from localStorage on mount) ── */
    const [items, setItems] = useState(() => loadMarketingItems());

    /* ── Persist to localStorage whenever items change ── */
    useEffect(() => {
        saveMarketingItems(items);
    }, [items]);

    /* ────────────────────────
       Banner handlers
    ──────────────────────── */
    const handleBannerFile = useCallback(async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        e.target.value = "";

        setBannerError("");
        setIsValidating(true);

        // 1. Validate dimensions
        const { valid, actual } = await validateImageDimensions(
            file,
            BANNER_REQUIRED_WIDTH,
            BANNER_REQUIRED_HEIGHT
        );

        if (!valid) {
            const actualStr = actual
                ? `${actual.width} × ${actual.height}px`
                : "unknown size";
            setBannerError(
                `Image rejected: got ${actualStr}, required exactly ${BANNER_REQUIRED_WIDTH} × ${BANNER_REQUIRED_HEIGHT}px.`
            );
            setIsValidating(false);
            return;
        }

        // 2. Convert to base64 for localStorage persistence
        try {
            const base64 = await fileToBase64(file);
            setBannerFile(file);
            setBannerPreview(base64);
        } catch {
            setBannerError("Failed to read the image file. Please try again.");
        } finally {
            setIsValidating(false);
        }
    }, []);

    const handleAddBanner = () => {
        if (!bannerFile || !bannerPreview) {
            toast.error("Please upload a valid banner image first.");
            return;
        }
        const newItem = {
            id: uid(),
            type: "banner",
            name: bannerFile.name.replace(/\.[^/.]+$/, "") || "Banner",
            preview: bannerPreview, // base64 — safe for localStorage
            active: true,
        };
        setItems((prev) => [newItem, ...prev]);
        setBannerFile(null);
        setBannerPreview(null);
        setBannerError("");
        toast.success("Banner added and saved!");
    };

    /* ────────────────────────
       Strip handlers
    ──────────────────────── */
    const addStripText = () => setStripTexts((prev) => [...prev, ""]);

    const updateStripText = (index, value) =>
        setStripTexts((prev) => prev.map((t, i) => (i === index ? value : t)));

    const removeStripText = (index) =>
        setStripTexts((prev) => prev.filter((_, i) => i !== index));

    const handleAddStrip = () => {
        const nonEmpty = stripTexts.filter((t) => t.trim());
        if (!nonEmpty.length) {
            toast.error("Please enter at least one strip text.");
            return;
        }
        const newItem = {
            id: uid(),
            type: "strip",
            name: nonEmpty.join(" | "),
            preview: null,
            active: true,
            texts: nonEmpty,
        };
        setItems((prev) => [newItem, ...prev]);
        setStripTexts(["", ""]);
        toast.success("Strip added and saved!");
    };

    /* ────────────────────────
       Recent item actions
    ──────────────────────── */
    const deleteItem = (id) => {
        setItems((prev) => prev.filter((item) => item.id !== id));
        toast.success("Removed.");
    };



    /* ─── derived ─── */
    const firstBanner = items.find((i) => i.type === "banner" && i.preview);
    const bannerItems = items.filter((i) => i.type === "banner");
    const stripItems = items.filter((i) => i.type === "strip");

    return (
        <div className="space-y-6">

            {/* ── PAGE HEADER ── */}
            <div>
                <p className="text-xl !font-medium text-gray-900">Customize Marketing</p>
                <p className="text-sm text-gray-500 mt-0.5">
                    Create and manage promotional banners and strips for your website.
                </p>
            </div>

            {/* ── TWO-COLUMN CARDS ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* LEFT: Customize Banner */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col">
                    <div className="p-5 flex-1 space-y-4">
                        <div>
                            <p className="text-sm !font-medium text-gray-900">Customize Banner</p>
                            <p className="text-xs text-gray-400 mt-0.5">
                                Create a promotional banner for your website.
                            </p>
                        </div>

                        {/* Upload area */}
                        <div
                            onClick={() => !isValidating && bannerInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 transition-all
                                ${isValidating ? "border-brand-300 bg-brand-25 cursor-wait" : "border-gray-200 cursor-pointer hover:border-brand-400 hover:bg-brand-25"}
                                ${bannerError ? "border-red-300 bg-red-50" : ""}`}
                            style={{ minHeight: "120px" }}
                        >
                            {isValidating ? (
                                <div className="flex flex-col items-center gap-2 py-6 text-brand-500">
                                    <div className="w-6 h-6 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
                                    <span className="text-xs">Validating dimensions…</span>
                                </div>
                            ) : bannerPreview ? (
                                <div className="relative w-full">
                                    <img
                                        src={bannerPreview}
                                        alt="Banner preview"
                                        className="w-full h-36 object-cover rounded-lg"
                                    />
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setBannerFile(null);
                                            setBannerPreview(null);
                                            setBannerError("");
                                        }}
                                        className="absolute top-2 right-2 bg-white rounded-full p-1 shadow text-gray-500 hover:text-red-500 cursor-pointer"
                                    >
                                        <X size={13} />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-1 py-6 text-gray-400">
                                    <div className="w-12 h-12 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                                        <ImageIcon className="w-6 h-6 text-gray-300" />
                                    </div>
                                    <span className="text-xs">Upload Image</span>
                                </div>
                            )}
                        </div>

                        {/* Dimension error */}
                        {bannerError && (
                            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
                                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-red-600">{bannerError}</p>
                            </div>
                        )}

                        <input
                            ref={bannerInputRef}
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={handleBannerFile}
                        />

                        {/* Dimension note */}
                        <p className="text-xs text-gray-400">
                            <span className="font-medium text-gray-500">Note:</span>{" "}
                            Required image size is exactly{" "}
                            <span className="font-medium text-gray-600">{BANNER_REQUIRED_WIDTH} × {BANNER_REQUIRED_HEIGHT}px.</span>{" "}
                            Supported formats: JPG, PNG, WEBP.
                        </p>
                    </div>

                    {/* Add Banner button */}
                    <button
                        onClick={handleAddBanner}
                        disabled={isValidating}
                        className="w-full py-3 bg-brand-700 hover:bg-brand-800 disabled:bg-gray-400 text-white text-sm font-medium rounded-b-xl flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:cursor-not-allowed"
                    >
                        <Plus size={16} />
                        Add Banner
                    </button>
                </div>

                {/* RIGHT: Customize Strip */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col">
                    <div className="p-5 flex-1 space-y-4">
                        <div>
                            <p className="text-sm !font-medium text-gray-900">Customize Strip</p>
                            <p className="text-xs text-gray-400 mt-0.5">
                                Create a promotional strip for your website.
                            </p>
                        </div>

                        {/* Dynamic text inputs */}
                        <div className="space-y-2.5">
                            {stripTexts.map((text, index) => (
                                <div key={index}>
                                    <label className="text-xs text-gray-500 mb-1 block">
                                        Text {index + 1}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={text}
                                            onChange={(e) => updateStripText(index, e.target.value)}
                                            placeholder={`Enter text ${index + 1}…`}
                                            className="w-full border border-gray-200 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
                                        />
                                        {stripTexts.length > 1 && (
                                            <button
                                                onClick={() => removeStripText(index)}
                                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 cursor-pointer transition-colors"
                                            >
                                                <X size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* + Add Text link */}
                        <button
                            onClick={addStripText}
                            className="flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700 font-medium cursor-pointer transition-colors"
                        >
                            <Plus size={14} />
                            Add Text
                        </button>
                    </div>

                    {/* Add Strip button */}
                    <button
                        onClick={handleAddStrip}
                        className="w-full py-3 bg-brand-700 hover:bg-brand-800 text-white text-sm font-medium rounded-b-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                        <Plus size={16} />
                        Add Strip
                    </button>
                </div>
            </div>

            {/* ── RECENT SECTION ── */}
            <div className="space-y-4">
                <div>
                    <p className="text-base !font-medium text-gray-900">Recent</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                        Manage your recently created banners and strips.
                    </p>
                </div>

                {items.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-6 py-12 text-center">
                        <ImageIcon className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                        <p className="text-sm text-gray-400">
                            No banners or strips yet. Add one above to get started.
                        </p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

                        {/* Hero banner image preview */}
                        {firstBanner && (
                            <div className="w-full h-48 md:h-64 overflow-hidden">
                                <img
                                    src={firstBanner.preview}
                                    alt="Latest banner"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}

                        {/* ── Banner sub-section ── */}
                        {bannerItems.length > 0 && (
                            <div>
                                <div className="px-5 pt-4 pb-2">
                                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                                        Banners
                                    </p>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {bannerItems.map((item) => (
                                        <RecentRow
                                            key={item.id}
                                            item={item}
                                            onDelete={deleteItem}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Gray divider */}
                        {bannerItems.length > 0 && stripItems.length > 0 && (
                            <hr className="border-gray-200 mx-5 my-1" />
                        )}

                        {/* ── Strip sub-section ── */}
                        {stripItems.length > 0 && (
                            <div>
                                <div className="px-5 pt-4 pb-2">
                                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                                        Strips
                                    </p>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {stripItems.map((item) => (
                                        <RecentRow
                                            key={item.id}
                                            item={item}
                                            onDelete={deleteItem}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

/* ─────────────────────────────────
   Recent row — Delete only
───────────────────────────────── */
function RecentRow({ item, onDelete }) {
    return (
        <div className="flex items-center justify-between px-5 py-3.5 gap-4 hover:bg-gray-50 transition-colors">
            <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                <p className="text-xs text-gray-400 mt-0.5 capitalize">
                    Type: {item.type === "banner" ? "Banner" : "Strip"}
                </p>
            </div>

            <button
                onClick={() => onDelete(item.id)}
                className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-red-50 hover:border-red-200 text-red-500 hover:text-red-700 transition-all cursor-pointer flex-shrink-0"
            >
                <Trash2 size={13} />
                <span>Delete</span>
            </button>
        </div>
    );
}
