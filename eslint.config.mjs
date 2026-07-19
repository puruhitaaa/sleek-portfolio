import tsParser from "@typescript-eslint/parser";

export default [
  {
    ignores: ["**/.next/**", "**/dist/**", "**/coverage/**", "**/node_modules/**"],
  },
  {
    files: ["**/*.{js,cjs,mjs,ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        sourceType: "module",
      },
    },
  },
];
