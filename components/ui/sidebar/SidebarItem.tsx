import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarItemProps {
    name: string;
    path: string;
    icon?: React.ElementType;
    isCollapsed: boolean;
    onClick?: () => void;
}

export default function SidebarItem({
    name,
    path,
    icon: Icon,
    isCollapsed,
    onClick,
}: SidebarItemProps) {
    const pathname = usePathname();
    const isActive = pathname === path;

    return (
        <div className="relative group">
            <Link
                href={path}
                onClick={onClick}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-2.5 rounded-md transition-all duration-200 relative border border-transparent
          hover:bg-gray-200/80 hover:border-gray-300/80 dark:hover:bg-gray-800/80 dark:hover:border-gray-700/80
          ${isCollapsed ? "justify-center h-10 w-10 mx-auto p-0" : "px-3 py-2.5"}
          ${isActive
                        ? "bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-500/15 dark:border-blue-500/30 dark:text-blue-100 font-semibold"
                        : "text-gray-700 dark:text-gray-300"}`}
            >
                {/* Icon - Always Visible */}
                <div
                    className={`transition-all duration-200 ${isActive
                            ? "text-blue-700 dark:text-blue-200"
                            : "text-gray-500 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200"
                        }`}
                >
                    {Icon && <Icon className="w-5 h-5" />}
                </div>

                {/* Name - Hidden when collapsed */}
                <span
                    className={`text-[13px] leading-5 font-medium transition-opacity duration-300 ease-in-out ${isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto"
                        }`}
                >
                    {name}
                </span>

                {/* Tooltip for collapsed mode */}
                {isCollapsed && (
                    <span className="absolute left-14 z-10 bg-gray-900 text-white text-xs font-medium rounded-md px-2.5 py-1 shadow-lg opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200 whitespace-nowrap pointer-events-none">
                        {name}
                    </span>
                )}

                {/* Left Active Indicator */}
                {isActive && !isCollapsed && (
                    <span className="absolute left-0 top-1/2 h-6 -translate-y-1/2 w-1 bg-blue-500 dark:bg-blue-400 rounded-r-md"></span>
                )}
            </Link>
        </div>
    );
}
