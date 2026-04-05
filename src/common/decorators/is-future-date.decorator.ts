import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

/**
 * ISO date strings or Date values strictly after the current instant.
 */
export function IsFutureDate(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isFutureDate',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown): boolean {
          if (value === undefined || value === null) return true;
          const date =
            value instanceof Date
              ? value
              : typeof value === 'string'
                ? new Date(value)
                : null;
          if (!date || Number.isNaN(date.getTime())) return false;
          return date.getTime() > Date.now();
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid date in the future`;
        },
      },
    });
  };
}
