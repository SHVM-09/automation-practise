const fs = require('fs')
const pathConfig = require('../configs/paths.json')

const data = `module.exports = {
  env: {
    node: true,
    es6: true,
    browser: true
  },
  parser: 'babel-eslint',
  plugins: ['react', 'react-hooks', 'jsx-a11y', 'import'],  
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
    project: './jsconfig.json',
    ecmaFeatures: {
      jsx: true,
      modules: true,
      experimentalObjectRestSpread: true
    }
  },
  rules: {
    semi: 'off',
    'one-var': 'off',
    'no-console': 'off',
    'prettier/prettier': 'off',
    'no-use-before-define': 'off',
    'import/newline-after-import': 'off',
    'prefer-destructuring': 'off',
    'no-nested-ternary': 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'react/jsx-filename-extension': 'off',
    // Best Practices
    eqeqeq: 'error',
    'no-invalid-this': 'error',
    'no-return-assign': 'off',
    'no-unused-expressions': 'off',
    'no-useless-concat': 'error',
    'no-useless-return': 'error',

    // Variable
    // 'init-declarations': 'error',

    // Stylistic Issues
    'array-bracket-newline': 'off',
    'array-bracket-spacing': 'error',
    'brace-style': ['error', '1tbs', { allowSingleLine: true }],
    'block-spacing': 'error',
    'comma-dangle': 'off',
    'comma-spacing': 'error',
    'comma-style': 'error',
    'computed-property-spacing': 'error',
    'func-call-spacing': 'error',
    'implicit-arrow-linebreak': 'off',
    // indent: ['error', 4],
    'keyword-spacing': 'error',
    'multiline-ternary': 'off',
    // 'no-lonely-if': 'error',
    'no-mixed-operators': 'off',
    'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 1 }],
    'no-tabs': 'error',
    'no-unneeded-ternary': 'error',
    'react-hooks/exhaustive-deps': 'off',
    'no-whitespace-before-property': 'error',
    'nonblock-statement-body-position': 'error',
    'object-property-newline': ['error', { allowAllPropertiesOnSameLine: true }],
    'quote-props': ['error', 'as-needed'],
    // quotes: ['error', 'prefer-single'],
    semi: ['error', 'never'],
    'semi-spacing': 'error',
    'space-before-blocks': 'error',
    // 'space-before-function-paren': 'error',
    'space-in-parens': 'error',
    'space-infix-ops': 'error',
    'space-unary-ops': 'error',

    // ES6
    'arrow-spacing': 'error',
    'no-confusing-arrow': 'off',
    'no-duplicate-imports': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-const': 'error',
    'prefer-template': 'error',

    // add new line above comment
    'lines-around-comment': [
      'error',
      {
        beforeBlockComment: true,
        beforeLineComment: true,
        allowBlockStart: true,
        allowClassStart: true,
        allowObjectStart: true,
        allowArrayStart: true,
      },
    ],

    // add new line above comment
    'newline-before-return': 'off',

    // add new line below import
    'import/newline-after-import': ['error', { count: 1 }],

    // add new line after each var, const, let declaration
    'padding-line-between-statements': ["error", { blankLine: "always", prev: ["const", "let", "var"], next: "*"}, { blankLine: "always", prev: ["*"], next: ["export"]}, { blankLine: "always", prev: ["export"], next: ["*"]}, { blankLine: "always", prev: ["*"], next: ["if"]}]
  }

  // rules: {
  //   'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
  //   'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
  //   semi: ['error', 'never'],
  //   'max-len': 'off',
  //   camelcase: ['error', { properties: 'never', ignoreDestructuring: true, ignoreImports: true }]
  // }
}`

// ** write eslintrc file in jsx-version directory
fs.writeFile(`${pathConfig.fullVersionJSXPath}/.eslintrc.js`, data, err => {
  if (err) {
    console.error(err)

    return
  } else {
    console.log('File Written: /jsx-version/.eslintrc.js')
  }
})
