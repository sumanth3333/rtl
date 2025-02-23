import { CreateInvoiceFormValues } from "@/types/createInvoiceSchema";
import { Control, FieldErrors, Controller } from "react-hook-form";
import InputField from "../ui/InputField";

interface InvoiceDetailsProps {
    control: Control<CreateInvoiceFormValues>;
    errors: FieldErrors<CreateInvoiceFormValues>;
}

export default function InvoiceDetails({ control, errors }: InvoiceDetailsProps) {
    return (
        <div className="grid grid-cols-2 gap-4 mt-6">
            <Controller
                name="accountNumber"
                control={control}
                render={({ field }) => <InputField {...field} label="Account Number" error={errors.accountNumber?.message} />}
            />
            <Controller
                name="activatedDate"
                control={control}
                render={({ field }) => <InputField {...field} label="Activated Date" type="date" error={errors.activatedDate?.message} />}
            />
            <Controller
                name="amount"
                control={control}
                render={({ field }) => <InputField {...field} label="Invoice Amount" type="number" error={errors.amount?.message} />}
            />
        </div>
    );
}
