import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { uniqBy } from 'lodash';

const prisma = new PrismaClient();

async function seed() {
  console.log('Seeding...');

  const beersStylesFilePath: string = path.join(
    __dirname,
    'mocks',
    'beer-styles.json',
  );
  const beersFilePath: string = path.join(__dirname, 'mocks', 'beers.json');

  await createBeerStyles(beersStylesFilePath);
  await createBreweries(beersFilePath);
  await createBeers(beersFilePath);
}

async function createBeerStyles(filePath: string) {
  try {
    const beerStylesFile = fs.readFileSync(filePath, 'utf-8');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const beerStyles: Array<{
      name: string;
      minTemperature: number;
      maxTemperature: number;
      description: string;
    }> = JSON.parse(beerStylesFile);

    for (const style of beerStyles) {
      const existingStyle = await prisma.beerStyle.findUnique({
        where: { name: style.name },
      });

      if (existingStyle) {
        console.log(`Beer style ${style.name} already exists, skipping.`);
        continue;
      }

      await prisma.beerStyle.create({
        data: {
          name: style.name,
          minTemperature: style.minTemperature,
          maxTemperature: style.maxTemperature,
          averageTemperature:
            (Number(style.minTemperature) + Number(style.maxTemperature)) / 2,
          description: style.description,
        },
      });
    }

    console.log('Beer styles seeded successfully.');
  } catch (error) {
    console.error('Error seeding beer styles:', error);
  }
}

async function createBreweries(filePath: string) {
  try {
    const beersFile = fs.readFileSync(filePath, 'utf-8');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const beers: Array<{
      name: string;
      description: string;
      abv: number;
      ibu: number;
      beerStyle: string;
      brewery: string;
    }> = JSON.parse(beersFile);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call
    const uniqueBreweries = uniqBy(beers, 'brewery');

    for (const beer of uniqueBreweries) {
      const existingBrewery = await prisma.brewery.findUnique({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
        where: { name: beer.brewery },
      });

      if (existingBrewery) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        console.log(`Brewery ${beer.brewery} already exists, skipping.`);
        continue;
      }
      await prisma.brewery.create({
        // @ts-ignore
        data: {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
          name: beer?.brewery,
        },
      });
    }

    console.log('Breweries seeded successfully.');
  } catch (error) {
    console.error('Error seeding breweries:', error);
  }
}

async function createBeers(filePath: string) {
  try {
    const beersFile = fs.readFileSync(filePath, 'utf-8');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const beers: Array<{
      name: string;
      description: string;
      abv: number;
      ibu: number;
      beerStyle: string;
      brewery: string;
    }> = JSON.parse(beersFile);

    for (const beer of beers) {
      const brewery = await prisma.brewery.findUnique({
        where: { name: beer.brewery },
      });
      const style = await prisma.beerStyle.findUnique({
        where: { name: beer.beerStyle },
      });

      if (!style) {
        console.warn(
          `Beer style ${beer.beerStyle} not found for beer ${beer.name}. Skipping.`,
        );
        continue;
      }

      const existingBeer = await prisma.beer.findFirst({
        // @ts-ignore
        where: { name: beer.name, breweryId: brewery?.id, styleId: style?.id },
      });

      if (existingBeer) {
        console.log(`Beer ${beer.name} already exists, skipping.`);
        continue;
      }

      await prisma.beer.create({
        // @ts-ignore
        data: {
          name: beer.name,
          abv: Number(beer.abv),
          styleId: style?.id,
          breweryId: brewery?.id,
        },
      });
    }
    console.log('Beers seeded successfully.');
  } catch (error) {
    console.error('Error seeding beers:', error);
  }
}

seed()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  .finally(async () => {
    await prisma.$disconnect();
  });
