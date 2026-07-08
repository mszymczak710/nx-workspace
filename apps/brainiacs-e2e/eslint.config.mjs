import playwright from 'eslint-plugin-playwright';
import baseConfig from '../../eslint.config.mjs';

export default [
  playwright.configs['flat/recommended'],
  ...baseConfig,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: import.meta.dirname
      }
    }
  },
  {
    files: ['**/*.ts', '**/*.js'],
    // This is a plain Playwright/TS project, not an Angular one — the shared base config
    // applies `@angular-eslint/*` rules to all `**/*.ts` files assuming the plugin is
    // registered by an Angular-specific config (as in apps/brainiacs), which isn't the case here.
    rules: {
      '@angular-eslint/directive-class-suffix': 'off',
      '@angular-eslint/prefer-inject': 'off',
      '@angular-eslint/prefer-on-push-component-change-detection': 'off',
      '@angular-eslint/no-empty-lifecycle-method': 'off',
      '@angular-eslint/use-lifecycle-interface': 'off',
      '@angular-eslint/no-input-rename': 'off',
      '@angular-eslint/no-output-native': 'off',
      '@angular-eslint/use-pipe-transform-interface': 'off',
      '@angular-eslint/prefer-signals': 'off',
      '@angular-eslint/prefer-output-emitter-ref': 'off',
      '@angular-eslint/prefer-output-readonly': 'off',
      '@angular-eslint/prefer-signal-model': 'off'
    }
  }
];
