import globals from "globals";
import pluginJs from "@eslint/js";


export default [
  {files: ["**/*.js"], languageOptions: {sourceType: "commonjs"}},
  {languageOptions: { globals:  {
    ...globals.browser,
    ...globals.jest } }}, // change from global.browser to global.node
  pluginJs.configs.recommended
];
