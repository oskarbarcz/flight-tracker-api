import { Then } from '@cucumber/cucumber';
import expect from 'expect';

const SHAPED = [
  'properties',
  '$ref',
  'additionalProperties',
  'allOf',
  'oneOf',
  'anyOf',
];

type SchemaObject = Record<string, Record<string, unknown>>;

let document: { components: { schemas: SchemaObject } } | null = null;

async function apiDocument(): Promise<{
  components: { schemas: SchemaObject };
}> {
  if (document === null) {
    const response = await fetch('http://localhost:3000/api-json');
    document = await response.json();
  }

  return document!;
}

Then('every response property should declare its type', async () => {
  const { schemas } = (await apiDocument()).components;
  const untyped: string[] = [];

  for (const [name, schema] of Object.entries(schemas)) {
    const properties = (schema.properties ?? {}) as SchemaObject;

    for (const [property, spec] of Object.entries(properties)) {
      const shaped = SHAPED.some((key) => key in spec);

      if (spec.type === 'object' && !shaped) {
        untyped.push(`${name}.${property}`);
      }
    }
  }

  expect(untyped).toEqual([]);
  expect(Object.keys(schemas).length).toBeGreaterThan(50);
});

Then(
  'the {string} property of {string} should offer {int} values',
  async (property: string, schema: string, count: number) => {
    const { schemas } = (await apiDocument()).components;
    const properties = (schemas[schema]?.properties ?? {}) as SchemaObject;
    const spec = properties[property];

    expect(spec).toBeDefined();

    const base = (spec.items ?? spec) as Record<string, unknown>;

    expect((base.enum as unknown[] | undefined)?.length).toBe(count);
  },
);
