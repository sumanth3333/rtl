"use client";

export default function InvoiceDetailsDisplay({ invoice }: { invoice: any }) {
    return (
        <div className="mt-6 p-4 border border-gray-300 dark:border-gray-700 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">📜 Invoice Details</h3>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                <p><span className="font-semibold">Customer:</span> {invoice.customerAccountNumber}</p>
                <p><span className="font-semibold">Store:</span> {invoice.invoicedStore}</p>
                <p><span className="font-semibold">Employee:</span> {invoice.invoicedEmployee}</p>
                <p><span className="font-semibold">Date:</span> {invoice.invoicedDate}</p>
                <p className="text-green-600 dark:text-green-400 font-bold"><span className="text-gray-900 dark:text-gray-100">Amount:</span> ${invoice.invoicedAmount.toFixed(2)}</p>
            </div>
        </div>
    );
}
