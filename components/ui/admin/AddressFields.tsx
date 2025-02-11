
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { Company } from "@/types/schema";
import InputField from "../InputField";

interface AddressFieldsProps {
    register: UseFormRegister<Company>;
    errors: FieldErrors<Company>;
}

export default function AddressFields({ register, errors }: AddressFieldsProps) {
    return (
        <div className="space-y-4 w-full max-w-[28rem]">
            <h3 className="text-base font-medium">Company Address</h3>
            <InputField
                label="Street Name"
                type="text"
                {...register("companyAddress.streetName")}
                error={errors.companyAddress?.streetName?.message}
            />
            <InputField
                label="City"
                type="text"
                {...register("companyAddress.city")}
                error={errors.companyAddress?.city?.message}
            />
            <InputField
                label="State"
                type="text"
                {...register("companyAddress.state")}
                error={errors.companyAddress?.state?.message}
            />
            <InputField
                label="Zipcode"
                type="text"
                {...register("companyAddress.zipcode")}
                error={errors.companyAddress?.zipcode?.message}
            />
        </div>
    );
}
