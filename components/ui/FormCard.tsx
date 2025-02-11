import React from "react";

interface FormCardProps {
    title?: string;
    children: React.ReactNode;
}

export default function FormCard({ title, children }: FormCardProps) {
    return (
        <div className="w-full max-w-4xl mx-auto px-6 py-8 bg-gray-100 dark:bg-gray-800 rounded-lg">
            {title && <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-100 text-center">{title}</h2>}
            {children}
        </div>
    );
}
