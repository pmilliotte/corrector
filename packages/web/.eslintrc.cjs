module.exports = {
  env: { browser: true, es2020: true },
  extends: [
    'plugin:jsx-a11y/recommended',
    'plugin:react/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['react-hooks', 'jsx-a11y', 'risxss', 'react-refresh', 'formatjs'],
  ignorePatterns: ['dist', '.eslintrc.cjs', 'public/es5'],
  parserOptions: {
    project: ['./tsconfig.json'],
    tsconfigRootDir: __dirname,
  },
  rules: {
    'react/prop-types': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'error',
    'react/react-in-jsx-scope': 'off',
    'react/self-closing-comp': 'error',
    'jsx-a11y/anchor-is-valid': 'error',
    'jsx-a11y/accessible-emoji': 'off',
    'risxss/catch-potential-xss-react': 'error',
    'react/jsx-curly-brace-presence': 'error',
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    'react/no-danger': 'error',
    'formatjs/no-literal-string-in-jsx': 'error',
    "@typescript-eslint/no-misused-promises": [2, {
      "checksVoidReturn": {
        "attributes": false
      }
    }]
  },
  settings: { react: { version: 'detect' } },
};
