import { OperatorServiceType, serviceTypesCarrying } from './operator.model';

describe('serviceTypesCarrying', () => {
  it('counts carriers of both as freight carriers', () => {
    expect(serviceTypesCarrying(OperatorServiceType.Cargo)).toEqual([
      OperatorServiceType.Cargo,
      OperatorServiceType.Both,
    ]);
  });

  it('counts carriers of both as passenger carriers', () => {
    expect(serviceTypesCarrying(OperatorServiceType.Passenger)).toEqual([
      OperatorServiceType.Passenger,
      OperatorServiceType.Both,
    ]);
  });

  it('narrows to carriers of both when both is asked for', () => {
    expect(serviceTypesCarrying(OperatorServiceType.Both)).toEqual([
      OperatorServiceType.Both,
    ]);
  });
});
