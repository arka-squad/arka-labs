import next from 'eslint-config-next';

export default [
  next(),
  {
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: ['./tsconfig.json'],
        },
      },
    },
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: "CallExpression[callee.name='fetch'][arguments.0.type='Literal'][arguments.0.value^='/api']",
          message: 'Utiliser apiFetch pour les appels /api',
        },
      ],
      'no-restricted-imports': [
        'error',
        { name: 'next/document', message: 'App Router: utilisez <html>/<body> natifs + metadata' },
      ],
    },
  },
];
