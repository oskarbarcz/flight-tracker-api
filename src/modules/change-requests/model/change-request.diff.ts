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
    ({ current, proposed }) =>
      !isDeepStrictEqual(structuredClone(current), structuredClone(proposed)),
  );
}

export type ReferenceResolver = (id: string) => Promise<string | null>;

export type FieldReferences<T> = Partial<Record<FieldOf<T>, ReferenceResolver>>;

export type LabelledFieldChange<T> = FieldChange<T> & {
  currentLabel?: string | null;
  proposedLabel?: string | null;
};

function labelOf(resolve: ReferenceResolver, value: unknown) {
  return typeof value === 'string' ? resolve(value) : Promise.resolve(null);
}

export function labelFieldChanges<T extends object>(
  diff: readonly FieldChange<T>[],
  references: FieldReferences<T>,
): Promise<LabelledFieldChange<T>[]> {
  return Promise.all(
    diff.map(async (change): Promise<LabelledFieldChange<T>> => {
      const resolve = references[change.field];
      if (!resolve) {
        return change;
      }

      const [currentLabel, proposedLabel] = await Promise.all([
        labelOf(resolve, change.current),
        labelOf(resolve, change.proposed),
      ]);

      return { ...change, currentLabel, proposedLabel };
    }),
  );
}
