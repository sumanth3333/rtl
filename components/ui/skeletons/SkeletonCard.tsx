"use client";

export default function SkeletonCard() {
    return (
        <div className="animate-pulse bg-gray-200 dark:bg-gray-700 p-6 rounded-lg shadow-md">
            <div className="h-6 bg-gray-300 dark:bg-gray-600 w-3/4 mb-2 rounded"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 w-1/2 rounded"></div>
        </div>
    );
}
