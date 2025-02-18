import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";

export type IsUniqueInterface = {
  entity: string;
  column: string;
};

export const UserIncludeOptions = {
  country: true,
  city: true,
  state: true,
};

export type UserIncludeOptionsType = typeof UserIncludeOptions;


export type UserWithRelations = Prisma.UserGetPayload<
  {
    include: UserIncludeOptionsType;
  } & { isConnected?: boolean }
>;

export type PrismaTransaction = Omit<
  PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

export type ExistsValidationInterface = {
  entity: string;
  column: string;
};