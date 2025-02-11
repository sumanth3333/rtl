import { ChevronLeftIcon, UserCircleIcon } from "@heroicons/react/24/outline";

interface SidebarHeaderProps {
    isCollapsed: boolean;
    setIsCollapsed: (value: boolean) => void;
    username: string;
    role: string;
}

export default function SidebarHeader({ isCollapsed, setIsCollapsed, username, role }: SidebarHeaderProps) {
    return (
        <div className={`relative flex items-center justify-between px-4 py-5 border-b 
            bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg shadow-md dark:shadow-lg 
            border-gray-200 dark:border-gray-700 transition-all duration-300
            ${isCollapsed ? "py-3 px-2" : "py-5 px-4"}`}>

            {/* ✅ User Profile (Hidden when Collapsed) */}
            {!isCollapsed && (
                <div className="flex items-center gap-3">
                    {/* Profile Image Placeholder */}
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-semibold uppercase">
                        {username ? username.charAt(0) : <UserCircleIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />}
                    </div>

                    {/* User Details */}
                    <div className="flex flex-col">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{username || "User"}</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{role}</p>
                    </div>
                </div>
            )}

            {/* ✅ Collapse Button (Rotates on Click) */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className={`p-2 rounded-full bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700
                    transition-all duration-300 transform ${isCollapsed ? "rotate-180" : "rotate-0"}`}
            >
                <ChevronLeftIcon className="w-6 h-6 text-gray-900 dark:text-white" />
            </button>
        </div>
    );
}
