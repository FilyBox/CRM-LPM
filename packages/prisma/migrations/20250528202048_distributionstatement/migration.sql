-- CreateTable
CREATE TABLE "Territories" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "avatarImageId" TEXT,
    "disabled" BOOLEAN DEFAULT false,
    "userId" INTEGER,
    "teamId" INTEGER,

    CONSTRAINT "Territories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DistributionStatementTerritories" (
    "id" SERIAL NOT NULL,
    "territoryId" INTEGER NOT NULL,
    "artistName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER,
    "teamId" INTEGER,

    CONSTRAINT "DistributionStatementTerritories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DistributionStatementMusicPlatforms" (
    "id" SERIAL NOT NULL,
    "platformId" INTEGER NOT NULL,
    "artistName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER,
    "teamId" INTEGER,

    CONSTRAINT "DistributionStatementMusicPlatforms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MusicPlatforms" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "avatarImageId" TEXT,
    "disabled" BOOLEAN DEFAULT false,
    "url" TEXT,
    "userId" INTEGER,
    "teamId" INTEGER,

    CONSTRAINT "MusicPlatforms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_DistributionStatementToDistributionStatementMusicPlatforms" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_DistributionStatementToDistributionStatementTerritories" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Territories_name_key" ON "Territories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "MusicPlatforms_name_key" ON "MusicPlatforms"("name");

-- CreateIndex
CREATE UNIQUE INDEX "MusicPlatforms_url_key" ON "MusicPlatforms"("url");

-- CreateIndex
CREATE UNIQUE INDEX "_DistributionStatementToDistributionStatementMusicPla_AB_unique" ON "_DistributionStatementToDistributionStatementMusicPlatforms"("A", "B");

-- CreateIndex
CREATE INDEX "_DistributionStatementToDistributionStatementMusicPlatf_B_index" ON "_DistributionStatementToDistributionStatementMusicPlatforms"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_DistributionStatementToDistributionStatementTerritor_AB_unique" ON "_DistributionStatementToDistributionStatementTerritories"("A", "B");

-- CreateIndex
CREATE INDEX "_DistributionStatementToDistributionStatementTerritorie_B_index" ON "_DistributionStatementToDistributionStatementTerritories"("B");

-- AddForeignKey
ALTER TABLE "Territories" ADD CONSTRAINT "Territories_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Territories" ADD CONSTRAINT "Territories_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DistributionStatementTerritories" ADD CONSTRAINT "DistributionStatementTerritories_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DistributionStatementTerritories" ADD CONSTRAINT "DistributionStatementTerritories_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DistributionStatementTerritories" ADD CONSTRAINT "DistributionStatementTerritories_territoryId_fkey" FOREIGN KEY ("territoryId") REFERENCES "Territories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DistributionStatementMusicPlatforms" ADD CONSTRAINT "DistributionStatementMusicPlatforms_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DistributionStatementMusicPlatforms" ADD CONSTRAINT "DistributionStatementMusicPlatforms_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DistributionStatementMusicPlatforms" ADD CONSTRAINT "DistributionStatementMusicPlatforms_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "MusicPlatforms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MusicPlatforms" ADD CONSTRAINT "MusicPlatforms_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MusicPlatforms" ADD CONSTRAINT "MusicPlatforms_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DistributionStatementToDistributionStatementMusicPlatforms" ADD CONSTRAINT "_DistributionStatementToDistributionStatementMusicPlatfo_A_fkey" FOREIGN KEY ("A") REFERENCES "DistributionStatement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DistributionStatementToDistributionStatementMusicPlatforms" ADD CONSTRAINT "_DistributionStatementToDistributionStatementMusicPlatfo_B_fkey" FOREIGN KEY ("B") REFERENCES "DistributionStatementMusicPlatforms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DistributionStatementToDistributionStatementTerritories" ADD CONSTRAINT "_DistributionStatementToDistributionStatementTerritories_A_fkey" FOREIGN KEY ("A") REFERENCES "DistributionStatement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DistributionStatementToDistributionStatementTerritories" ADD CONSTRAINT "_DistributionStatementToDistributionStatementTerritories_B_fkey" FOREIGN KEY ("B") REFERENCES "DistributionStatementTerritories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
