/*
  Warnings:

  - You are about to drop the column `cityId` on the `breweries` table. All the data in the column will be lost.
  - You are about to drop the `cities` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `countries` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `states` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "breweries" DROP CONSTRAINT "breweries_cityId_fkey";

-- DropForeignKey
ALTER TABLE "cities" DROP CONSTRAINT "cities_stateId_fkey";

-- DropForeignKey
ALTER TABLE "states" DROP CONSTRAINT "states_countryId_fkey";

-- AlterTable
ALTER TABLE "breweries" DROP COLUMN "cityId";

-- DropTable
DROP TABLE "cities";

-- DropTable
DROP TABLE "countries";

-- DropTable
DROP TABLE "states";
