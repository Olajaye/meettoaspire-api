import { SetMetadata } from '@nestjs/common';

export const OPTIONAL_AUTH = 'optionalAuth';
export const OptionalAuth = (...args: string[]) =>
  SetMetadata(OPTIONAL_AUTH, true);
