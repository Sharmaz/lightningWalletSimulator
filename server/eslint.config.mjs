import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import importPlugin from "eslint-plugin-import";
import globals from "globals";

export default defineConfig([
  {
    files: ["**/*.{js,cjs,mjs}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: {
      globals: { ...globals.node, ...globals.jest },
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "commonjs",
      },
    },
  },

  {
    plugins: {
      import: importPlugin,
    },
    rules: {
      indent: [
        "error",
        2,
        {
          SwitchCase: 1,
          VariableDeclarator: 1,
          outerIIFEBody: 1,
          MemberExpression: 1,
          FunctionDeclaration: { parameters: 1, body: 1 },
          FunctionExpression: { parameters: 1, body: 1 },
          CallExpression: { arguments: 1 },
          ArrayExpression: 1,
          ObjectExpression: 1,
          ImportDeclaration: 1,
          flatTernaryExpressions: false,
          ignoreComments: false,
          offsetTernaryExpressions: true,
        },
      ],
      quotes: ["error", "double", { avoidEscape: true, allowTemplateLiterals: true }],
      semi: ["error", "always"],
      "comma-dangle": [
        "error",
        {
          arrays: "always-multiline",
          objects: "always-multiline",
          imports: "always-multiline",
          exports: "always-multiline",
          functions: "always-multiline",
        },
      ],

      "no-unused-vars": [
        "error",
        {
          vars: "all",
          args: "after-used",
          ignoreRestSiblings: true,
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "no-console": ["warn", { allow: ["warn", "error", "log"] }],
      "prefer-const": "error",
      "no-var": "error",

      "object-shorthand": ["error", "always"],
      "quote-props": ["error", "as-needed"],
      "prefer-template": "error",
      "template-curly-spacing": ["error", "never"],
      "dot-notation": "error",
      "no-useless-escape": "error",

      "prefer-arrow-callback": ["error", { allowNamedFunctions: false }],
      "arrow-spacing": ["error", { before: true, after: true }],
      "arrow-parens": ["error", "always"],
      "arrow-body-style": ["error", "as-needed"],
      "no-confusing-arrow": ["error", { allowParens: true }],
      "implicit-arrow-linebreak": ["error", "beside"],

      "prefer-rest-params": "error",
      "prefer-spread": "error",
      "no-param-reassign": [
        "error",
        {
          props: true,
          ignorePropertyModificationsFor: [
            "acc",
            "accumulator",
            "e",
            "ctx",
            "req",
            "request",
            "res",
            "response",
            "socket",
          ],
        },
      ],

      "no-duplicate-imports": "error",

      "no-multi-spaces": "error",
      "space-before-blocks": "error",
      "keyword-spacing": ["error", { before: true, after: true }],
      "space-infix-ops": "error",
      "eol-last": ["error", "always"],
      "newline-per-chained-call": ["error", { ignoreChainWithDepth: 4 }],
      "no-whitespace-before-property": "error",
      "padded-blocks": ["error", "never"],
      "no-multiple-empty-lines": ["error", { max: 1, maxBOF: 0, maxEOF: 0 }],
      "space-in-parens": ["error", "never"],
      "array-bracket-spacing": ["error", "never"],
      "object-curly-spacing": ["error", "always"],
      "block-spacing": ["error", "always"],
      "comma-spacing": ["error", { before: false, after: true }],
      "computed-property-spacing": ["error", "never"],
      "func-call-spacing": ["error", "never"],
      "key-spacing": ["error", { beforeColon: false, afterColon: true }],
      "no-trailing-spaces": "error",

      camelcase: ["error", { properties: "never", ignoreDestructuring: false }],
      "new-cap": ["error", { newIsCap: true, capIsNew: false }],

      eqeqeq: ["error", "always", { null: "ignore" }],
      "no-shadow": ["error", { hoist: "functions" }],
      "consistent-return": "error",
      "no-nested-ternary": "error",
      "spaced-comment": ["error", "always", { exceptions: ["-", "+"], markers: ["=", "!"] }],

      "import/order": [
        "error",
        {
          groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],
      "import/newline-after-import": "error",
      "import/no-duplicates": "error",
      "import/no-unresolved": "off",
      "import/prefer-default-export": "off",
    },
  },

  globalIgnores(["**/coverage/**", "**/node_modules/**"]),
]);
