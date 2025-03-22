
export interface PendingRequest {
    id: number;
    requestedBy: string;
    itemDescription: string;
    priority: string;
    requestedDate: string;
    requestedTime: string;
    status: string;
}


export interface StorePendingRequests {
    store: {
        dealerStoreId: string;
        storeName: string;
    };
    pendings: PendingRequest[];
}
