// src/config/roleConfig.filters.ts
import type { Role } from "./roleConfig";

type CompanyVisibilityRule = {
    /** If set, ONLY these paths will be shown */
    include?: string[];
    /** If set (and include is not provided), these paths will be hidden */
    exclude?: string[];
    /** Optional custom predicate for advanced cases */
    custom?: (path: string, role: Role) => boolean;
};

export const companyVisibility: Record<string, CompanyVisibilityRule> = {
    // ---- Company-specific rules ----
    // All Connect Network LLC: hide certain EMPLOYEE links
    "All Connect Network LLC": {
        exclude: [
            "/dashboard/employee/manage-upgrades",
            "/dashboard/employee/remainders",
            "/dashboard/employee/record-imei",
        ],
    },

    // Default fallback for unknown companies (no filtering)
    DEFAULT: {},
};

type ItemWithPath<T> = T & { path: string };

export function filterByCompany<T extends { path: string }>(
    items: ItemWithPath<T>[],
    role: Role,
    companyName?: string
) {
    const rule =
        (companyName && companyVisibility[companyName]) ||
        companyVisibility.DEFAULT;

    // Advanced predicate wins if present
    if (rule.custom) return items.filter((i) => rule.custom!(i.path, role));

    // Strict allow-list
    if (rule.include?.length) {
        const allow = new Set(rule.include);
        return items.filter((i) => allow.has(i.path));
    }

    // Block-list
    if (rule.exclude?.length) {
        const block = new Set(rule.exclude);
        return items.filter((i) => !block.has(i.path));
    }

    return items; // no rules ⇒ show all
}
