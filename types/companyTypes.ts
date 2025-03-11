export type PayFrequency = "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "SEMI_MONTHLY";

export interface Company {
    companyName: string;
}

export interface Threshold {
    itemType: "Boxes" | "Tablets" | "Watches" | "HSI";
    threshold: number;
    payAmount: number;
}

export interface CompanyPayStructure {
    company: Company;
    payFrequency: PayFrequency;
    thresholds: Threshold[];
}
