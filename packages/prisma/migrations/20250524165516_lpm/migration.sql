-- CreateTable
CREATE TABLE "_lpmTolpmProductDisplayArtists" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_lpmTolpmProductDisplayArtists_AB_unique" ON "_lpmTolpmProductDisplayArtists"("A", "B");

-- CreateIndex
CREATE INDEX "_lpmTolpmProductDisplayArtists_B_index" ON "_lpmTolpmProductDisplayArtists"("B");

-- AddForeignKey
ALTER TABLE "_lpmTolpmProductDisplayArtists" ADD CONSTRAINT "_lpmTolpmProductDisplayArtists_A_fkey" FOREIGN KEY ("A") REFERENCES "lpm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_lpmTolpmProductDisplayArtists" ADD CONSTRAINT "_lpmTolpmProductDisplayArtists_B_fkey" FOREIGN KEY ("B") REFERENCES "lpmProductDisplayArtists"("id") ON DELETE CASCADE ON UPDATE CASCADE;
