import Link from "next/link";

interface CardProps {
    title: string;
    description: string;
    link: string;
}

export default function Card({ title, description, link }: CardProps) {
    return (
        <Link
            href={link}
            className="group block bg-gradient-to-br from-gray-900 to-gray-800 text-white p-4 sm:p-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] hover:from-gray-800 hover:to-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
            {/* Title */}
            <h2 className="text-lg sm:text-xl font-bold tracking-wide transition-colors group-hover:text-blue-400">
                {title}
            </h2>

            {/* Description - hidden on small screens */}
            <p className="text-sm text-gray-300 mt-2 group-hover:text-gray-200 hidden sm:block">
                {description}
            </p>
        </Link>
    );
}
