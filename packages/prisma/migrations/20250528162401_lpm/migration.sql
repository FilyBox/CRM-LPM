/*
  Warnings:

  - The `Last Modified` column on the `lpm` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `Submitted At` column on the `lpm` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "lpm" DROP COLUMN "Last Modified",
ADD COLUMN     "Last Modified" TIMESTAMP(3),
DROP COLUMN "Submitted At",
ADD COLUMN     "Submitted At" TIMESTAMP(3);
