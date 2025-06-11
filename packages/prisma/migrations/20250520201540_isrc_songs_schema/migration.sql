-- AlterTable
ALTER TABLE "IsrcSongs" ADD COLUMN     "teamId" INTEGER,
ADD COLUMN     "userId" INTEGER;

-- AddForeignKey
ALTER TABLE "IsrcSongs" ADD CONSTRAINT "IsrcSongs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IsrcSongs" ADD CONSTRAINT "IsrcSongs_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;
