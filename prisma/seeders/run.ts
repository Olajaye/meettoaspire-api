import { PrismaClient } from '@prisma/client';
import CountriesSeeder from './countries.seeder';
import StatesSeeder from './states.seeder';
import CitiesSeeder from './cities.seeder';

const prisma = new PrismaClient();

async function main() {
  await CountriesSeeder(prisma);
  await StatesSeeder(prisma);
  await CitiesSeeder(prisma);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // close Prisma Client at the end
    await prisma.$disconnect();
  });
