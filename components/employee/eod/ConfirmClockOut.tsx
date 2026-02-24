interface Props {
    confirmClockOut: boolean;
    setConfirmClockOut: (value: boolean) => void;
    validationErrors: Record<string, string>;
}

export default function ConfirmClockOut({ confirmClockOut, setConfirmClockOut, validationErrors }: Props) {
    return (
        <div className="my-6 flex flex-col gap-2">
            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    id="confirmClockOut"
                    checked={confirmClockOut}
                    onChange={() => setConfirmClockOut(!confirmClockOut)}
                    className="w-4 h-4"
                />
                <label htmlFor="confirmClockOut" className="text-gray-800 dark:text-gray-300 text-sm">
                    I understand that, any inaccurate information provided leads to <strong>loss of pay (or) termination</strong> &
                    submitting this form <strong>automatically clocks me out</strong>.
                </label>
            </div>
            {validationErrors.confirmClockOut && (
                <p className="text-xs text-red-600 mt-1">{validationErrors.confirmClockOut}</p>
            )}
        </div>
    );
}
