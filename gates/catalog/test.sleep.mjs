export const meta = {
  id: 'test.sleep',
  version: '1.0.0',
  title: 'Sleep Gate',
  category: 'test',
  scope: 'safe'
};

export function validate(inputs) {
  return inputs;
}

export async function run(inputs) {
  const ms = inputs.ms ?? 0;
  await new Promise((res) => setTimeout(res, ms));
  return {
    gate_id: meta.id,
    status: 'pass',
    metrics: { ms },
    evidence: [],
    message: `slept ${ms}`
  };
}
