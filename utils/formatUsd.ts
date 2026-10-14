// ✅ AWS cost figures span from ~$16 down to fractions of a cent (e.g. 0.00002) - a flat
// toFixed(2) would render most usage-line costs as "$0.00". Use more precision below a cent.
export function formatUsd(value: number): string {
    if (!value) { return "$0.00"; }
    if (Math.abs(value) >= 0.01) { return `$${value.toFixed(2)}`; }
    return `$${parseFloat(value.toFixed(6))}`;
}
