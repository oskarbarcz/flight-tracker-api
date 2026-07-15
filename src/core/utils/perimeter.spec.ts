import {
  isPointInsidePolygon,
  firstPositionOutsidePerimeter,
} from './perimeter';

const KBOS_SHAPE = [
  { latitude: 42.358003, longitude: -71.027942 },
  { latitude: 42.364564, longitude: -71.025858 },
  { latitude: 42.367948, longitude: -71.033134 },
  { latitude: 42.370683, longitude: -71.03181 },
  { latitude: 42.369845, longitude: -71.027718 },
  { latitude: 42.370305, longitude: -71.027171 },
  { latitude: 42.373415, longitude: -71.030172 },
  { latitude: 42.375082, longitude: -71.02935 },
  { latitude: 42.378339, longitude: -71.025351 },
  { latitude: 42.378698, longitude: -71.023709 },
  { latitude: 42.378004, longitude: -71.022243 },
  { latitude: 42.379368, longitude: -71.02263 },
  { latitude: 42.379612, longitude: -71.021834 },
  { latitude: 42.376482, longitude: -71.018719 },
  { latitude: 42.37513, longitude: -71.015688 },
  { latitude: 42.374274, longitude: -71.016229 },
  { latitude: 42.371566, longitude: -71.011482 },
  { latitude: 42.378555, longitude: -71.006943 },
  { latitude: 42.379202, longitude: -71.004849 },
  { latitude: 42.377013, longitude: -70.998027 },
  { latitude: 42.369299, longitude: -71.001775 },
  { latitude: 42.367044, longitude: -70.999588 },
  { latitude: 42.367621, longitude: -71.002498 },
  { latitude: 42.365395, longitude: -71.003674 },
  { latitude: 42.365433, longitude: -71.002129 },
  { latitude: 42.363625, longitude: -71.0018 },
  { latitude: 42.360569, longitude: -70.997305 },
  { latitude: 42.362077, longitude: -70.989248 },
  { latitude: 42.361423, longitude: -70.98744 },
  { latitude: 42.357783, longitude: -70.986238 },
  { latitude: 42.354528, longitude: -70.99062 },
  { latitude: 42.349994, longitude: -70.985298 },
  { latitude: 42.353375, longitude: -70.989869 },
  { latitude: 42.354015, longitude: -70.994358 },
  { latitude: 42.356812, longitude: -70.998443 },
  { latitude: 42.3568, longitude: -71.001705 },
  { latitude: 42.355417, longitude: -71.006331 },
  { latitude: 42.353958, longitude: -71.005533 },
  { latitude: 42.355093, longitude: -71.004443 },
  { latitude: 42.354706, longitude: -71.003413 },
  { latitude: 42.347205, longitude: -71.004812 },
  { latitude: 42.346672, longitude: -71.007696 },
  { latitude: 42.349696, longitude: -71.01242 },
  { latitude: 42.348, longitude: -71.013322 },
  { latitude: 42.349734, longitude: -71.012481 },
  { latitude: 42.350878, longitude: -71.014108 },
];

describe('isPointInsidePolygon', () => {
  it('returns true for the airport reference point', () => {
    expect(
      isPointInsidePolygon(
        { latitude: 42.36454, longitude: -71.01663 },
        KBOS_SHAPE,
      ),
    ).toBe(true);
  });

  it('returns false for a distant point', () => {
    expect(
      isPointInsidePolygon(
        { latitude: 39.87113, longitude: -75.24349 },
        KBOS_SHAPE,
      ),
    ).toBe(false);
  });

  it('returns false for a point just north of the field', () => {
    expect(
      isPointInsidePolygon({ latitude: 42.42, longitude: -71.01 }, KBOS_SHAPE),
    ).toBe(false);
  });

  it('returns false for a point just west of the field', () => {
    expect(
      isPointInsidePolygon({ latitude: 42.36, longitude: -71.06 }, KBOS_SHAPE),
    ).toBe(false);
  });
});

describe('firstPositionOutsidePerimeter', () => {
  const inside = [
    { latitude: 42.36454, longitude: -71.01663 },
    { latitude: 42.3625, longitude: -71.005 },
  ];
  const outside = [
    { latitude: 42.33, longitude: -70.95 },
    { latitude: 42.2, longitude: -70.8 },
  ];

  it('returns the earliest position outside the perimeter', () => {
    const path = [...inside, ...outside];
    expect(firstPositionOutsidePerimeter(path, KBOS_SHAPE)).toBe(outside[0]);
  });

  it('returns null when every position is inside', () => {
    expect(firstPositionOutsidePerimeter(inside, KBOS_SHAPE)).toBeNull();
  });

  it('returns null for an empty path', () => {
    expect(firstPositionOutsidePerimeter([], KBOS_SHAPE)).toBeNull();
  });
});
