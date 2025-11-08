// src/config/roleConfig.getters.ts
import { sidebarLinks, Role } from "./roleConfig";
import { filterByCompany } from "./roleConfig.filters";

export function getSidebarLinks(role: Role, companyName?: string) {
    return filterByCompany(sidebarLinks[role], role, companyName);
}
