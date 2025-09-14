import Ajv from 'ajv';

const ajv = new Ajv({ allErrors: true, coerceTypes: true, removeAdditional: 'failing' });

export type Validation = { ok: true } | { ok: false; errors: string[] };

export function validateInputs(defInputs: any, inputs: any): Validation {
  // Build a simple object schema from the inputs definition found in catalog
  const schema = {
    type: 'object',
    additionalProperties: false,
    properties: defInputs && typeof defInputs === 'object' ? defInputs : {},
  } as any;
  try {
    const validate = ajv.compile(schema);
    const ok = validate(inputs ?? {});
    if (ok) return { ok: true };
    const errors = (validate.errors || []).map((e) => `${e.instancePath || ''} ${e.message}`.trim());
    return { ok: false, errors };
  } catch (e: any) {
    return { ok: false, errors: ['schema_compile_error'] };
  }
}

