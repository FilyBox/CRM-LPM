/*
  Warnings:

  - A unique constraint covering the columns `[documentId]` on the table `Contracts` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `documentId` to the `Contracts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Contracts" ADD COLUMN     "documentId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Contracts_documentId_key" ON "Contracts"("documentId");
