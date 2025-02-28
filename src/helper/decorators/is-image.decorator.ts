import { ValidationOptions, registerDecorator } from 'class-validator';
import { IsImageConstraint } from '../validation-constrains/is-image.constraint';

export function IsImage(
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'IsImage',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsImageConstraint,
    });
  };
}