"use client";

import { cn } from "@/lib/utils";
import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";

const faqItems = [
    {
        question: "What should I do if the customer made payment at one store but invoiced at another?",
        answer: `
- At the store where payment was made:
  - System Cash: 0
  - Actual Cash: 0
  - Over/Short Reason: "$60 over in East Ave, $60 short in State St. Payment collected at East Ave but invoiced at State St."

- At the store where the invoice was generated:
  - System Cash: 60
  - Actual Cash: 60
  - Over/Short Reason: "$60 short in State St, $60 over in East Ave. Invoice generated at State St but payment collected at East Ave."
    `,
    },
    {
        question: "How should I report if preactivated phones were sold but no cash was collected?",
        answer: `
- System Cash: Full invoice amount (e.g., $250)
- Actual Cash: 0
- Over/Short Reason: "$250 short. Activated preactivated phones."
    `,
    },
    {
        question: "What if activation happened at another store but payment was collected at my store?",
        answer: `
- At current store:
  - System Cash: 0
  - Actual Cash: Amount collected (e.g., $50 accessories)
  - Over/Short Reason: "Collected $67 activation payment for other store."

- At other store:
  - System Cash: Activation amount (e.g., $67)
  - Actual Cash: Enter $67 even if physically not present
  - Over/Short Reason: "$67 short at other store. Activation payment collected elsewhere."
    `,
    },
    {
        question: "How to handle accessory payments bundled with activations?",
        answer: `
- Accessories cash should be separated clearly.
- Example: $127 collected = $50 accessories + $77 activation.
- System Cash: As per system.
- Actual Cash: Accessories amount ($50).
- Over/Short Reason: Explained clearly.
    `,
    },
    {
        question: "What if partial payment is made at two stores?",
        answer: `
- Document each store's collection separately.
- Mention Over/Short: "Partial payment collected at [Store A], balance at [Store B]."
    `,
    },
    {
        question: "What if system cash and actual cash match but there was a mistake?",
        answer: `
- Always mention in Over/Short section.
- Even if cash matches, document reason like: "Invoice billed at wrong store."
    `,
    },
];

export default function EODFaq() {
    return (
        <div className="max-w-4xl mx-auto p-6">
            <h2 className="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-gray-100">
                EOD Reporting Help Center
            </h2>
            <Accordion.Root type="multiple" className="space-y-4">
                {faqItems.map((item, index) => (
                    <Accordion.Item
                        key={index}
                        value={`item-${index}`}
                        className="border border-gray-300 dark:border-gray-700 rounded-2xl overflow-hidden"
                    >
                        <Accordion.Header className="flex">
                            <Accordion.Trigger
                                className={cn(
                                    "flex flex-1 items-center justify-between px-6 py-4 text-lg font-semibold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition",
                                    "data-[state=open]:rounded-b-none"
                                )}
                            >
                                {item.question}
                                <ChevronDown className="h-5 w-5 transition-transform duration-300 data-[state=open]:rotate-180" />
                            </Accordion.Trigger>
                        </Accordion.Header>

                        <Accordion.Content
                            className={cn(
                                "bg-white dark:bg-gray-900 px-6 overflow-hidden text-gray-700 dark:text-gray-300 text-base whitespace-pre-line",
                                "data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
                            )}
                        >
                            <div className="py-4">{item.answer}</div>
                        </Accordion.Content>
                    </Accordion.Item>
                ))}
            </Accordion.Root>
        </div>
    );
}
