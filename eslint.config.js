// eslint.config.js
import { FlatCompat } from "@eslint/eslintrc";
import typescriptPlugin from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";
import prettierPlugin from "eslint-plugin-prettier";
import tailwindcssPlugin from "eslint-plugin-tailwindcss";

const compat = new FlatCompat();

export default [
    {
        files: ["**/*.{js,ts,tsx}"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            parser: typescriptParser,
            ecmaFeatures: {
                jsx: true,
            },
        },
        env: {
            es2021: true,
            browser: true,
            jest: true,
        },
        plugins: {
            "@typescript-eslint": typescriptPlugin,
            "jsx-a11y": jsxA11yPlugin,
            "tailwindcss": tailwindcssPlugin,
            "prettier": prettierPlugin,
        },
        rules: {
            "prettier/prettier": "error",
        },
    },
    ...compat.extends(
        "standard",
        "plugin:@typescript-eslint/recommended",
        "plugin:prettier/recommended",
        "plugin:tailwindcss/recommended",
        "next/core-web-vitals",
    ),
    {
        files: ["*.js"],
        rules: {
            "@typescript-eslint/no-var-requires": "off",
        },
    },
    {
        files: ["*.ts", "*.tsx"],
        rules: {
            "@next/next/no-html-link-for-pages": "off",
            "tailwindcss/no-custom-classname": "off",
            "tailwindcss/classnames-order": "error",
            "@typescript-eslint/explicit-module-boundary-types": "off",
            "@typescript-eslint/no-empty-function": "warn",
            "@typescript-eslint/ban-types": "warn",
            "@typescript-eslint/ban-ts-comment": "warn",
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-unused-vars": [
                "warn",
                {
                    ignoreRestSiblings: true,
                    argsIgnorePattern: "^_",
                    destructuredArrayIgnorePattern: "^_",
                },
            ],
            "jsx-a11y/alt-text": [
                "warn",
                {
                    elements: ["img"],
                    img: ["Image"],
                },
            ],
            "jsx-a11y/aria-props": "warn",
            "jsx-a11y/aria-proptypes": "warn",
            "jsx-a11y/aria-unsupported-elements": "warn",
            "jsx-a11y/role-has-required-aria-props": "warn",
            "jsx-a11y/role-supports-aria-props": "warn",
        },
    },
];
