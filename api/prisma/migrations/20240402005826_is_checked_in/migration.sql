/*
  Warnings:

  - Added the required column `isCheckedIn` to the `Book` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "dewey" TEXT,
ADD COLUMN     "isCheckedIn" BOOLEAN NOT NULL,
ALTER COLUMN "title" SET DATA TYPE TEXT,
ALTER COLUMN "subtitle" SET DATA TYPE TEXT;
