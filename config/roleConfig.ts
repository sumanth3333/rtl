import {
    BuildingOfficeIcon, BuildingStorefrontIcon, DocumentTextIcon, CreditCardIcon, CalendarIcon, ChartBarIcon, ChartBarSquareIcon,
    UserGroupIcon, UsersIcon, HomeIcon, CurrencyDollarIcon, ChartPieIcon, ArrowTrendingUpIcon, ClipboardDocumentListIcon,
    CalendarDaysIcon, ArchiveBoxIcon, CheckCircleIcon, DevicePhoneMobileIcon, BanknotesIcon, ClipboardDocumentCheckIcon,
    ClockIcon,
    DocumentMagnifyingGlassIcon,
    ArrowsRightLeftIcon
} from "@heroicons/react/24/outline";
import React from "react";
// roleConfig.ts - Centralized role-based configuration
export type Role = "ADMIN" | "EMPLOYEE" | "MANAGER" | "OWNER";

// ✅ Sidebar Links for Each Role
export const sidebarLinks: Record<Role, {
    name: string; path: string, icon: React.ElementType
}[]> = {
    ADMIN: [
        {
            name: "Home",
            path: "/dashboard/admin",
            icon: HomeIcon
        },
        {
            name: "Create Company",
            path: "/dashboard/admin/create-company",
            icon: BuildingOfficeIcon
        },
        {
            name: "Manage Stores",
            path: "/dashboard/admin/stores",
            icon: BuildingStorefrontIcon
        },
        {
            name: "Generate Invoices",
            path: "/dashboard/admin/invoices",
            icon: DocumentTextIcon
        },
        {
            name: "Setup Payments",
            path: "/dashboard/admin/payments",
            icon: CreditCardIcon
        }
    ],

    EMPLOYEE: [
        {
            name: "Home",
            path: "/dashboard/employee",
            icon: HomeIcon
        },
        // {
        //     name: "Today's Goal",  // ✅ Added goal tracking
        //     path: "/dashboard/employee/todays-goal",
        //     icon: CheckCircleIcon
        // },
        {
            name: "Tasks",
            path: "/dashboard/employee/todos",
            icon: ClipboardDocumentListIcon
        },
        {
            name: "End of Day Report",
            path: "/dashboard/employee/eod-report",
            icon: DocumentTextIcon
        },
        {
            name: "Inventory Management",
            path: "/dashboard/employee/log-inventory",
            icon: ArchiveBoxIcon
        },
        {
            name: "Device Upgrades",
            path: "/dashboard/employee/manage-upgrades",
            icon: DevicePhoneMobileIcon
        },
        // {
        //     name: "Work Schedule",
        //     path: "/dashboard/employee/schedule",
        //     icon: CalendarDaysIcon
        // }
    ],
    MANAGER: [
        {
            name: "Home",
            path: "/dashboard/manager",
            icon: HomeIcon
        },
        {
            name: "Team Overview",
            path: "/dashboard/manager/overview",
            icon: ChartBarIcon
        },
        {
            name: "Assign Todos",
            path: "/dashboard/manager/reports",
            icon: ChartBarSquareIcon
        }
    ],
    OWNER: [
        {
            name: "Home",
            path: "/dashboard/owner",
            icon: HomeIcon
        },
        // {
        //     name: "Manage Managers",
        //     path: "/dashboard/owner/manage-managers",
        //     icon: UserGroupIcon
        // },
        {
            name: "Manage Employees",
            path: "/dashboard/owner/manage-employees",
            icon: UsersIcon
        },
        {
            name: "Manage Stores",
            path: "/dashboard/owner/manage-stores",
            icon: BuildingStorefrontIcon
        },
        {
            name: "Paychecks",
            path: "/dashboard/owner/paychecks",
            icon: CurrencyDollarIcon
        },
        {
            name: "Cash Collection",
            path: "/dashboard/owner/cash-collection",
            icon: BanknotesIcon,
        }, {
            name: "Inventory Re-order",
            path: "/dashboard/owner/inventory-reorder",
            icon: ClipboardDocumentCheckIcon,
        },
        // {
        //     name: "Manage Expenses",
        //     path: "/dashboard/owner/manage-expenses",
        //     icon: ChartPieIcon
        // },
        // {
        //     name: "Profit/Loss",
        //     path: "/dashboard/owner/manage-pandl",
        //     icon: ArrowTrendingUpIcon
        // }
    ]
};

