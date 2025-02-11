import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarItemProps {
    name: string;
    path: string;
    icon?: React.ElementType;
    isCollapsed: boolean;
}

export default function SidebarItem({ name, path, icon: Icon, isCollapsed }: SidebarItemProps) {
    const pathname = usePathname();
    const isActive = pathname === path; // ✅ Active state check

    return (
        <div className="relative group">
            <Link
                href={path}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 relative
                hover:bg-gray-200 dark:hover:bg-gray-800
                ${isCollapsed ? "justify-center" : "pl-4 pr-6"}
                ${isActive ? "bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold" : "text-gray-600 dark:text-gray-400"}`}
            >
                {/* ✅ Icon - Always Visible */}
                <div
                    className={`transition-all duration-200 ${isActive ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"}`}
                >
                    {Icon && <Icon className="w-6 h-6" />}
                </div>

                {/* ✅ Name - Hide when Collapsed */}
                <span
                    className={`text-sm font-medium transition-opacity duration-300 ease-in-out
                    ${isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto"}`}
                >
                    {name}
                </span>

                {/* ✅ Tooltip for Collapsed Mode */}
                {isCollapsed && (
                    <span
                        className="absolute left-16 bg-gray-900 text-white text-xs font-medium rounded-md px-3 py-1 shadow-lg 
                        opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200 whitespace-nowrap"
                    >
                        {name}
                    </span>
                )}

                {/* ✅ Left Active Indicator (if active) */}
                {isActive && (
                    <span className="absolute left-0 top-0 h-full w-1 bg-blue-500 dark:bg-blue-400 rounded-r-lg"></span>
                )}
            </Link>
        </div>
    );
}
