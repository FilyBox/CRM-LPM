/*
  Warnings:

  - The `typeOfRelease` column on the `Releases` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `release` column on the `Releases` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Release" AS ENUM ('Soft', 'Focus');

-- CreateEnum
CREATE TYPE "TypeOfRelease" AS ENUM ('Sencillo', 'Album', 'Ep');

-- AlterTable
ALTER TABLE "Releases" DROP COLUMN "typeOfRelease",
ADD COLUMN     "typeOfRelease" "TypeOfRelease",
DROP COLUMN "release",
ADD COLUMN     "release" "Release";
