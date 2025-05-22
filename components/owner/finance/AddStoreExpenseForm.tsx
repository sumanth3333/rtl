"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/TextArea";
import { format } from "date-fns";

interface StoreExpense {
    dealerStoreId: string;
    paidFor: string;
    amount: number;
    month: string;
    paidDate: string;
    expenseRecordedDate: string;
}

export default function AddStoreExpenseForm({ onAdd }: { onAdd: (e: StoreExpense) => void }) {
    const [form, setForm] = useState<StoreExpense>({
        dealerStoreId: "",
        paidFor: "",
        amount: 0,
        month: format(new Date(), "yyyy-MM"),
        paidDate: format(new Date(), "yyyy-MM-dd"),
        expenseRecordedDate: format(new Date(), "yyyy-MM-dd")
    });

    const handleChange = (key: keyof StoreExpense, value: any) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    const handleSubmit = () => {
        if (!form.dealerStoreId || !form.paidFor || !form.amount) { return; }
        onAdd(form);
        setForm({
            dealerStoreId: "",
            paidFor: "",
            amount: 0,
            month: format(new Date(), "yyyy-MM"),
            paidDate: format(new Date(), "yyyy-MM-dd"),
            expenseRecordedDate: format(new Date(), "yyyy-MM-dd")
        });
    };

    return (
        <div className="p-4 border rounded-md bg-gray-50 dark:bg-gray-800 mb-4 space-y-2">
            <Input placeholder="Store ID" value={form.dealerStoreId} onChange={(e) => handleChange("dealerStoreId", e.target.value)} />
            <Textarea placeholder="Paid For" value={form.paidFor} onChange={(e) => handleChange("paidFor", e.target.value)} />
            <Input type="number" placeholder="Amount" value={form.amount} onChange={(e) => handleChange("amount", parseFloat(e.target.value))} />
            <Input type="month" value={form.month} onChange={(e) => handleChange("month", e.target.value)} />
            <Input type="date" value={form.paidDate} onChange={(e) => handleChange("paidDate", e.target.value)} />
            <Input type="date" value={form.expenseRecordedDate} onChange={(e) => handleChange("expenseRecordedDate", e.target.value)} />
            <button onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 text-sm">
                Add Expense
            </button>
        </div>
    );
}
