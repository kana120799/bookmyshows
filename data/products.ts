
export const formatPrice = (amount: number, currency: string = "inr") => {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: currency,
    }).format(amount / 100);
};

export const products = [];
