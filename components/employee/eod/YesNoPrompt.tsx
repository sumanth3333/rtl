interface Props {
    question: string;
    value: boolean | null;
    onChange: (value: boolean) => void;
}

export default function YesNoPrompt({ question, value, onChange }: Props) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{question}</p>
            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={() => onChange(true)}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md border transition ${value === true
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                >
                    Yes
                </button>
                <button
                    type="button"
                    onClick={() => onChange(false)}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md border transition ${value === false
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                >
                    No
                </button>
            </div>
        </div>
    );
}
