import Link from "next/link";

export default function WelcomeSection({ employee, store, pendingTodos }: any) {
    const employeeName = employee?.employeeName || "Employee";
    const storeName = store?.storeName || "your store";

    return (
        <header className="relative bg-gradient-to-r from-[#F0F7FD] to-[#DDE7F5] dark:from-[#232526] dark:to-[#3C3C3C] text-gray-900 dark:text-gray-100 p-5 sm:p-6 rounded-lg shadow-md">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold">
                Hey {employeeName}, you've logged into {storeName}.
            </h2>
            <p className="mt-2 text-sm sm:text-base md:text-lg">
                To-dos left for today:{" "}
                <Link href="/dashboard/employee/todos" className="underline font-bold text-blue-600 dark:text-blue-400">
                    {pendingTodos !== null ? pendingTodos : "Loading..."}
                </Link>
            </p>
        </header>
    );
}
