import js from '@eslint/js';
import nodePlugin from 'eslint-plugin-n';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

export default [
    js.configs.recommended,
    nodePlugin.configs['flat/recommended-module'],
    {
        files: ['src/**/*.ts'],
        plugins: {
            '@typescript-eslint': tsPlugin
        },
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                project: './tsconfig.json'
            }
        },
        rules: {
            ...tsPlugin.configs.recommended.rules,
            // disable base rules superseded by TS equivalents
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': 'error',
            'no-use-before-define': 'off',
            '@typescript-eslint/no-use-before-define': ['error', 'nofunc'],
            // style rules
            'no-console': 0,
            'no-useless-escape': 'warn',
            'arrow-parens': ['error', 'always'],
            'n/no-process-exit': 'warn',
            'n/hashbang': 'warn',
            'no-var': 'error',
            'prefer-const': 'error',
            'array-bracket-spacing': ['error', 'never'],
            'comma-dangle': ['error', 'never'],
            'computed-property-spacing': ['error', 'never'],
            'eol-last': 'error',
            'eqeqeq': ['error', 'smart'],
            'indent': ['error', 4, { 'SwitchCase': 1 }],
            'no-confusing-arrow': ['error', { 'allowParens': false }],
            'no-extend-native': 'error',
            'no-mixed-spaces-and-tabs': 'error',
            'func-call-spacing': ['error', 'never'],
            'no-trailing-spaces': 'error',
            'object-curly-spacing': ['error', 'always'],
            'prefer-arrow-callback': 'error',
            'quotes': ['error', 'single', 'avoid-escape'],
            'semi': ['error', 'always'],
            'space-infix-ops': 'error',
            'spaced-comment': ['error', 'always'],
            'keyword-spacing': ['error', { 'before': true, 'after': true }],
            'template-curly-spacing': ['error', 'never'],
            'semi-spacing': 'error',
            'n/no-missing-import': 'off'
        }
    }
]
