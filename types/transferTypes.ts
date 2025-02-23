export interface Transfer {
    id: string;
    deviceName: string;
    imei: string;
    transferTo: string;
    transferedBy: string;
    date: string;
}

export interface Receive {
    deviceName: string;
    imei: string;
    transferredFrom: string;
    transferredBy: string;
    date: string;
}
