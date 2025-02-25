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
            <td
                colSpan={6}
                className="px-3 py-2 sm:px-4 sm:py-3 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700"
            >
                <ActionForm formType={formType} device={device} storeIds={storeIds} closeForm={closeForm} />
            </td>
        </tr>
    );
}
