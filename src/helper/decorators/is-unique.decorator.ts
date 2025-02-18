import { ValidationOptions, registerDecorator } from 'class-validator';
import { IsUniqueInterface } from '../custom-types';
import { IsUniqueConstraint } from '../validation-constrains/is-unique-constrain';

export function isUnique(
  options: IsUniqueInterface,
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isUnique',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [options],
      validator: IsUniqueConstraint,
    });
  };
}
