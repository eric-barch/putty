/*
  Warnings:

  - You are about to drop the column `isbn_10` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `isbn_13` on the `Book` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[isbn]` on the table `Book` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `isbn` to the `Book` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Book_isbn_10_key";

-- DropIndex
DROP INDEX "Book_isbn_13_key";

-- AlterTable
ALTER TABLE "Book" DROP COLUMN "isbn_10",
DROP COLUMN "isbn_13",
ADD COLUMN     "isbn" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Book_isbn_key" ON "Book"("isbn");
