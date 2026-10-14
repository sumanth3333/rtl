export type DayAvailability = {
    date: string;
    isAvailable: boolean;
    availableFrom?: string | null;
    availableTo?: string | null;
    notes?: string | null;
};

export type SaveAvailabilityPayload = {
    employeeNtid: string;
    month: string;
    availabilityStartDate: string;
    availabilityEndDate: string;
    availability: DayAvailability[];
};
