/*
  Warnings:

  - The `Timed Release Music Services` column on the `lpm` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "lpm" DROP COLUMN "Timed Release Music Services",
ADD COLUMN     "Timed Release Music Services" TIMESTAMP(3);
