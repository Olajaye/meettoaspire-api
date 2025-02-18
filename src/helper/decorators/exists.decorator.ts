import { ValidationOptions, registerDecorator } from 'class-validator';
import { ExistsValidationInterface } from '../custom-types';
import { ExistsConstraint } from '../validation-constrains/exists-constrain';

export function exists(
  options: ExistsValidationInterface,
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'exists',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [options],
      validator: ExistsConstraint,
    });
  };
}
