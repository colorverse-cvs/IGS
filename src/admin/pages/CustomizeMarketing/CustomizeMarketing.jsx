import { useRef, useState, useEffect, useCallback } from "react";
import {
    ImageIcon,
    Plus,
    Trash2,
    X,
    AlertCircle,
    Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import { uploadBannerImage, deleteBannerImage, fetchBannerImage } from "../../../utils/marketingApi";

/* ─────────────────────────────────
   Banner dimension requirements
───────────────────────────────── */
const BANNER_REQUIRED_WIDTH = 1200;
const BANNER_REQUIRED_HEIGHT = 400;

/* ─────────────────────────────────
   Unique ID helper
───────────────────────────────── */
let _id = Date.now();
const uid = () => String(++_id);

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
    /* ── Banner upload state ── */
    const [bannerFile, setBannerFile] = useState(null);
    const [bannerPreview, setBannerPreview] = useState(null); // blob URL for local preview
    const [bannerError, setBannerError] = useState("");
    const [isValidating, setIsValidating] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const bannerInputRef = useRef(null);

    /* ── Live banner from API ── */
    const [currentBannerUrl, setCurrentBannerUrl] = useState(null);
    const [currentBannerName, setCurrentBannerName] = useState(null);
    const [deletingBanner, setDeletingBanner] = useState(false);

    /* ── Strip state (in-memory only, no persistence) ── */
    const [stripTexts, setStripTexts] = useState(["", ""]);
    const [strips, setStrips] = useState([]); // { id, name, texts }
    const [deletingStripId, setDeletingStripId] = useState(null);

    /* ── Fetch live banner on mount ── */
    useEffect(() => {
        fetchBannerImage()
            .then((data) => {
                setCurrentBannerUrl(data?.imageUrl ?? null);
                setCurrentBannerName(data?.imageFilename ?? null);
            })
            .catch(() => {
                setCurrentBannerUrl(null);
                setCurrentBannerName(null);
            });
    }, []);

    /* ── Revoke blob URL on unmount / change ── */
    useEffect(() => {
        return () => {
            if (bannerPreview) URL.revokeObjectURL(bannerPreview);
        };
    }, [bannerPreview]);

    /* ────────────────────────
       Banner handlers
    ──────────────────────── */
    const handleBannerFile = useCallback(async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        e.target.value = "";

        setBannerError("");
        setIsValidating(true);

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

        // Use blob URL for local preview (no base64 / no localStorage)
        if (bannerPreview) URL.revokeObjectURL(bannerPreview);
        setBannerFile(file);
        setBannerPreview(URL.createObjectURL(file));
        setIsValidating(false);
    }, [bannerPreview]);

    const handleAddBanner = async () => {
        if (!bannerFile) {
            toast.error("Please upload a valid banner image first.");
            return;
        }

        setIsUploading(true);
        try {
            const { imageUrl, imageFilename } = await uploadBannerImage(bannerFile);
            setCurrentBannerUrl(imageUrl);
            setCurrentBannerName(imageFilename);
            // Clean up local preview
            if (bannerPreview) URL.revokeObjectURL(bannerPreview);
            setBannerFile(null);
            setBannerPreview(null);
            setBannerError("");
            toast.success("Banner uploaded and saved!");
        } catch (err) {
            toast.error(err.message || "Failed to upload banner. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeleteBanner = async () => {
        setDeletingBanner(true);
        try {
            await deleteBannerImage();
            setCurrentBannerUrl(null);
            setCurrentBannerName(null);
            toast.success("Banner removed.");
        } catch (err) {
            toast.error(err.message || "Failed to delete banner.");
        } finally {
            setDeletingBanner(false);
        }
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
        const newStrip = {
            id: uid(),
            name: nonEmpty.join(" | "),
            texts: nonEmpty,
        };
        setStrips((prev) => [newStrip, ...prev]);
        setStripTexts(["", ""]);
        toast.success("Strip added!");
    };

    const deleteStrip = (id) => {
        setDeletingStripId(id);
        setTimeout(() => {
            setStrips((prev) => prev.filter((s) => s.id !== id));
            setDeletingStripId(null);
            toast.success("Strip removed.");
        }, 150);
    };

    /* ─── derived ─── */
    const hasBanner = !!currentBannerUrl;
    const hasStrips = strips.length > 0;

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
                            onClick={() => !isValidating && !isUploading && bannerInputRef.current?.click()}
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
                                            if (bannerPreview) URL.revokeObjectURL(bannerPreview);
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
                        disabled={isValidating || isUploading}
                        className="w-full py-3 bg-brand-700 hover:bg-brand-800 disabled:bg-gray-400 text-white text-sm font-medium rounded-b-xl flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:cursor-not-allowed"
                    >
                        {isUploading ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Uploading…
                            </>
                        ) : (
                            <>
                                <Plus size={16} />
                                Add Banner
                            </>
                        )}
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
                        Manage your active banner and strips.
                    </p>
                </div>

                {!hasBanner && !hasStrips ? (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-6 py-12 text-center">
                        <ImageIcon className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                        <p className="text-sm text-gray-400">
                            No banners or strips yet. Add one above to get started.
                        </p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

                        {/* ── Banner sub-section ── */}
                        {hasBanner && (
                            <div>
                                {/* Hero preview */}
                                <div className="w-full h-48 md:h-64 overflow-hidden">
                                    <img
                                        src={currentBannerUrl}
                                        alt="Active banner"
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                <div className="px-5 pt-4 pb-2">
                                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                                        Banner
                                    </p>
                                </div>

                                {/* Single banner row */}
                                <div className="flex items-center justify-between px-5 py-3.5 gap-4 hover:bg-gray-50 transition-colors">
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-gray-800 truncate">
                                            {currentBannerName || "Active Banner"}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-0.5">Type: Banner</p>
                                    </div>
                                    <button
                                        onClick={handleDeleteBanner}
                                        disabled={deletingBanner}
                                        className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-red-50 hover:border-red-200 text-red-500 hover:text-red-700 transition-all cursor-pointer flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {deletingBanner ? (
                                            <Loader2 size={13} className="animate-spin" />
                                        ) : (
                                            <Trash2 size={13} />
                                        )}
                                        <span>{deletingBanner ? "Deleting…" : "Delete"}</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Gray divider */}
                        {hasBanner && hasStrips && (
                            <hr className="border-gray-200 mx-5 my-1" />
                        )}

                        {/* ── Strip sub-section ── */}
                        {hasStrips && (
                            <div>
                                <div className="px-5 pt-4 pb-2">
                                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                                        Strips
                                    </p>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {strips.map((strip) => (
                                        <div
                                            key={strip.id}
                                            className="flex items-center justify-between px-5 py-3.5 gap-4 hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-gray-800 truncate">{strip.name}</p>
                                                <p className="text-xs text-gray-400 mt-0.5">Type: Strip</p>
                                            </div>
                                            <button
                                                onClick={() => deleteStrip(strip.id)}
                                                disabled={deletingStripId === strip.id}
                                                className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-red-50 hover:border-red-200 text-red-500 hover:text-red-700 transition-all cursor-pointer flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {deletingStripId === strip.id ? (
                                                    <Loader2 size={13} className="animate-spin" />
                                                ) : (
                                                    <Trash2 size={13} />
                                                )}
                                                <span>{deletingStripId === strip.id ? "Removing…" : "Delete"}</span>
                                            </button>
                                        </div>
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
