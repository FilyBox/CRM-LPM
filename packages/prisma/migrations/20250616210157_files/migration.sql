-- CreateTable
CREATE TABLE "FilesShareLink" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "fileId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FilesShareLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Files" (
    "id" SERIAL NOT NULL,
    "qrToken" TEXT,
    "userId" INTEGER NOT NULL,
    "visibility" "DocumentVisibility" NOT NULL DEFAULT 'EVERYONE',
    "title" TEXT NOT NULL,
    "status" "DocumentStatus" NOT NULL DEFAULT 'DRAFT',
    "fileDataId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "teamId" INTEGER,
    "useToChat" BOOLEAN NOT NULL DEFAULT false,
    "folderId" TEXT,

    CONSTRAINT "Files_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FilesShareLink_slug_key" ON "FilesShareLink"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "FilesShareLink_fileId_email_key" ON "FilesShareLink"("fileId", "email");

-- CreateIndex
CREATE INDEX "Files_userId_idx" ON "Files"("userId");

-- CreateIndex
CREATE INDEX "Files_status_idx" ON "Files"("status");

-- CreateIndex
CREATE INDEX "Files_folderId_idx" ON "Files"("folderId");

-- CreateIndex
CREATE UNIQUE INDEX "Files_fileDataId_key" ON "Files"("fileDataId");

-- AddForeignKey
ALTER TABLE "FilesShareLink" ADD CONSTRAINT "FilesShareLink_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "Files"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Files" ADD CONSTRAINT "Files_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Files" ADD CONSTRAINT "Files_fileDataId_fkey" FOREIGN KEY ("fileDataId") REFERENCES "DocumentData"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Files" ADD CONSTRAINT "Files_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Files" ADD CONSTRAINT "Files_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
