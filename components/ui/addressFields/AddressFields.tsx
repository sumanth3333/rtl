import { UseFormRegister, FieldErrors, FieldValues, FieldPath } from "react-hook-form";
import InputField from "../InputField";
import StateDropdown from "./StateDropdown"; // ✅ Import the new dropdown

interface AddressFieldsProps<T extends FieldValues> {
    register: UseFormRegister<T>;
    errors: FieldErrors<T>;
    fieldPrefix: FieldPath<T>;
}

export default function AddressFields<T extends FieldValues>({ register, errors, fieldPrefix }: AddressFieldsProps<T>) {
    const getFieldError = (field: string) => {
        const fieldError = errors[fieldPrefix as keyof T] as FieldErrors<T[string]>;
        return fieldError?.[field]?.message as string | undefined;
    };

    return (
        <div className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                    label="Street Name"
                    type="text"
                    {...register(`${fieldPrefix}.streetName` as FieldPath<T>)}
                    error={getFieldError("streetName")}
                />
                <InputField
                    label="City"
                    type="text"
                    {...register(`${fieldPrefix}.city` as FieldPath<T>)}
                    error={getFieldError("city")}
                />
                <StateDropdown
                    register={register}
                    fieldPath={`${fieldPrefix}.state` as FieldPath<T>}
                    error={getFieldError("state")}
                />
                <InputField
                    label="Zipcode"
                    type="text"
                    {...register(`${fieldPrefix}.zipcode` as FieldPath<T>)}
                    error={getFieldError("zipcode")}
                />
            </div>
        </div>
    );
}
