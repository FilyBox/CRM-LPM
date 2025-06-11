/*
  Warnings:

  - The `date` column on the `IsrcSongs` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "IsrcSongs" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "date",
ADD COLUMN     "date" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "IsrcArtists" (
    "id" SERIAL NOT NULL,
    "artistId" INTEGER NOT NULL,
    "artistName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER,
    "teamId" INTEGER,

    CONSTRAINT "IsrcArtists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_IsrcArtistsToIsrcSongs" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_IsrcArtistsToIsrcSongs_AB_unique" ON "_IsrcArtistsToIsrcSongs"("A", "B");

-- CreateIndex
CREATE INDEX "_IsrcArtistsToIsrcSongs_B_index" ON "_IsrcArtistsToIsrcSongs"("B");

-- AddForeignKey
ALTER TABLE "IsrcArtists" ADD CONSTRAINT "IsrcArtists_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IsrcArtists" ADD CONSTRAINT "IsrcArtists_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IsrcArtists" ADD CONSTRAINT "IsrcArtists_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_IsrcArtistsToIsrcSongs" ADD CONSTRAINT "_IsrcArtistsToIsrcSongs_A_fkey" FOREIGN KEY ("A") REFERENCES "IsrcArtists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_IsrcArtistsToIsrcSongs" ADD CONSTRAINT "_IsrcArtistsToIsrcSongs_B_fkey" FOREIGN KEY ("B") REFERENCES "IsrcSongs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
