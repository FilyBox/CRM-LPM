-- CreateTable
CREATE TABLE "Releases" (
    "id" SERIAL NOT NULL,
    "date" TEXT,
    "artist" TEXT,
    "lanzamiento" TEXT,
    "typeOfRelease" TEXT,
    "release" TEXT,
    "uploaded" TEXT,
    "streamingLink" TEXT,
    "assets" TEXT,
    "canvas" BOOLEAN,
    "cover" BOOLEAN,
    "audioWAV" BOOLEAN,
    "video" BOOLEAN,
    "banners" BOOLEAN,
    "pitch" BOOLEAN,
    "EPKUpdates" BOOLEAN,
    "WebSiteUpdates" BOOLEAN,
    "Biography" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Releases_pkey" PRIMARY KEY ("id")
);
