module.exports = {
  extends: [require.resolve("@vercel/style-guide/eslint/typescript")],
  rules: {
    "@typescript-eslint/no-unused-vars": "warn",
    "@typescript-eslint/no-explicit-any": "warn",
  },
  ignorePatterns: ["node_modules/", ".next/", "dist/"],
};
