-- CreateTable
CREATE TABLE "releasesArtists" (
    "id" SERIAL NOT NULL,
    "artistId" INTEGER NOT NULL,
    "artistName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER,
    "teamId" INTEGER,

    CONSTRAINT "releasesArtists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ReleasesToreleasesArtists" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ReleasesToreleasesArtists_AB_unique" ON "_ReleasesToreleasesArtists"("A", "B");

-- CreateIndex
CREATE INDEX "_ReleasesToreleasesArtists_B_index" ON "_ReleasesToreleasesArtists"("B");

-- AddForeignKey
ALTER TABLE "releasesArtists" ADD CONSTRAINT "releasesArtists_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "releasesArtists" ADD CONSTRAINT "releasesArtists_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "releasesArtists" ADD CONSTRAINT "releasesArtists_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ReleasesToreleasesArtists" ADD CONSTRAINT "_ReleasesToreleasesArtists_A_fkey" FOREIGN KEY ("A") REFERENCES "Releases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ReleasesToreleasesArtists" ADD CONSTRAINT "_ReleasesToreleasesArtists_B_fkey" FOREIGN KEY ("B") REFERENCES "releasesArtists"("id") ON DELETE CASCADE ON UPDATE CASCADE;
