import ActionForm from "./ActionForm";
import { Device, Store } from "@/types/upgradePhoneTypes";

interface ExpandedRowProps {
    device: Device;
    formType: "sale" | "transfer";
    storeIds: Store[];
    closeForm: () => void;
}

export default function ExpandedRow({ device, formType, storeIds, closeForm }: ExpandedRowProps) {
    return (
        <tr>
            <td colSpan={6} className="p-4 bg-gray-100 dark:bg-gray-800">
                <ActionForm formType={formType} device={device} storeIds={storeIds} closeForm={closeForm} />
            </td>
        </tr>
    );
}
