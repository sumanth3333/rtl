"use client";

interface SkeletonTableProps {
    rows?: number;
}

export default function SkeletonTable({ rows = 5 }: SkeletonTableProps) {
    return (
        <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse">
                <thead>
                    <tr>
                        <th className="px-4 py-3 bg-gray-300 dark:bg-gray-600 animate-pulse"></th>
                        <th className="px-4 py-3 bg-gray-300 dark:bg-gray-600 animate-pulse"></th>
                        <th className="px-4 py-3 bg-gray-300 dark:bg-gray-600 animate-pulse"></th>
                        <th className="px-4 py-3 bg-gray-300 dark:bg-gray-600 animate-pulse"></th>
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: rows }).map((_, i) => (
                        <tr key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700">
                            <td className="px-4 py-3 bg-gray-300 dark:bg-gray-600"></td>
                            <td className="px-4 py-3 bg-gray-300 dark:bg-gray-600"></td>
                            <td className="px-4 py-3 bg-gray-300 dark:bg-gray-600"></td>
                            <td className="px-4 py-3 bg-gray-300 dark:bg-gray-600"></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
