import { PrismaClient, Prisma } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';
import * as fs from 'fs';
// import { CustomLoggerService } from '../../src/custom-logger/custom-logger.service';

export default async function StatesSeeder(
  prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
) {
  // const logger = new CustomLoggerService();
  const jsonData = fs.readFileSync(
    require.resolve('./files/states.json'),
    'utf-8',
  );
  const statesData = JSON.parse(jsonData);
  const existingCountryCodes = await prisma.state.findMany();

  // Extract codes from existing entries
  const existingCodeSet = new Set(
    existingCountryCodes.map((state) => state.id),
  );

  // Filter rows to exclude entries with existing codes
  const filteredRows = statesData
    .map((state) => {
      const { id, name, state_code: stateCode, country_id: countryId } = state;
      return {
        id,
        name,
        stateCode,
        countryId,
      };
    })
    .filter((entry) => !existingCodeSet.has(entry.id));

  if (filteredRows.length > 0) {
    // Insert filtered data using createMany
    await prisma.state.createMany({
      data: filteredRows,
    });
  } else {
    // logger.log('All states records have been previously saved');
    console.log('All states records have been previously saved')
  }
}

