import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export type CountRecord = Record<string, number>;

function isCountRecord(value: unknown): value is CountRecord {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }

  return Object.values(value).every(
    (count) => Number.isInteger(count) && (count as number) >= 0,
  );
}

export function IsCountRecord(options?: ValidationOptions) {
  return function (target: object, propertyName: string): void {
    registerDecorator({
      name: 'isCountRecord',
      target: target.constructor,
      propertyName,
      options,
      validator: {
        validate: (value: unknown) => isCountRecord(value),
        defaultMessage: (args: ValidationArguments) =>
          `each value of ${args.property} must be a whole number of zero or more`,
      },
    });
  };
}
