import React from "react";
import { motion } from "framer-motion";

interface FormCardProps {
    title?: string;
    children: React.ReactNode;
}

export default function FormCard({ title, children }: FormCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full max-w-[90%] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto 
                px-6 md:px-10 py-8 md:py-12 
                bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl 
                border border-gray-200 dark:border-gray-700 shadow-lg 
                rounded-2xl transition-all duration-300 hover:shadow-2xl"
        >
            {title && (
                <motion.h2
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="text-2xl md:text-3xl font-bold mb-6 text-gray-900 dark:text-white text-center"
                >
                    {title}
                </motion.h2>
            )}
            {children}
        </motion.div>
    );
}
