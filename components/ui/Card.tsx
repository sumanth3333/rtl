import { ReactNode } from "react";
import clsx from "clsx";


interface CardProps {
    children: ReactNode;
    className?: string;
}

export function Card({ children, className = "" }: CardProps) {
    return (
        <div className={`bg-white shadow-md rounded-2xl p-4 ${className}`}>
            {children}
        </div>
    );
}

export function CardHeader({ children, className = "" }: { children: ReactNode; className?: string }) {
    return (
        <div className={clsx("border-b border-gray-200 dark:border-gray-700 px-4 py-3", className)}>
            {children}
        </div>
    );
}

export function CardTitle({ children, className = "" }: { children: ReactNode; className?: string }) {
    return (
        <h2 className={clsx("text-lg font-semibold text-gray-800 dark:text-gray-100", className)}>
            {children}
        </h2>
    );
}

export function CardContent({ children, className = "" }: { children: ReactNode; className?: string }) {
    return <div className={clsx("px-4 py-3", className)}>{children}</div>;
}
