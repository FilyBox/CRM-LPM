-- DropForeignKey
ALTER TABLE "Artist" DROP CONSTRAINT "Artist_teamId_fkey";

-- AlterTable
ALTER TABLE "Artist" ADD COLUMN     "userId" INTEGER;

-- AddForeignKey
ALTER TABLE "Artist" ADD CONSTRAINT "Artist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Artist" ADD CONSTRAINT "Artist_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;
