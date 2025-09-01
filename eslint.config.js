import next from 'eslint-config-next';

export default [
  next(),
  {
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: "CallExpression[callee.name='fetch'][arguments.0.type='Literal'][arguments.0.value^='/api']",
          message: 'Utiliser apiFetch pour les appels /api',
        },
      ],
    },
  },
];
