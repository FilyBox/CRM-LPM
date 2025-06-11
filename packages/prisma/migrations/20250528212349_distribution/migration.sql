/*
  Warnings:

  - You are about to drop the column `artistName` on the `DistributionStatementMusicPlatforms` table. All the data in the column will be lost.
  - Added the required column `name` to the `DistributionStatementMusicPlatforms` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DistributionStatementMusicPlatforms" DROP COLUMN "artistName",
ADD COLUMN     "name" TEXT NOT NULL;
