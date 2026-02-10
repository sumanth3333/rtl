
export function num(n: number) {
    return new Intl.NumberFormat("en-US").format(Number(n || 0));
}


export function safeNumber(v: unknown): number {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
}

export function money(n: unknown): string {
    const value = safeNumber(n);
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
    }).format(value);
}

export function titleizeKey(key: string) {
    const spaced = key
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/_/g, " ")
        .trim();
    return spaced
        .split(" ")
        .map((w) => (w.length <= 2 ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1)))
        .join(" ")
        .replace("And", "&");
}
