import {
    BuildingOfficeIcon,
    BuildingStorefrontIcon,
    DocumentTextIcon,
    CreditCardIcon,
    ClipboardIcon,
    CalendarIcon,
    ChartBarIcon,
    ChartBarSquareIcon,
    UserGroupIcon,
    UsersIcon,
    HomeIcon,
    CurrencyDollarIcon,
    ChartPieIcon,
    ArrowTrendingUpIcon
} from "@heroicons/react/24/outline"; // Use "solid" if you prefer filled icons
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
            name: "Tasks",
            path: "/dashboard/employee/tasks",
            icon: ClipboardIcon
        },
        {
            name: "Work Schedule",
            path: "/dashboard/employee/schedule",
            icon: CalendarIcon
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
        {
            name: "Manage Managers",
            path: "/dashboard/owner/manage-managers",
            icon: UserGroupIcon
        },
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
            path: "/dashboard/owner/manage-paychecks",
            icon: CurrencyDollarIcon
        },
        {
            name: "Manage Expenses",
            path: "/dashboard/owner/manage-expenses",
            icon: ChartPieIcon
        },
        {
            name: "Profit/Loss",
            path: "/dashboard/owner/manage-pandl",
            icon: ArrowTrendingUpIcon
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
        { title: "View Tasks", description: "Manage assigned work", link: "/dashboard/employee/tasks" },
        { title: "Schedule", description: "View work schedule", link: "/dashboard/employee/schedule" },
    ],
    MANAGER: [
        { title: "Team Overview", description: "Monitor team performance", link: "/dashboard/manager/overview" },
        { title: "Reports", description: "Generate team reports", link: "/dashboard/manager/reports" },
    ],
    OWNER: [
        {
            title: "Manage Managers",
            description: "Oversee and assign managerial roles within the company.",
            link: "/dashboard/owner/manage-managers"
        },
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
            link: "/dashboard/owner/manage-paychecks"
        },
        {
            title: "Manage Expenses",
            description: "Track, categorize, and control business expenditures.",
            link: "/dashboard/owner/manage-expenses"
        },
        {
            title: "Profit & Loss",
            description: "Evaluate financial performance through profit and loss analysis.",
            link: "/dashboard/owner/manage-pandl"
        }
    ]
};
