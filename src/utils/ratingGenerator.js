/**
 * Generate random rating and review count for products
 * 
 * Rating: Between 3.6 and 4.7
 * Reviews: Between 6 and 25
 */

/**
 * Generate a random rating between 3.6 and 4.7
 * @param {string} productId - Product ID to ensure consistent rating for same product
 * @returns {number} Rating rounded to 1 decimal place
 */
export const generateRating = (productId) => {
    // Use product ID to seed the random number for consistency
    const seed = productId ? hashCode(productId) : Math.random();
    const min = 3.6;
    const max = 4.7;
    const rating = min + (seed % 1) * (max - min);
    return Math.round(rating * 10) / 10; // Round to 1 decimal
};

/**
 * Generate a random review count between 6 and 25
 * @param {string} productId - Product ID to ensure consistent count for same product
 * @returns {number} Whole number of reviews
 */
export const generateReviewCount = (productId) => {
    // Use product ID to seed the random number for consistency
    const seed = productId ? hashCode(productId) : Math.random();
    const min = 6;
    const max = 25;
    const count = Math.floor(min + (seed % 1) * (max - min + 1));
    return count;
};

/**
 * Generate both rating and review count
 * @param {string} productId - Product ID to ensure consistency
 * @returns {object} Object with rating and reviews properties
 */
export const generateRatingAndReviews = (productId) => {
    return {
        rating: generateRating(productId),
        reviews: generateReviewCount(productId),
    };
};

/**
 * Simple hash function to convert string to number (0-1 range)
 * Ensures same product ID always generates same rating/reviews
 */
const hashCode = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    // Convert to 0-1 range
    return Math.abs(hash) / 2147483647;
};
