import { ReactNode } from "react";

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
