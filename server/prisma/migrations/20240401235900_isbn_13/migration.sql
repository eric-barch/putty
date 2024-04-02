/*
  Warnings:

  - You are about to drop the column `isbn` on the `Book` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[isbn_10]` on the table `Book` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[isbn_13]` on the table `Book` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `isbn_10` to the `Book` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isbn_13` to the `Book` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Book_isbn_key";

-- AlterTable
ALTER TABLE "Book" DROP COLUMN "isbn",
ADD COLUMN     "isbn_10" TEXT NOT NULL,
ADD COLUMN     "isbn_13" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Book_isbn_10_key" ON "Book"("isbn_10");

-- CreateIndex
CREATE UNIQUE INDEX "Book_isbn_13_key" ON "Book"("isbn_13");
