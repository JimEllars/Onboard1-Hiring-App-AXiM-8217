import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default [
  { ignores: ['dist', '.wrangler'] },
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
      WebSocketPair: "readonly",
        ...globals.browser,
        Response: true,
        Request: true,
        URL: true,
        fetch: true,
        console: true,
        ...globals.node,
        React: true,
        JSX: true
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        },
        sourceType: 'module'
      }
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      'no-undef': 'error', 
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'off',
      'react-refresh/only-export-components': 'off',
      'no-unused-vars': 'off',
      'no-case-declarations': 'off',
      'no-useless-catch': 'off'
    },
  }
];