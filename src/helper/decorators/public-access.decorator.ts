import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const PublicAccess = (...args: string[]) =>
  SetMetadata(IS_PUBLIC_KEY, true);
