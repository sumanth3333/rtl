import {
    BuildingOfficeIcon, BuildingStorefrontIcon, DocumentTextIcon, CreditCardIcon, ChartBarIcon, ChartBarSquareIcon, UsersIcon, HomeIcon, CurrencyDollarIcon, ClipboardDocumentListIcon, ArchiveBoxIcon, DevicePhoneMobileIcon, BanknotesIcon, ClipboardDocumentCheckIcon,
    ClockIcon, PencilSquareIcon, PresentationChartLineIcon,
    DocumentMagnifyingGlassIcon,
    ArrowsRightLeftIcon,
    CheckCircleIcon,
    BellAlertIcon
} from "@heroicons/react/24/outline";
import {
    Activity,
    AlertTriangle,
    BadgePercent,
    Banknote,
    BarChart3,
    Boxes,
    CalendarClock,
    CalendarRange,
    Clock3,
    FileText,
    FolderOpen,
    KeyRound,
    LifeBuoy,
    ListChecks,
    Mail,
    MapPin,
    MessageSquareText,
    Package,
    RefreshCcw,
    RotateCcw,
    Settings,
    ShoppingCart,
    Smartphone,
    Store,
    Target,
    TrendingUp,
    FileSpreadsheet,
    UserCheck,
    Users,
    WalletCards
} from "lucide-react";
import React from "react";
// roleConfig.ts - Centralized role-based configuration
export type Role = "ADMIN" | "EMPLOYEE" | "MANAGER" | "OWNER";
export type SidebarLink = {
    name: string;
    path: string;
    icon: React.ElementType;
    section?: string;
};

