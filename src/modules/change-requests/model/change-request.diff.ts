import { isDeepStrictEqual } from 'node:util';

export type FieldOf<T> = keyof T & string;

export type FieldChange<T> = {
  [K in FieldOf<T>]: { field: K; current: T[K] | null; proposed: T[K] };
}[FieldOf<T>];

export function touchedFields<T extends object>(
  fields: readonly FieldOf<T>[],
  changes: Partial<T>,
): FieldOf<T>[] {
  return fields.filter((field) => changes[field] !== undefined);
}

export function pick<T extends object>(
  source: Partial<T>,
  fields: readonly FieldOf<T>[],
): Partial<T> {
  const picked: Partial<T> = {};

  for (const field of fields) {
    if (source[field] !== undefined) {
      picked[field] = source[field];
    }
  }

  return picked;
}

export function diffChangeRequest<T extends object>(
  fields: readonly FieldOf<T>[],
  current: T | null,
  changes: Partial<T>,
): FieldChange<T>[] {
  return touchedFields(fields, changes).map(
    (field) =>
      ({
        field,
        current: current?.[field] ?? null,
        proposed: changes[field],
      }) as FieldChange<T>,
  );
}

export function changesAnything(
  diff: readonly { current: unknown; proposed: unknown }[],
): boolean {
  return diff.some(
    ({ current, proposed }) => !isDeepStrictEqual(current, proposed),
  );
}
