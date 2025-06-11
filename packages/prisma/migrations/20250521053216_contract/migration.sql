-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('VIGENTE', 'FINALIZADO', 'NO_ESPECIFICADO');

-- CreateEnum
CREATE TYPE "ExpansionPossibility" AS ENUM ('SI', 'NO', 'NO_ESPECIFICADO');

-- CreateTable
CREATE TABLE "Contracts" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "artists" TEXT NOT NULL,
    "startDate" TEXT NOT NULL,
    "endDate" TEXT NOT NULL,
    "isPossibleToExpand" "ExpansionPossibility" NOT NULL DEFAULT 'NO_ESPECIFICADO',
    "possibleExtensionTime" TEXT,
    "status" "ContractStatus" NOT NULL DEFAULT 'NO_ESPECIFICADO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER,
    "teamId" INTEGER,

    CONSTRAINT "Contracts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Contracts" ADD CONSTRAINT "Contracts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contracts" ADD CONSTRAINT "Contracts_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;
