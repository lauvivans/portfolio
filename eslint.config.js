import { defineConfig, globalIgnores } from "eslint/config";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginVue from "eslint-plugin-vue";
import prettier from "eslint-config-prettier";

export default defineConfig([
  globalIgnores(["dist/"]),
  js.configs.recommended,
  tseslint.configs.recommended,
  pluginVue.configs["flat/recommended"],
  {
    files: ["**/*.vue"],
    languageOptions: { parserOptions: { parser: tseslint.parser } },
    // vue-tsc already reports undefined names; this rule does not know browser globals.
    rules: { "no-undef": "off" },
  },
  {
    // Route pages are named after their path (About, Repo), not reused as tags.
    files: ["src/pages/**/*.vue"],
    rules: { "vue/multi-word-component-names": "off" },
  },
  {
    // The artwork scripts run in Node.
    files: ["design/**/*.mjs"],
    languageOptions: {
      globals: { process: "readonly", console: "readonly", Buffer: "readonly" },
    },
  },
  // Last, so it turns off the formatting rules that Prettier owns.
  prettier,
]);
