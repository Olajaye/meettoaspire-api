import { PrismaClient, Prisma } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';
import * as fs from 'fs';
// import { CustomLoggerService } from '../../src/custom-logger/custom-logger.service';


export default async function CountriesSeeder(
  prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
) {
  // const logger = new CustomLoggerService();

  clearExistingRecords(prisma);

  const jsonData = fs.readFileSync(
    require.resolve('./files/countries.json'),
    'utf-8',
  );

  const countriesData = JSON.parse(jsonData);
  const existingCountryCodes = await prisma.country.findMany();

  // Extract codes from existing entries
  const existingCodeSet = new Set(
    existingCountryCodes.map((country) => country.id),
  );

  // Filter rows to exclude entries with existing codes
  const filteredRows = countriesData
    .map((c) => {
      let {
        id,
        name,
        iso2: code,
        capital,
        currency,
        currency_name: currencyName,
        currency_symbol: currencySymbol,
        phone_code: phonePrefix,
        flagEmoji,
        flagEmojiUnicode,
      } = c;
      return {
        id,
        name,
        code,
        capital,
        currency,
        currencyName,
        currencySymbol,
        phonePrefix,
        flagEmoji,
        flagEmojiUnicode,
      };
    })
    .filter((entry) => !existingCodeSet.has(entry.id));

  if (filteredRows.length > 0) {
    // Insert filtered data using createMany
    await prisma.country.createMany({
      data: filteredRows,
    });
  } else {
    // logger.log('All countries records have been previously saved');
    console.log('All countries records have been previously saved')
  }
}

const clearExistingRecords = async (
  prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
) => {
  const westernSahara = await prisma.country.findFirst({
    where: {name: 'Zimbabwe'}
  });
  if(westernSahara && westernSahara.id !== 247){
    // Clear the database
    await prisma.country.deleteMany({});
  }
}
