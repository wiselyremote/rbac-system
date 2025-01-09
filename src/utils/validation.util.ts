import { mapValues } from 'lodash-es';
import { ZodTypeAny } from 'zod';

export function makeAllOptional(params: Record<string, ZodTypeAny>) {
  return mapValues(params, (param) => param.optional());
}
