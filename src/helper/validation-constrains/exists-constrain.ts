import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { ExistsValidationInterface } from '../custom-types';

@ValidatorConstraint({ name: 'ExistsConstraint', async: true })
@Injectable()
export class ExistsConstraint implements ValidatorConstraintInterface {
  private readonly prisma = new PrismaClient();
  async validate(value: any, args: ValidationArguments): Promise<boolean> {
    // catch options from decorator
    const { entity, column }: ExistsValidationInterface = args.constraints[0];
    // database query check data is exists
    const dataExist = await this.prisma[entity].findUnique({
      where: { [column]: value },
    });
    return dataExist;
  }
  defaultMessage(args: ValidationArguments) {
    // here you can provide default error message if validation failed
    return `The ${args.property} provided does not exist`;
  }
}
