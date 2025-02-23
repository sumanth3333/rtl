import { FlatCompat } from "@eslint/eslintrc";
import pluginReact from "eslint-plugin-react";
import pluginTypescript from "@typescript-eslint/eslint-plugin";
import parserTypescript from "@typescript-eslint/parser";
import pluginUnusedImports from "eslint-plugin-unused-imports";

const compat = new FlatCompat();

const eslintConfig = [
    /** ✅ Load Next.js Recommended Config */
    ...compat.extends("next/core-web-vitals"),

    {
        languageOptions: {
            parser: parserTypescript,
            sourceType: "module",
        },

        /** ✅ Register Plugins */
        plugins: {
            "react": pluginReact,
            "@typescript-eslint": pluginTypescript,
            "unused-imports": pluginUnusedImports,
        },

        rules: {
            /** ✅ Explicitly Disable Next.js Module Assignment Rule (Ensure It Takes Effect) */
            "@next/next/no-assign-module-variable": "off", // ✅ Force ESLint to respect this setting

            /** ✅ Fix React Unescaped Entities */
            "react/no-unescaped-entities": "off",

            /** ✅ TypeScript Best Practices */
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/explicit-function-return-type": "off",
            "@typescript-eslint/ban-ts-comment": [
                "warn",
                { "ts-expect-error": "allow-with-description", "ts-ignore": "allow-with-description" }
            ],

            /** 🔥 Auto-Remove Unused Code */
            "unused-imports/no-unused-imports": "off",
            "unused-imports/no-unused-vars": ["off", { vars: "all", args: "after-used", ignoreRestSiblings: false }],
            "@typescript-eslint/no-unused-vars": ["off", { vars: "all", args: "after-used", ignoreRestSiblings: false }],

            /** 🚀 Fix Next.js Best Practices */
            "next/no-img-element": "off",

            /** 📌 Fix Require() Issues */
            "@typescript-eslint/no-require-imports": "off",
            "@typescript-eslint/no-var-requires": "off",

            /** 🛠 Fix "Expected an Assignment or Function Call" */
            "@typescript-eslint/no-unused-expressions": "off",

            /** 🛠 Code Style Improvements */
            "prefer-const": "error",
            "no-console": ["warn", { allow: ["warn", "error"] }],
            "curly": "error",
        },
    },
];

export default eslintConfig;
