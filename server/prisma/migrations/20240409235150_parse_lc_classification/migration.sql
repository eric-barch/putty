/*
  Warnings:

  - You are about to drop the column `lcClassification` on the `Book` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Book" DROP COLUMN "lcClassification",
ADD COLUMN     "lcAuthorCutter" TEXT,
ADD COLUMN     "lcClass" TEXT,
ADD COLUMN     "lcSubjectCutter" TEXT,
ADD COLUMN     "lcTopic" DOUBLE PRECISION;
