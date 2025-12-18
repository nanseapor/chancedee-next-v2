import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import { defineConfig, globalIgnores } from "eslint/config";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  
  globalIgnores([
    // Default ignores
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    
    // Protected paths (per PROJECT_INSTRUCTIONS)
    "src/app/content/**",
    "src/components/ui/**",
    "src/app/api/**",
    "src/lib/**",
    "coverage/**",
    "scripts/**",
    "tests/**",
    "cypress/**",
  ]),

  // Downgrade non-bugs to warnings or off
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", { 
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_" 
      }],
      "@typescript-eslint/no-unused-expressions": "warn",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-require-imports": "off",
      "react/no-unescaped-entities": "off",
      "@next/next/no-img-element": "warn",
    },
  },
]);

export default eslintConfig;