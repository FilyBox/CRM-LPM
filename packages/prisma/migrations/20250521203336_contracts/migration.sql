-- CreateEnum
CREATE TYPE "RetentionAndCollectionPeriod" AS ENUM ('SI', 'NO', 'NO_ESPECIFICADO');

-- CreateEnum
CREATE TYPE "ContractType" AS ENUM ('ARRENDAMIENTOS', 'ALQUILERES', 'VEHICULOS', 'SERVICIOS', 'ARTISTAS');

-- AlterTable
ALTER TABLE "Contracts" ADD COLUMN     "collectionPeriod" "RetentionAndCollectionPeriod",
ADD COLUMN     "collectionPeriodDescription" TEXT,
ADD COLUMN     "collectionPeriodDuration" TEXT,
ADD COLUMN     "contractType" "ContractType",
ADD COLUMN     "folderId" TEXT,
ADD COLUMN     "retentionPeriod" "RetentionAndCollectionPeriod",
ADD COLUMN     "retentionPeriodDescription" TEXT,
ADD COLUMN     "retentionPeriodDuration" TEXT,
ALTER COLUMN "artists" DROP NOT NULL,
ALTER COLUMN "startDate" DROP NOT NULL,
ALTER COLUMN "endDate" DROP NOT NULL,
ALTER COLUMN "status" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Contracts_folderId_idx" ON "Contracts"("folderId");

-- AddForeignKey
ALTER TABLE "Contracts" ADD CONSTRAINT "Contracts_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
