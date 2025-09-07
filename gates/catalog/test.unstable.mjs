let attempts = 0;
export const meta = {
  id: 'test.unstable',
  version: '1.0.0',
  title: 'Unstable Gate',
  category: 'test',
  scope: 'safe'
};

export function validate(inputs) {
  return inputs;
}

export async function run(inputs) {
  attempts++;
  if (attempts < 2) {
    throw new Error('unstable');
  }
  return {
    gate_id: meta.id,
    status: 'pass',
    metrics: {},
    evidence: [],
    message: 'ok'
  };
}
