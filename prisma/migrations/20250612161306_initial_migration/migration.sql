-- CreateTable
CREATE TABLE "countries" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "countries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "states" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "countryId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "states_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cities" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "stateId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beer_styles" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "minTemperature" DECIMAL(3,1),
    "maxTemperature" DECIMAL(3,1),
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "beer_styles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "breweries" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "cityId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "breweries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beers" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "abv" DECIMAL(4,2),
    "styleId" INTEGER NOT NULL,
    "breweryId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "beers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "countries_name_key" ON "countries"("name");

-- CreateIndex
CREATE UNIQUE INDEX "states_countryId_name_key" ON "states"("countryId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "cities_stateId_name_key" ON "cities"("stateId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "beer_styles_name_key" ON "beer_styles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "breweries_name_key" ON "breweries"("name");

-- CreateIndex
CREATE UNIQUE INDEX "beers_breweryId_name_key" ON "beers"("breweryId", "name");

-- AddForeignKey
ALTER TABLE "states" ADD CONSTRAINT "states_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "countries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cities" ADD CONSTRAINT "cities_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "states"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "breweries" ADD CONSTRAINT "breweries_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "beers" ADD CONSTRAINT "beers_styleId_fkey" FOREIGN KEY ("styleId") REFERENCES "beer_styles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "beers" ADD CONSTRAINT "beers_breweryId_fkey" FOREIGN KEY ("breweryId") REFERENCES "breweries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
