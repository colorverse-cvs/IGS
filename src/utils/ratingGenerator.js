
export const generateRating = (productId) => {
    // Use product ID to seed the random number for consistency
    const seed = productId ? hashCode(productId) : Math.random();
    const min = 3.6;
    const max = 4.7;
    const rating = min + (seed % 1) * (max - min);
    return Math.round(rating * 10) / 10; // Round to 1 decimal
};


export const generateReviewCount = (productId) => {
    // Use product ID to seed the random number for consistency
    const seed = productId ? hashCode(productId) : Math.random();
    const min = 6;
    const max = 25;
    const count = Math.floor(min + (seed % 1) * (max - min + 1));
    return count;
};


export const generateRatingAndReviews = (productId) => {
    return {
        rating: generateRating(productId),
        reviews: generateReviewCount(productId),
    };
};

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