// ✅ Sidebar Links for Each Role
export const sidebarLinks: Record<Role, SidebarLink[]> = {
    ADMIN: [
        {
            name: "Home",
            path: "/dashboard/admin",
            icon: HomeIcon,
            section: "Overview"
        },
        {
            name: "Server Health",
            path: "/dashboard/admin/monitoring/server",
            icon: Activity,
            section: "Monitoring"
        },
        {
            name: "Incidents",
            path: "/dashboard/admin/monitoring/incidents",
            icon: AlertTriangle,
            section: "Monitoring"
        },
        {
            name: "Restarts",
            path: "/dashboard/admin/monitoring/restarts",
            icon: RotateCcw,
            section: "Monitoring"
        },
        {
            name: "Email Outbox",
            path: "/dashboard/admin/monitoring/emails",
            icon: Mail,
            section: "Monitoring"
        },
        {
            name: "System Files",
            path: "/dashboard/admin/monitoring/files",
            icon: FolderOpen,
            section: "Monitoring"
        },
        {
            name: "Support Requests",
            path: "/dashboard/admin/contact-us",
            icon: LifeBuoy,
            section: "Monitoring"
        },
        {
            name: "Create Company",
            path: "/dashboard/admin/create-company",
            icon: BuildingOfficeIcon
        },
        {
            name: "Manage Stores",
            path: "/dashboard/admin/stores",
            icon: Store
        },
        {
            name: "Generate Invoices",
            path: "/dashboard/admin/invoices",
            icon: FileText
        },
        {
            name: "Setup Payments",
            path: "/dashboard/admin/payments",
            icon: WalletCards
        },
        {
            name: "File Exports",
            path: "/dashboard/admin/file-exports",
            icon: FileSpreadsheet
        },
        {
            name: "Manage Products",
            path: "/dashboard/admin/manage-products",
            icon: ShoppingCart
        },
        {
            name: "Sales Phase Strategy",
            path: "/dashboard/admin/sales-phase-strategy",
            icon: Target
        },
        {
            name: "Late Openings",
            path: "/dashboard/admin/late-openings",
            icon: MessageSquareText
        },
        {
            name: "Company Credentials",
            path: "/dashboard/admin/company-credentials",
            icon: KeyRound
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
            icon: ListChecks
        },
        {
            name: "End of Day Report",
            path: "/dashboard/employee/eod-report",
            icon: FileText
        },
        {
            name: "Record IMEI",
            path: "/dashboard/employee/record-imei",
            icon: ClipboardDocumentCheckIcon
        },
        {
            name: "Inventory Management",
            path: "/dashboard/employee/log-inventory",
            icon: Boxes
        },
        {
            name: "Retention",
            path: "/dashboard/employee/retention",
            icon: UserCheck
        },
        {
            name: "Accessories Management",
            path: "/dashboard/employee/accessories",
            icon: Package
        },
        {
            name: "Port Help",
            path: "/dashboard/employee/port-help",
            icon: ArrowsRightLeftIcon // 🔄 Best for pending transfers & receives
        },
        {
            name: "Device Upgrades",
            path: "/dashboard/employee/manage-upgrades",
            icon: Smartphone
        },
        {
            name: "Raise A Request",
            path: "/dashboard/employee/raise-request",
            icon: MessageSquareText
        },
        {
            name: "Claims & Returns",
            path: "/dashboard/employee/claims-returns",
            icon: RefreshCcw
        },
        {
            name: "Magenta Orders",
            path: "/dashboard/employee/magenta",
            icon: ShoppingCart
        },
        {
            name: "Schedule Availability",
            path: "/dashboard/employee/schedule-availability",
            icon: CalendarClock
        },
        {
            name: "Verify My Records",
            path: "/dashboard/employee/verify-records",
            icon: CheckCircleIcon
        },
        {
            name: "Contact Support",
            path: "/dashboard/employee/contact-us",
            icon: LifeBuoy
        },
        {
            name: "Settings",
            path: "/dashboard/employee/settings",
            icon: Settings,
        },


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
            icon: HomeIcon,
            section: "Overview"
        },
        {
            name: "Sales Analytics",
            path: "/dashboard/owner/analytics",
            icon: BarChart3,
            section: "Overview"
        },
        {
            name: "Growth Analytics",
            path: "/dashboard/owner/growth-analytics",
            icon: TrendingUp,
            section: "Overview"
        },
        // {
        //     name: "Manage Managers",
        //     path: "/dashboard/owner/manage-managers",
        //     icon: UserGroupIcon
        // },
        {
            name: "Manage Employees",
            path: "/dashboard/owner/manage-employees",
            icon: Users,
            section: "People"
        },
        {
            name: "Employee Requests",
            path: "/dashboard/owner/employee-requests",
            icon: ClipboardDocumentListIcon,
            section: "People"
        },
        {
            name: "Manage Stores",
            path: "/dashboard/owner/manage-stores",
            icon: Store,
            section: "People"
        },
        {
            name: "Paychecks",
            path: "/dashboard/owner/paychecks",
            icon: WalletCards,
            section: "Finance"
        },
        {
            name: "Cash Collection",
            path: "/dashboard/owner/cash-collection",
            icon: Banknote,
            section: "Finance"
        }, {
            name: "Inventory Management",
            path: "/dashboard/owner/inventory",
            icon: Boxes,
            section: "Operations"
        },
        {
            name: "Accessories Management",
            path: "/dashboard/owner/accessories",
            icon: Package,
            section: "Operations"
        },
        {
            name: "Device Upgrades",
            path: "/dashboard/owner/manage-upgrades",
            icon: Smartphone,
            section: "Operations"
        },
        {
            name: "Assign ToDos",
            path: "/dashboard/owner/assign-todos",
            icon: ListChecks,
            section: "Operations"
        },
        {
            name: "Employee Schedule",
            path: "/dashboard/owner/schedule",
            icon: CalendarClock,
            section: "Operations"
        },
        {
            name: "End of Day Report",
            path: "/dashboard/owner/eod-report",
            icon: FileText,
            section: "Reports"
        },
        {
            name: "RTPOS Report",
            path: "/dashboard/owner/rtpos-report",
            icon: ChartBarIcon,
            section: "Reports"
        },
        {
            name: "EOD Remarks",
            path: "/dashboard/owner/eod-remarks",
            icon: MessageSquareText,
            section: "Reports"
        },
        {
            name: "Late Opening Report",
            path: "/dashboard/owner/late-openings",
            icon: BellAlertIcon,
            section: "Reports"
        },
        {
            name: "Metric Report by Date Range",
            path: "/dashboard/owner/metric-report",
            icon: CalendarRange,
            section: "Reports"
        },
        {
            name: "Monthly Targets",
            path: "/dashboard/owner/targets",
            icon: Target,
            section: "Operations"
        },
        {
            name: "Expenses & Profits",
            path: "/dashboard/owner/finance",
            icon: TrendingUp,
            section: "Finance"
        },
        {
            name: "Retention",
            path: "/dashboard/owner/retention",
            icon: UserCheck,
            section: "Finance"
        },
        {
            name: "Claims & Returns",
            path: "/dashboard/owner/claims-returns",
            icon: RefreshCcw,
            section: "Operations"
        },
        {
            name: "Magenta Orders",
            path: "/dashboard/owner/magenta",
            icon: ShoppingCart,
            section: "Operations"
        },
        {
            name: "Rebates",
            path: "/dashboard/owner/rebates",
            icon: BadgePercent,
            section: "Finance"
        },
        {
            name: "Pending Requests",
            path: "/dashboard/owner/pending-requests",
            icon: Clock3,
            section: "Operations"
        },
        {
            name: "Store Visit",
            path: "/dashboard/owner/store-visit",
            icon: MapPin,
            section: "Operations"
        },
        {
            name: "Contact Support",
            path: "/dashboard/owner/contact-us",
            icon: LifeBuoy,
            section: "System"
        },
        {
            name: "Settings",
            path: "/dashboard/owner/settings",
            icon: Settings,
            section: "System"
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
        { title: "File Exports", description: "Upload activation or sales reports", link: "/dashboard/admin/file-exports" },
        { title: "Manage Products", description: "Add new products with category, brand, and price", link: "/dashboard/admin/manage-products" },
        { title: "Sales Phase Strategy", description: "Define how monthly goals split across four phases", link: "/dashboard/admin/sales-phase-strategy" },
        { title: "Late Openings", description: "Review late store openings and WhatsApp reminder replies", link: "/dashboard/admin/late-openings" },
        { title: "Company Credentials", description: "View every company's stored login credentials", link: "/dashboard/admin/company-credentials" },
    ],
    EMPLOYEE: [

    ],
    MANAGER: [
        { title: "Team Overview", description: "Monitor team performance", link: "/dashboard/manager/overview" },
        { title: "Reports", description: "Generate team reports", link: "/dashboard/manager/reports" },
    ],
    OWNER: [
        { title: "RTPOS Sales", description: "Verified store sales metrics", link: "/dashboard/owner/rtpos-report" },
        { title: "Growth Analytics", description: "Sprint phase performance by store", link: "/dashboard/owner/growth-analytics" },
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
