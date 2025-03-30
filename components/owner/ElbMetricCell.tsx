interface ElbMetricCellProps {
    achieved: number;
    total: number;
    remaining: number;
    isMobile?: boolean;  // New prop for mobile
}

export default function ElbMetricCell({ achieved, total, remaining, isMobile = false }: ElbMetricCellProps) {
    const remainingClass = remaining < 0 ? "text-green-500" : "text-red-500";
    const formattedRemaining = remaining < 0 ? `+${Math.abs(remaining)}` : `-${remaining}`;

    // ✅ For Desktop (Table)
    if (!isMobile) {
        return (
            <td className="p-3 text-center">
                <span className="text-blue-600 font-semibold">{achieved}</span> / {total}
                <br />
                <span className={`text-sm ${remainingClass}`}>{formattedRemaining}</span>
            </td>
        );
    }

    // ✅ For Mobile (Div)
    return (
        <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Achieved:</span>
            <span className="text-blue-600 font-semibold">{achieved} / {total}</span>
            <span className={`text-sm ${remainingClass}`}>{formattedRemaining}</span>
        </div>
    );
}
