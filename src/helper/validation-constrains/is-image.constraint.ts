import { Injectable } from '@nestjs/common';
import { ValidationArguments, ValidatorConstraint } from 'class-validator';
import { CustomLoggerService } from '../../common-modules/custom-logger/custom-logger.service';

@ValidatorConstraint({ name: 'IsImage', async: true })
@Injectable()
export class IsImageConstraint {
  constructor(private readonly logger: CustomLoggerService) {}
  async validate(imageUrl: URL): Promise<boolean> {
    try {
      const image = await fetch(imageUrl, { method: 'HEAD' }).then(
        async (res) => await res.blob(),
      );
      return image.type.startsWith('image/');
    } catch (e: unknown) {
      return false;
    }
  }

  defaultMessage(args: ValidationArguments) {
    // here you can provide default error message if validation failed
    return `The ${args.property} provided is not a valid image`;
  }
}
