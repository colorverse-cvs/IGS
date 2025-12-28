/**
 * Centralized Carousel Configuration
 * Standard settings for all carousel/stripe sections across the application
 * Ensures consistency in autoplay timing, responsive behavior, and UI controls
 */

export const CAROUSEL_DEFAULT_CONFIG = {
    // Autoplay Settings
    autoplay: true,
    autoplayMs: 4000, // 3 seconds - standard for all carousels

    // UI Controls
    showPrevNext: true, // Show prev/next arrow buttons
    showIndicators: true, // Show dot indicators at bottom

    // Responsive Breakpoints (matches Tailwind breakpoints)
    responsive: {
        sm: {
            // Mobile: < 768px
            itemsPerView: 1,
            step: 1, // Move one item at a time
            gapSize: 4, // px-1 (4px on each side)
        },
        md: {
            // Tablet: 768px - 1023px
            itemsPerView: 2,
            step: 1, // Move one item at a time for smooth strip effect
            gapSize: 4,
        },
        lg: {
            // Desktop: >= 1024px
            itemsPerView: 4,
            step: 4, // Move entire page at once
            gapSize: 4,
        },
    },

    // Animation
    transitionDuration: 500, // ms for slide transition
    transitionEasing: "ease-out",
};

/**
 * Section-Specific Overrides
 */

// Hero section main carousel (right panel on home page)
export const HERO_MAIN_CAROUSEL_CONFIG = {
    ...CAROUSEL_DEFAULT_CONFIG,
    showPrevNext: true,
    showIndicators: true,
};

// Hero section side panels (left top/bottom on home page)
// Clean aesthetic - no controls shown
export const HERO_SIDE_PANEL_CONFIG = {
    ...CAROUSEL_DEFAULT_CONFIG,
    showPrevNext: false, // Hidden for side panels
    showIndicators: false, // Hidden for side panels
};

// Product carousel (CategoryPage, RelatedProducts, etc)
export const PRODUCT_CAROUSEL_CONFIG = {
    ...CAROUSEL_DEFAULT_CONFIG,
    showPrevNext: true,
    showIndicators: false, // Optional: disable indicators for product lists
};

// Testimonials carousel
export const TESTIMONIALS_CAROUSEL_CONFIG = {
    ...CAROUSEL_DEFAULT_CONFIG,
    showPrevNext: true,
    showIndicators: false, // Optional: use drag indicators instead
    enableDrag: true, // Enable touch/mouse drag
};

/**
 * Helper function to get responsive settings based on viewport width
 * @param {number} viewportWidth - Current window.innerWidth
 * @param {object} config - Carousel config object
 * @returns {object} - Responsive settings for current viewport
 */
export function getResponsiveSettings(viewportWidth, config = CAROUSEL_DEFAULT_CONFIG) {
    if (viewportWidth >= 1024) {
        return config.responsive.lg;
    } else if (viewportWidth >= 768) {
        return config.responsive.md;
    } else {
        return config.responsive.sm;
    }
}

/**
 * Helper function to calculate grid/carousel dimensions
 * @param {number} viewportWidth
 * @param {number} itemCount - Total items
 * @param {object} config - Carousel config
 * @returns {object} - width%, can show carousel, etc
 */
export function getCarouselDimensions(
    viewportWidth,
    itemCount,
    config = CAROUSEL_DEFAULT_CONFIG
) {
    const settings = getResponsiveSettings(viewportWidth, config);
    const widthPercent = 100 / settings.itemsPerView;
    const canShowCarousel = itemCount > settings.itemsPerView;

    return {
        widthPercent,
        itemsPerView: settings.itemsPerView,
        step: settings.step,
        canShowCarousel,
        gapSize: settings.gapSize,
    };
}

export default CAROUSEL_DEFAULT_CONFIG;
