/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Artist` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Artist" ADD COLUMN     "lpmId" INTEGER;

-- CreateTable
CREATE TABLE "_ArtistTolpm" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ArtistTolpm_AB_unique" ON "_ArtistTolpm"("A", "B");

-- CreateIndex
CREATE INDEX "_ArtistTolpm_B_index" ON "_ArtistTolpm"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Artist_name_key" ON "Artist"("name");

-- AddForeignKey
ALTER TABLE "_ArtistTolpm" ADD CONSTRAINT "_ArtistTolpm_A_fkey" FOREIGN KEY ("A") REFERENCES "Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArtistTolpm" ADD CONSTRAINT "_ArtistTolpm_B_fkey" FOREIGN KEY ("B") REFERENCES "lpm"("id") ON DELETE CASCADE ON UPDATE CASCADE;
