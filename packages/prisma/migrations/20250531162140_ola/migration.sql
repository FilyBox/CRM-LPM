/*
  Warnings:

  - Made the column `productId` on table `lpm` required. This step will fail if there are existing NULL values in that column.
  - Made the column `Product Type` on table `lpm` required. This step will fail if there are existing NULL values in that column.
  - Made the column `Product Title` on table `lpm` required. This step will fail if there are existing NULL values in that column.
  - Made the column `Product Display Artist` on table `lpm` required. This step will fail if there are existing NULL values in that column.
  - Made the column `label` on table `lpm` required. This step will fail if there are existing NULL values in that column.
  - Made the column `UPC` on table `lpm` required. This step will fail if there are existing NULL values in that column.
  - Made the column `Catalog ` on table `lpm` required. This step will fail if there are existing NULL values in that column.
  - Made the column `Product Genre` on table `lpm` required. This step will fail if there are existing NULL values in that column.
  - Made the column `Submission Status` on table `lpm` required. This step will fail if there are existing NULL values in that column.
  - Made the column `Product C Line` on table `lpm` required. This step will fail if there are existing NULL values in that column.
  - Made the column `Product P Line` on table `lpm` required. This step will fail if there are existing NULL values in that column.
  - Made the column `ExplicitLyrics` on table `lpm` required. This step will fail if there are existing NULL values in that column.
  - Made the column `Primary Metadata Language` on table `lpm` required. This step will fail if there are existing NULL values in that column.
  - Made the column `Created By` on table `lpm` required. This step will fail if there are existing NULL values in that column.
  - Made the column `TrackType` on table `lpm` required. This step will fail if there are existing NULL values in that column.
  - Made the column `Track Id` on table `lpm` required. This step will fail if there are existing NULL values in that column.
  - Made the column `Track Number` on table `lpm` required. This step will fail if there are existing NULL values in that column.
  - Made the column `Track Name` on table `lpm` required. This step will fail if there are existing NULL values in that column.
  - Made the column `Track Display Artist` on table `lpm` required. This step will fail if there are existing NULL values in that column.
  - Made the column `Isrc` on table `lpm` required. This step will fail if there are existing NULL values in that column.
  - Made the column `Track Genre` on table `lpm` required. This step will fail if there are existing NULL values in that column.
  - Made the column `Audio Language` on table `lpm` required. This step will fail if there are existing NULL values in that column.
  - Made the column `Track C Line` on table `lpm` required. This step will fail if there are existing NULL values in that column.
  - Made the column `Track P Line` on table `lpm` required. This step will fail if there are existing NULL values in that column.
  - Made the column `WritersComposers` on table `lpm` required. This step will fail if there are existing NULL values in that column.
  - Made the column `PublishersCollection Societies` on table `lpm` required. This step will fail if there are existing NULL values in that column.
  - Made the column `Withhold Mechanicals` on table `lpm` required. This step will fail if there are existing NULL values in that column.
  - Made the column `Duration` on table `lpm` required. This step will fail if there are existing NULL values in that column.
  - Made the column `Explicit Lyrics` on table `lpm` required. This step will fail if there are existing NULL values in that column.
  - Made the column `Album Only` on table `lpm` required. This step will fail if there are existing NULL values in that column.
  - Made the column `Release Date` on table `lpm` required. This step will fail if there are existing NULL values in that column.
  - Made the column `Last Process Date` on table `lpm` required. This step will fail if there are existing NULL values in that column.
  - Made the column `Import Date` on table `lpm` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "lpm" ALTER COLUMN "productId" SET NOT NULL,
ALTER COLUMN "Product Type" SET NOT NULL,
ALTER COLUMN "Product Title" SET NOT NULL,
ALTER COLUMN "Product Display Artist" SET NOT NULL,
ALTER COLUMN "label" SET NOT NULL,
ALTER COLUMN "UPC" SET NOT NULL,
ALTER COLUMN "Catalog " SET NOT NULL,
ALTER COLUMN "Product Genre" SET NOT NULL,
ALTER COLUMN "Submission Status" SET NOT NULL,
ALTER COLUMN "Product C Line" SET NOT NULL,
ALTER COLUMN "Product P Line" SET NOT NULL,
ALTER COLUMN "ExplicitLyrics" SET NOT NULL,
ALTER COLUMN "Primary Metadata Language" SET NOT NULL,
ALTER COLUMN "Created By" SET NOT NULL,
ALTER COLUMN "TrackType" SET NOT NULL,
ALTER COLUMN "Track Id" SET NOT NULL,
ALTER COLUMN "Track Number" SET NOT NULL,
ALTER COLUMN "Track Name" SET NOT NULL,
ALTER COLUMN "Track Display Artist" SET NOT NULL,
ALTER COLUMN "Isrc" SET NOT NULL,
ALTER COLUMN "Track Genre" SET NOT NULL,
ALTER COLUMN "Audio Language" SET NOT NULL,
ALTER COLUMN "Track C Line" SET NOT NULL,
ALTER COLUMN "Track P Line" SET NOT NULL,
ALTER COLUMN "WritersComposers" SET NOT NULL,
ALTER COLUMN "PublishersCollection Societies" SET NOT NULL,
ALTER COLUMN "Withhold Mechanicals" SET NOT NULL,
ALTER COLUMN "Duration" SET NOT NULL,
ALTER COLUMN "Explicit Lyrics" SET NOT NULL,
ALTER COLUMN "Album Only" SET NOT NULL,
ALTER COLUMN "Release Date" SET NOT NULL,
ALTER COLUMN "Last Process Date" SET NOT NULL,
ALTER COLUMN "Import Date" SET NOT NULL;
