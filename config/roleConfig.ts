import {
    BuildingOfficeIcon, BuildingStorefrontIcon, DocumentTextIcon, CreditCardIcon, ChartBarIcon, ChartBarSquareIcon, UsersIcon, HomeIcon, CurrencyDollarIcon, ClipboardDocumentListIcon, ArchiveBoxIcon, DevicePhoneMobileIcon, BanknotesIcon, ClipboardDocumentCheckIcon,
    ClockIcon, PencilSquareIcon, PresentationChartLineIcon,
    DocumentMagnifyingGlassIcon,
    ArrowsRightLeftIcon,
    CheckCircleIcon,
    BellAlertIcon
} from "@heroicons/react/24/outline";
import { Clock, MapPin, Settings } from "lucide-react";
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
        {
            name: "Remainders",
            path: "/dashboard/employee/remainders",
            icon: BellAlertIcon
        },
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
        // {
        //     name: "EOD Remarks",
        //     path: "/dashboard/employee/eod-remarks",
        //     icon: ClipboardDocumentCheckIcon
        // },
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
        {
            name: "Raise A Request",
            path: "/dashboard/employee/raise-request",
            icon: PencilSquareIcon
        },
        {
            name: "Settings",
            path: "/dashboard/employee/settings",
            icon: Settings,
        }

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
            name: "Inventory Management",
            path: "/dashboard/owner/inventory",
            icon: ClipboardDocumentCheckIcon,
        },
        {
            name: "Device Upgrades",
            path: "/dashboard/owner/manage-upgrades",
            icon: DevicePhoneMobileIcon
        },
        {
            name: "Assign ToDos",
            path: "/dashboard/owner/assign-todos",
            icon: CheckCircleIcon,
        },
        {
            name: "End of Day Report",
            path: "/dashboard/owner/eod-report",
            icon: DocumentTextIcon
        },
        {
            name: "EOD Remarks",
            path: "/dashboard/owner/eod-remarks",
            icon: ClipboardDocumentCheckIcon
        },
        {
            name: "Monthly Targets",
            path: "/dashboard/owner/targets",
            icon: ChartBarIcon,
        },
        {
            name: "Expenses & Profits",
            path: "/dashboard/owner/finance",
            icon: PresentationChartLineIcon,
        },
        {
            name: "Pending Requests",
            path: "/dashboard/owner/pending-requests",
            icon: Clock, // or Hourglass
        },
        {
            name: "Store Visit",
            path: "/dashboard/owner/store-visit",
            icon: MapPin,
        },
        {
            name: "Settings",
            path: "/dashboard/owner/settings",
            icon: Settings,
        }

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
    ADMIN: [
        {
            name: "Available Devices",
            path: "/dashboard/owner/manage-upgrades/available-devices",
            icon: DevicePhoneMobileIcon // 📱 Best for devices list
        },
        {
            name: "Sale History",
            path: "/dashboard/owner/manage-upgrades/sale-history",
            icon: ClockIcon // ⏳ Best for historical records or past sales
        },
        {
            name: "Find Invoice Details",
            path: "/dashboard/owner/manage-upgrades/invoice-details",
            icon: DocumentMagnifyingGlassIcon // 🔍 Best for searching invoice details
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
            name: "Available Devices",
            path: "/dashboard/owner/manage-upgrades/available-devices",
            icon: DevicePhoneMobileIcon // 📱 Best for devices list
        },
        {
            name: "Sale History",
            path: "/dashboard/owner/manage-upgrades/sale-history",
            icon: ClockIcon // ⏳ Best for historical records or past sales
        },
        {
            name: "Find Invoice Details",
            path: "/dashboard/owner/manage-upgrades/invoice-details",
            icon: DocumentMagnifyingGlassIcon // 🔍 Best for searching invoice details
        },
    ]
}