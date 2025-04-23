module.exports = {
  extends: [
    'react-app',
    'react-app/jest'
  ],
  rules: {
    // Disable TypeScript errors for potentially undefined properties
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-non-null-asserted-optional-chain': 'off',
    '@typescript-eslint/no-unused-vars': 'warn',
    // Disable other TypeScript errors for now
    '@typescript-eslint/ban-ts-comment': 'off'
  }
}; 