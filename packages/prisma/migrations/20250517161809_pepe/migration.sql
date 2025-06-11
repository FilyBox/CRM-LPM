/*
  Warnings:

  - The values [Ep] on the enum `TypeOfRelease` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TypeOfRelease_new" AS ENUM ('Sencillo', 'Album', 'EP');
ALTER TABLE "Releases" ALTER COLUMN "typeOfRelease" TYPE "TypeOfRelease_new" USING ("typeOfRelease"::text::"TypeOfRelease_new");
ALTER TYPE "TypeOfRelease" RENAME TO "TypeOfRelease_old";
ALTER TYPE "TypeOfRelease_new" RENAME TO "TypeOfRelease";
DROP TYPE "TypeOfRelease_old";
COMMIT;
