import { PrismaClient, Prisma } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';
import * as fs from 'fs';
// import { CustomLoggerService } from '../../src/custom-logger/custom-logger.service';


export default async function CitiesSeeder(
  prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
) {
  // const logger = new CustomLoggerService();
  const jsonData = fs.readFileSync(
    require.resolve('./files/cities.json'),
    'utf-8',
  );
  const citiesData = JSON.parse(jsonData);
  const existingCityIds = await prisma.city.findMany();

  // Extract codes from existing entries
  const existingCodeSet = new Set(existingCityIds.map((city) => city.id));

  // Filter rows to exclude entries with existing codes
  const filteredRows = citiesData
    .map((city) => {
      let { id, name, state_id: stateId, country_id: countryId } = city;
      return {
        id,
        name,
        stateId,
        countryId,
      };
    })
    .filter((entry) => !existingCodeSet.has(entry.id));

  if (filteredRows.length > 0) {
    // Insert filtered data using createMany
    await prisma.city.createMany({
      data: filteredRows,
    });
   
  } else {
    // logger.log('CitiesSeeder: All cities records have been previously saved');
    console.log("CitiesSeeder: All cities records have been previously saved")
  }
}
