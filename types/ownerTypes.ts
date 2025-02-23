export interface OwnerContextType {
    companyName: string;
    ownerEmail: string;
    isOwner: boolean;
    setOwnerData: (company: string, email: string) => void;
    clearOwnerData: () => void;
}
