module.exports = {
  env: {
    commonjs: true,
    es2021: true,
    node: true,
    jest: true,
  },
  extends: ['airbnb-base'],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    // Allow console.log in Node.js services
    'no-console': 'warn',
    // Relax some rules common in Express apps
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
};
