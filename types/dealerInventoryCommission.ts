export interface DealerInventoryCommissionValues {
    perBoxCommission: number;
    perReactivation: number;
    perByod: number;
}

export interface DealerInventoryCommissionSavePayload extends DealerInventoryCommissionValues {
    companyName: string;
}
