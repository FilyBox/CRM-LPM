/*
  Warnings:

  - You are about to drop the column `lpmId` on the `Artist` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Artist" DROP COLUMN "lpmId";

-- CreateTable
CREATE TABLE "lpmProductDisplayArtists" (
    "id" SERIAL NOT NULL,
    "lpmId" INTEGER NOT NULL,
    "artistId" INTEGER NOT NULL,

    CONSTRAINT "lpmProductDisplayArtists_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "lpmProductDisplayArtists" ADD CONSTRAINT "lpmProductDisplayArtists_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
