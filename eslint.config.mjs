import next from "eslint-config-next";

export default [
  ...next.configs.recommended,
  ...next.configs["core-web-vitals"],
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "node_modules/**"
    ]
  }
];

export default eslintConfig;
