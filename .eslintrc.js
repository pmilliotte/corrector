module.exports = {
  extends: ['eslint:recommended', 'plugin:import/recommended'],
  rules: {
    curly: ['error', 'all'],
    eqeqeq: ['error', 'smart'],
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: true,
        optionalDependencies: false,
        peerDependencies: false,
      },
    ],
    'no-shadow': [
      'error',
      {
        hoist: 'all',
      },
    ],
    'prefer-const': 'error',
    'sort-imports': [
      'error',
      {
        ignoreCase: true,
        ignoreDeclarationSort: true,
        ignoreMemberSort: false,
        memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
      },
    ],
    'padding-line-between-statements': [
      'error',
      {
        blankLine: 'always',
        prev: '*',
        next: 'return',
      },
    ],
    'import/extensions': 0,
    'import/no-unresolved': 0,
    'import/prefer-default-export': 0,
    'import/no-duplicates': 'error',
    complexity: ['error', 8],
    'max-lines': ['error', 200],
    'max-depth': ['error', 3],
    'max-params': ['error', 4],
    'prefer-arrow/prefer-arrow-functions': [
      'error',
      {
        disallowPrototype: true,
        singleReturnOnly: false,
        classPropertiesAllowed: false,
      },
    ],
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['@corrector/*/*'],
            message:
              'import of internal packages must be done at the root level.',
          },
        ],
        paths: [
          {
            name: 'lodash',
            message: 'Please use lodash/{module} import instead',
          },
          {
            name: '.',
            message: 'Please use explicit import file',
          },
        ],
      },
    ]
  },
  root: true,
  plugins: ['import', 'prefer-arrow'],
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  overrides: [
    {
      files: ['**/*.ts?(x)'],
      extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
      ],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: 'tsconfig.json',
        EXPERIMENTAL_useProjectService: true,
      },
      settings: { 'import/resolver': { typescript: {} } },
      rules: {
        curly: ['error', 'all'],
        '@typescript-eslint/prefer-optional-chain': 'error',
        'no-shadow': 'off',
        'arrow-body-style': ['error', 'as-needed'],
        '@typescript-eslint/no-shadow': 'error',
        '@typescript-eslint/prefer-nullish-coalescing': 'error',
        '@typescript-eslint/strict-boolean-expressions': 'error',
        '@typescript-eslint/no-unused-vars': [
          'error',
          {
            ignoreRestSiblings: true,
            varsIgnorePattern: '^_',
            argsIgnorePattern: '^_',
          },
        ],
        '@typescript-eslint/restrict-template-expressions': [
          'error',
          {
            allowNumber: true,
            allowBoolean: true,
          },
        ],
        '@typescript-eslint/ban-ts-comment': [
          'error',
          {
            'ts-ignore': 'allow-with-description',
            minimumDescriptionLength: 10,
          },
        ],
        '@typescript-eslint/explicit-function-return-type': 0,
        '@typescript-eslint/explicit-member-accessibility': 0,
        '@typescript-eslint/camelcase': 0,
        '@typescript-eslint/interface-name-prefix': 0,
        '@typescript-eslint/explicit-module-boundary-types': 'error',
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/ban-types': [
          'error',
          {
            types: {
              FC: 'Use `const MyComponent = (props: Props): ReactElement` instead',
              SFC: 'Use `const MyComponent = (props: Props): ReactElement` instead',
              FunctionComponent:
                'Use `const MyComponent = (props: Props): ReactElement` instead',
              'React.FC':
                'Use `const MyComponent = (props: Props): ReactElement` instead',
              'React.SFC':
                'Use `const MyComponent = (props: Props): ReactElement` instead',
              'React.FunctionComponent':
                'Use `const MyComponent = (props: Props): ReactElement` instead',
              'JSX.Element':
                'Use `const MyComponent = (props: Props): ReactElement` instead',
            },
            extendDefaults: true,
          },
        ],
        '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'error',
        '@typescript-eslint/no-unnecessary-condition': 'error',
        '@typescript-eslint/no-unnecessary-type-arguments': 'error',
        '@typescript-eslint/prefer-string-starts-ends-with': 'error',
        '@typescript-eslint/switch-exhaustiveness-check': 'error',
        'prettier/prettier': ['error', { singleQuote: true }],
      },
    },
    {
      files: ['**/*.test.ts'],
      rules: {
        'max-lines': ['off'],
      },
    },
    {
      files: ['**/*.d.ts'],
      rules: {
        '@typescript-eslint/triple-slash-reference': ['off'],
      },
    },
  ],
};