// ✅ Dashboard Cards for Each Role
export const dashboardCards: Record<Role, { title: string; description: string; link: string }[]> = {
    ADMIN: [
        { title: "Create Company", description: "Generate owner login details", link: "/dashboard/admin/create-company" },
        { title: "Manage Stores", description: "View & update stores by company", link: "/dashboard/admin/stores" },
        { title: "Generate Invoices", description: "Create invoices for companies", link: "/dashboard/admin/invoices" },
        { title: "Setup Payments", description: "Configure payment methods", link: "/dashboard/admin/payments" },
    ],
    EMPLOYEE: [
        // {
        //     title: "Today's Goal",  // ✅ Added new card
        //     description: "Stay focused and track your daily sales goal",
        //     link: "/dashboard/employee/todays-goal"
        // },
        {
            title: "Tasks",
            description: "Stay on top of your todos by viewing, updating, and completing tasks efficiently.",
            link: "/dashboard/employee/todos"
        },
        {
            title: "End of Day Report",
            description: "submit a detailed summary of daily sales, transactions, and other store activities.",
            link: "/dashboard/employee/eod-report"
        },
        {
            title: "Inventory Management",
            description: "Keep track of store inventory, update stock levels ensure smooth business operations.",
            link: "/dashboard/employee/log-inventory"
        },
        {
            title: "Device Upgrades",
            description: "Manage phone upgrades, process transfers, and sales ensuring a seamless experience.",
            link: "/dashboard/employee/manage-upgrades"
        },
        // {
        //     title: "Work Schedule",
        //     description: "View your upcoming shifts, update your availability, and manage your work schedule.",
        //     link: "/dashboard/employee/schedule"
        // }
    ],
    MANAGER: [
        { title: "Team Overview", description: "Monitor team performance", link: "/dashboard/manager/overview" },
        { title: "Reports", description: "Generate team reports", link: "/dashboard/manager/reports" },
    ],
    OWNER: [
        // {
        //     title: "Manage Managers",
        //     description: "Oversee and assign managerial roles within the company.",
        //     link: "/dashboard/owner/manage-managers"
        // },
        {
            title: "Manage Employees",
            description: "Hire, track, and manage employee details and roles.",
            link: "/dashboard/owner/manage-employees"
        },
        {
            title: "Manage Stores",
            description: "Monitor and administer store operations and performance.",
            link: "/dashboard/owner/manage-stores"
        },
        {
            title: "Paychecks",
            description: "Generate and manage payroll for employees and staff.",
            link: "/dashboard/owner/paychecks"
        },
        {
            title: "Cash Collection",
            description: "Track and manage cash and card collections across all stores.",
            link: "/dashboard/owner/cash-collection"
        },
        {
            title: "Inventory Re-order",
            description: "Monitor stock levels and generate re-order summaries for low inventory.",
            link: "/dashboard/owner/inventory-reorder"
        },
        // {
        //     title: "Manage Expenses",
        //     description: "Track, categorize, and control business expenditures.",
        //     link: "/dashboard/owner/manage-expenses"
        // },
        // {
        //     title: "Profit & Loss",
        //     description: "Evaluate financial performance through profit and loss analysis.",
        //     link: "/dashboard/owner/manage-pandl"
        // }
    ]
};

export const upgradeNavbarLinks: Record<Role, {
    name: string; path: string, icon: React.ElementType
}[]> = {
    EMPLOYEE: [
        {
            name: "Available Devices",
            path: "/dashboard/employee/manage-upgrades/available-devices",
            icon: DevicePhoneMobileIcon // 📱 Best for devices list
        },
        {
            name: "Create Invoice",
            path: "/dashboard/employee/manage-upgrades/create-invoice",
            icon: ClipboardDocumentListIcon // 📝 Best for creating invoices
        },
        {
            name: "Sale History",
            path: "/dashboard/employee/manage-upgrades/sale-history",
            icon: ClockIcon // ⏳ Best for historical records or past sales
        },
        {
            name: "Find Invoice Details",
            path: "/dashboard/employee/manage-upgrades/invoice-details",
            icon: DocumentMagnifyingGlassIcon // 🔍 Best for searching invoice details
        },
        {
            name: "Pending Receives & Transfers",
            path: "/dashboard/employee/manage-upgrades/receives-transfers",
            icon: ArrowsRightLeftIcon // 🔄 Best for pending transfers & receives
        },
    ],
    ADMIN: [{
        name: "",
        path: "",
        icon: DevicePhoneMobileIcon
    },
    ],
    MANAGER: [
        {
            name: "",
            path: "",
            icon: DevicePhoneMobileIcon
        },
    ],
    OWNER: [
        {
            name: "",
            path: "",
            icon: DevicePhoneMobileIcon
        }
    ]
}