export interface AwsBillingOverview {
    month: string;
    periodStart: string;
    periodEndExclusive: string;
    currentCost: number;
    forecastCost: number;
    currency: string;
    estimated: boolean;
    message: string;
}

export interface AwsServiceCost {
    serviceName: string;
    cost: number;
    currency: string;
}

export interface AwsServicesBreakdown {
    month: string;
    totalCost: number;
    currency: string;
    services: AwsServiceCost[];
}

export interface AwsUsageEntry {
    serviceName: string;
    usageType: string;
    usageQuantity: number;
    usageUnit: string;
    cost: number;
    currency: string;
}

export interface AwsUsageBreakdown {
    month: string;
    totalCost: number;
    currency: string;
    usage: AwsUsageEntry[];
}

// ✅ paymentStatus is documented as unverified ("UNKNOWN" today) - the API's own message
// says not to treat it as authoritative, so the UI must not imply otherwise.
export type AwsInvoicePaymentStatus = "PAID" | "UNPAID" | "OVERDUE" | "UNKNOWN";

export interface AwsInvoice {
    invoiceId: string;
    invoiceType: string;
    billingPeriod: string;
    issuedDate: string;
    dueDate: string;
    amount: number;
    currency: string;
    paymentStatus: AwsInvoicePaymentStatus;
}

export interface AwsBillingInvoices {
    totalInvoices: number;
    invoices: AwsInvoice[];
    message: string;
}
