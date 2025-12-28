import React from "react";
import Carousel from "./Carousel";
import { CAROUSEL_DEFAULT_CONFIG } from "../config/carouselConfig";

/**
 * Backward-compatible wrapper for the old slideshow, now powered by the enhanced Carousel.
 * Accepts props or can be driven by external JSON/config.
 *
 * Props:
 * - items: Array of carousel items
 * - autoplay: boolean (default: true)
 * - autoplayMs: number (default: 3000)
 * - showPrevNext: boolean (default: true)
 * - showIndicators: boolean (default: true)
 * - className: string (optional)
 * - config: object (optional - carousel config with responsive settings)
 * - enableDrag: boolean (default: false)
 */
export default function SlideshowStripe({
  items = [],
  autoplay = true,
  autoplayMs = 4000,
  showPrevNext = true,
  showIndicators = true,
  className = "",
  config = CAROUSEL_DEFAULT_CONFIG,
  enableDrag = false,
}) {
  return (
    <Carousel
      items={items}
      autoplay={autoplay}
      autoplayMs={autoplayMs}
      showPrevNext={showPrevNext}
      showIndicators={showIndicators}
      className={className}
      config={config}
      enableDrag={enableDrag}
    />
  );
}
