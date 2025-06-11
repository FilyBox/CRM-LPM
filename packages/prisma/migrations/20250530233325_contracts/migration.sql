/*
  Warnings:

  - The `startDate` column on the `Contracts` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `endDate` column on the `Contracts` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Contracts" DROP COLUMN "startDate",
ADD COLUMN     "startDate" TIMESTAMP(3),
DROP COLUMN "endDate",
ADD COLUMN     "endDate" TIMESTAMP(3);
