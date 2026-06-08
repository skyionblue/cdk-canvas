import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: [
      'cdk.out/**',
      'node_modules/**',
      '**/*.js',
      '**/*.d.*',
      '**/*.map',
      'test-files/**',
      '**/dist/**',
    ],
  },
);
