/*
  Warnings:

  - The `Original Release Date` column on the `lpm` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `PreOrder Date` column on the `lpm` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `Timed Release Date` column on the `lpm` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `Instant Gratification Date` column on the `lpm` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `Release Date` on the `lpm` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `Last Process Date` on the `lpm` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `Import Date` on the `lpm` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "lpm" DROP COLUMN "Original Release Date",
ADD COLUMN     "Original Release Date" TIMESTAMP(3),
DROP COLUMN "Release Date",
ADD COLUMN     "Release Date" TIMESTAMP(3) NOT NULL,
DROP COLUMN "PreOrder Date",
ADD COLUMN     "PreOrder Date" TIMESTAMP(3),
DROP COLUMN "Timed Release Date",
ADD COLUMN     "Timed Release Date" TIMESTAMP(3),
DROP COLUMN "Last Process Date",
ADD COLUMN     "Last Process Date" TIMESTAMP(3) NOT NULL,
DROP COLUMN "Import Date",
ADD COLUMN     "Import Date" TIMESTAMP(3) NOT NULL,
DROP COLUMN "Instant Gratification Date",
ADD COLUMN     "Instant Gratification Date" TIMESTAMP(3);
