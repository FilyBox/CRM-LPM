/*
  Warnings:

  - The `assets` column on the `Releases` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Releases" DROP COLUMN "assets",
ADD COLUMN     "assets" BOOLEAN;
