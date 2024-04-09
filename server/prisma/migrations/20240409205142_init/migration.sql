-- CreateTable
CREATE TABLE "Book" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "authors" TEXT NOT NULL,
    "publishedDate" TIMESTAMP(3),
    "description" TEXT,
    "thumbnail" TEXT,
    "scannedIsbn" TEXT NOT NULL,
    "isbn10" TEXT,
    "isbn13" TEXT,
    "amazonId" TEXT,
    "googleId" TEXT,
    "lcId" TEXT,
    "oclcId" TEXT,
    "openLibraryId" TEXT,
    "deweyClassification" TEXT,
    "lcClassification" TEXT,
    "isCheckedIn" BOOLEAN NOT NULL,

    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Book_scannedIsbn_key" ON "Book"("scannedIsbn");

-- CreateIndex
CREATE UNIQUE INDEX "Book_isbn10_key" ON "Book"("isbn10");

-- CreateIndex
CREATE UNIQUE INDEX "Book_isbn13_key" ON "Book"("isbn13");

-- CreateIndex
CREATE UNIQUE INDEX "Book_amazonId_key" ON "Book"("amazonId");

-- CreateIndex
CREATE UNIQUE INDEX "Book_googleId_key" ON "Book"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "Book_lcId_key" ON "Book"("lcId");

-- CreateIndex
CREATE UNIQUE INDEX "Book_oclcId_key" ON "Book"("oclcId");

-- CreateIndex
CREATE UNIQUE INDEX "Book_openLibraryId_key" ON "Book"("openLibraryId");
