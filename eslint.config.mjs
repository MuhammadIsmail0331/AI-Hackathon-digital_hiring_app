import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    // Non-application code that must never be linted:
    // - .node/    → portable Node runtime (thousands of vendored JS files)
    // - tmp/      → one-off DB/CLI helper scripts (CJS)
    // - scripts/  → ad-hoc maintenance scripts (CJS)
    // - public/   → static assets
    // - *.cjs     → CommonJS utilities at repo root
    ignores: [
      "node_modules/**",
      ".next/**",
      ".node/**",
      "tmp/**",
      "scripts/**",
      "public/**",
      "*.cjs",
      "next-env.d.ts",
      "tsconfig.tsbuildinfo",
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
    },
  },
];

export default eslintConfig;
