export type RtposSale = {
    date: string;
    phoneActivationsAndReactivations: number;
    upgrades: number;
    systemAccessories: number;
    bts: number;
    hsi: number;
};

export type EodDetail = {
    date: string;
    systemCash: number;
    systemCard: number;
    creditCard: number;
    debitCard: number;
    rtposSale: RtposSale;
};

export type RtposStoreReport = {
    store: {
        dealerStoreId: string;
        storeName: string;
    };
    eodDetails: EodDetail[];
};
