-- AlterTable
ALTER TABLE "Artist" ALTER COLUMN "disabled" DROP NOT NULL;

-- CreateTable
CREATE TABLE "IsrcSongs" (
    "id" SERIAL NOT NULL,
    "date" TEXT,
    "isrc" TEXT,
    "artist" TEXT,
    "duration" TEXT,
    "trackName" TEXT,
    "title" TEXT,
    "license" TEXT,

    CONSTRAINT "IsrcSongs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ArtistToIsrcSongs" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ArtistToIsrcSongs_AB_unique" ON "_ArtistToIsrcSongs"("A", "B");

-- CreateIndex
CREATE INDEX "_ArtistToIsrcSongs_B_index" ON "_ArtistToIsrcSongs"("B");

-- AddForeignKey
ALTER TABLE "_ArtistToIsrcSongs" ADD CONSTRAINT "_ArtistToIsrcSongs_A_fkey" FOREIGN KEY ("A") REFERENCES "Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArtistToIsrcSongs" ADD CONSTRAINT "_ArtistToIsrcSongs_B_fkey" FOREIGN KEY ("B") REFERENCES "IsrcSongs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
