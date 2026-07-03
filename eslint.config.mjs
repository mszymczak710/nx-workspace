import nx from '@nx/eslint-plugin';
import vitest from '@vitest/eslint-plugin';

import eslintConfigPrettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import preferArrow from 'eslint-plugin-prefer-arrow';
import unusedImports from 'eslint-plugin-unused-imports';

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: ['**/dist', '**/out-tsc', '**/vitest.config.*.timestamp*']
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
          depConstraints: [
            {
              sourceTag: 'scope:brainiacs',
              onlyDependOnLibsWithTags: ['scope:brainiacs', 'scope:shared']
            },
            {
              sourceTag: 'scope:invoice-generator',
              onlyDependOnLibsWithTags: ['scope:invoice-generator', 'scope:shared']
            },
            {
              sourceTag: 'scope:shared',
              onlyDependOnLibsWithTags: ['scope:shared']
            }
          ]
        }
      ]
    }
  },
  {
    files: ['**/*.ts'],
    plugins: {
      import: importPlugin,
      'unused-imports': unusedImports,
      'prefer-arrow': preferArrow
    },
    rules: {
      // --- imports ---
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_'
        }
      ],
      'import/no-duplicates': 'error',

      // --- style: prefer arrow functions ---
      'prefer-arrow/prefer-arrow-functions': [
        'warn',
        {
          disallowPrototype: true,
          singleReturnOnly: false,
          classPropertiesAllowed: false
        }
      ],

      // --- angular: suffixes  ---
      '@angular-eslint/component-class-suffix': 'off',
      '@angular-eslint/directive-class-suffix': ['error', { suffixes: ['Directive'] }],

      // --- angular: modern API ---
      '@angular-eslint/prefer-inject': 'error',
      '@angular-eslint/prefer-on-push-component-change-detection': 'error',
      '@angular-eslint/no-empty-lifecycle-method': 'error',
      '@angular-eslint/use-lifecycle-interface': 'error',
      '@angular-eslint/no-input-rename': 'error',
      '@angular-eslint/no-output-native': 'error',
      '@angular-eslint/no-output-rename': 'off',
      '@angular-eslint/use-pipe-transform-interface': 'error',

      // --- angular: signals ---
      '@angular-eslint/prefer-signals': 'error',
      '@angular-eslint/prefer-output-emitter-ref': 'error',
      '@angular-eslint/prefer-output-readonly': 'error',
      '@angular-eslint/prefer-signal-model': 'error',

      // --- typescript ---
      '@typescript-eslint/member-ordering': ['error', { default: ['static-field', 'instance-field', 'static-method', 'instance-method'] }],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/prefer-readonly': 'error',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-unsafe-declaration-merging': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/explicit-function-return-type': ['warn', { allowExpressions: true }],
      '@typescript-eslint/no-inferrable-types': 'error',
      '@typescript-eslint/array-type': ['error', { default: 'array' }],

      // --- general ---
      curly: 'error',
      'linebreak-style': 'off',
      'new-parens': 'error',
      'newline-per-chained-call': 'off',
      'no-empty': ['error', { allowEmptyCatch: true }],
      'no-extra-semi': 'error',
      'no-irregular-whitespace': 'error',
      'no-trailing-spaces': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      eqeqeq: ['error', 'always']
    }
  },
  {
    files: ['**/*.html'],
    rules: {
      '@angular-eslint/template/prefer-control-flow': 'error',
      '@angular-eslint/template/no-negated-async': 'error',
      '@angular-eslint/template/elements-content': 'off'
    }
  },
  {
    files: ['**/*.spec.ts', '**/*.test.ts'],
    plugins: { vitest },
    rules: {
      ...vitest.configs.recommended.rules,
      '@typescript-eslint/no-empty-function': 'off',
      'vitest/expect-expect': [
        'error',
        {
          assertFunctionNames: ['expect', '*.expectNone', '*.expectOne', '*.verify']
        }
      ]
    },
    languageOptions: {
      globals: {
        ...vitest.environments.env.globals
      }
    }
  },
  {
    files: ['**/types/*.ts', '**/services/*.ts'],
    rules: {
      '@typescript-eslint/naming-convention': [
        'warn',
        {
          selector: 'default',
          format: ['camelCase'],
          leadingUnderscore: 'allow',
          trailingUnderscore: 'allow'
        },
        {
          selector: 'variable',
          format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
          leadingUnderscore: 'allow',
          trailingUnderscore: 'allow'
        },
        { selector: 'property', format: ['camelCase', 'snake_case', 'PascalCase'] },
        { selector: ['import'], format: ['camelCase', 'PascalCase'] },
        { selector: ['typeLike'], format: ['PascalCase'] }
      ]
    }
  },
  eslintConfigPrettier
];
