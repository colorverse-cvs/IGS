
export const getDiscountedPrice = (price, discount) => {
    const originalPrice = parseFloat(price);
    if (isNaN(originalPrice)) return 0;

    if (!discount) return originalPrice;

    let discountValue = 0;

    if (typeof discount === "string") {
        const match = discount.match(/(\d+(\.\d+)?)/);
        if (match) {
            discountValue = parseFloat(match[0]);
        }
    } else if (typeof discount === "number") {
        discountValue = discount;
    }

    if (discountValue > 0) {
        const discountedAmount = (originalPrice * discountValue) / 100;
        return Math.round(originalPrice - discountedAmount);
    }

    return originalPrice;
};
