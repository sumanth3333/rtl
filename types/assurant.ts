export type AssurantDeviceStatus = {
    imei: string;
    claimedDate?: string;
    receivedDate?: string;
    labelCreatedDate?: string;
    returnedDate?: string;
    viewLablel?: string; // base64 pdf string from API (note spelling from backend)
    labelCreated: boolean;
    received: boolean;
    returned: boolean;
};

export type AssurantStatusResponse = {
    claims: AssurantDeviceStatus[];
    pendings: AssurantDeviceStatus[];
    returns: AssurantDeviceStatus[];
    success: AssurantDeviceStatus[];
};

export type AssurantSaveClaimPayload = {
    dealerStoreId: string;
    employeeNtid: string;
    imei: string;
};

export type AssurantReceivePayload = {
    employeeNtid: string;
    claimedImei: string;
    receivedImei: string;
};

export type AssurantReturnPayload = {
    employeeNtid: string;
    returnedImei: string;
};

export type AssurantReturnLabelPayload = {
    returningImei: string;
    employeeNtid: string;
};
