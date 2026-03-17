"use client";

interface Props {
    visible: boolean;
    progress: number;
}

export default function UploadProgressBar({ visible, progress }: Props) {
    if (!visible) {
        return null;
    }
    return (
        <div className="mt-2">
            <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300 mb-1">
                <span>Uploading</span>
                <span>{progress}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-indigo-500 via-blue-500 to-teal-400 transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>
            {progress === 100 && (
                <div className="mt-2 text-xs text-green-600 dark:text-green-400 animate-pulse">
                    Upload complete!
                </div>
            )}
        </div>
    );
}
