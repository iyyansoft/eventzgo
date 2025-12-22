import next from "eslint-config-next";

const eslintConfig = [
  ...next.configs.recommended,
  ...next.configs["core-web-vitals"],
  // Override default ignores of eslint-config-next.
  {
    ignores: [
      // Default ignores of eslint-config-next:
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "node_modules/**"
    ]
  }
];

export default eslintConfig;

export default eslintConfig;
