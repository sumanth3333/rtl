export function money(n: number) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(n || 0));
}
export function pct(n: number) {
    return `${(Number(n || 0)).toFixed(2)}%`;
}
export function safeNum(v: unknown) {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
}
