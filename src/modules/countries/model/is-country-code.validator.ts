import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';
import { isKnownCountryCode } from './country.model';

export function IsCountryCode(options?: ValidationOptions) {
  return function (target: object, propertyName: string): void {
    registerDecorator({
      name: 'isCountryCode',
      target: target.constructor,
      propertyName,
      options,
      validator: {
        validate: (value: unknown) => isKnownCountryCode(value),
        defaultMessage: (args: ValidationArguments) =>
          `${args.property} must be a known ISO 3166-1 alpha-2 country code`,
      },
    });
  };
}
