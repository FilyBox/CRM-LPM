-- CreateEnum
CREATE TYPE "TypeOfTuStreams" AS ENUM ('Sencillo', 'Album', 'Single', 'EP');

-- CreateTable
CREATE TABLE "tuStreamsArtists" (
    "id" SERIAL NOT NULL,
    "artistId" INTEGER NOT NULL,
    "artistName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER,
    "teamId" INTEGER,

    CONSTRAINT "tuStreamsArtists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tuStreams" (
    "id" SERIAL NOT NULL,
    "title" TEXT,
    "UPC" TEXT,
    "artist" TEXT,
    "type" "TypeOfTuStreams",
    "total" DOUBLE PRECISION,
    "date" TIMESTAMP(3),
    "userId" INTEGER,
    "teamId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tuStreams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ArtistTotuStreams" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_tuStreamsTotuStreamsArtists" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ArtistTotuStreams_AB_unique" ON "_ArtistTotuStreams"("A", "B");

-- CreateIndex
CREATE INDEX "_ArtistTotuStreams_B_index" ON "_ArtistTotuStreams"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_tuStreamsTotuStreamsArtists_AB_unique" ON "_tuStreamsTotuStreamsArtists"("A", "B");

-- CreateIndex
CREATE INDEX "_tuStreamsTotuStreamsArtists_B_index" ON "_tuStreamsTotuStreamsArtists"("B");

-- AddForeignKey
ALTER TABLE "tuStreamsArtists" ADD CONSTRAINT "tuStreamsArtists_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tuStreamsArtists" ADD CONSTRAINT "tuStreamsArtists_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tuStreamsArtists" ADD CONSTRAINT "tuStreamsArtists_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tuStreams" ADD CONSTRAINT "tuStreams_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tuStreams" ADD CONSTRAINT "tuStreams_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArtistTotuStreams" ADD CONSTRAINT "_ArtistTotuStreams_A_fkey" FOREIGN KEY ("A") REFERENCES "Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArtistTotuStreams" ADD CONSTRAINT "_ArtistTotuStreams_B_fkey" FOREIGN KEY ("B") REFERENCES "tuStreams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_tuStreamsTotuStreamsArtists" ADD CONSTRAINT "_tuStreamsTotuStreamsArtists_A_fkey" FOREIGN KEY ("A") REFERENCES "tuStreams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_tuStreamsTotuStreamsArtists" ADD CONSTRAINT "_tuStreamsTotuStreamsArtists_B_fkey" FOREIGN KEY ("B") REFERENCES "tuStreamsArtists"("id") ON DELETE CASCADE ON UPDATE CASCADE;
