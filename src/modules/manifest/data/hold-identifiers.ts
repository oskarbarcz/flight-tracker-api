import holdLayoutData from './cargo-holds.data.json';

type RawLayout = { type: string; variants: { id: string }[] };

const RAW = holdLayoutData as RawLayout[];

export const CURATED_HOLD_TYPES: string[] = RAW.map((layout) => layout.type);

export const HOLD_VARIANT_IDS: string[] = RAW.flatMap((layout) =>
  layout.variants.map((variant) => variant.id),
);
