import React from "react";
import Carousel from "./Carousel";

/**
 * Backward-compatible wrapper for the old slideshow, now powered by the new Carousel.
 * Accepts props or can be driven by external JSON/config.
 */
export default function SlideshowStripe({
  items = [],
  autoplay = true,
  autoplayMs = 3000,
  showPrevNext = true,
  showIndicators = true,
  className = "",
}) {
  return (
    <Carousel
      items={items}
      autoplay={autoplay}
      autoplayMs={autoplayMs}
      showPrevNext={showPrevNext}
      showIndicators={showIndicators}
      className={className}
    />
  );
}
