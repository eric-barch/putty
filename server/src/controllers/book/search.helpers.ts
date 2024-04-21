import { Book, PrismaClient } from "@prisma/client";
import { searchGoogleBooks } from "./googleBooks.helpers";
import { searchLibraryOfCongress } from "./libraryOfCongress.helpers";
import { searchOpenLibrary } from "./openLibrary.helpers";

const prisma = new PrismaClient();

const searchDb = async (isbn: string): Promise<Book> => {
  return await prisma.book.findFirstOrThrow({
    where: {
      OR: [{ isbn13: isbn }, { isbn10: isbn }],
    },
  });
};

const searchApis = async (query: string) => {
  const googleBook = await searchGoogleBooks(query);

  if (!googleBook) return undefined;

  const [lcBook, olBook] = await Promise.all([
    searchLibraryOfCongress(googleBook),
    searchOpenLibrary(googleBook),
  ]);

  const title = googleBook.title || lcBook?.title || olBook?.title;
  const subtitle = googleBook.subtitle || lcBook?.subtitle || olBook?.subtitle;
  const authors = googleBook.authors || lcBook?.authors;
  const publishDate =
    googleBook.publishDate || lcBook?.publishDate || olBook?.publishDate;
  const description = googleBook.description;
  const thumbnail = googleBook.thumbnailLink;
  const isbn10 = googleBook.isbn10 || olBook?.isbn10;
  const isbn13 = googleBook.isbn13 || olBook?.isbn13;
  const googleId = googleBook.googleId;
  const lccn = lcBook?.lccn;
  const openLibraryKey = olBook?.openLibraryKey;
  const lcClassification = lcBook?.lcClassification || olBook?.lcClassification;
  const deweyClassification =
    lcBook?.deweyClassification || olBook?.deweyClassification;

  if (!title) throw new Error("title is required.");
  if (!authors) throw new Error("authors is required.");

  return {
    title,
    subtitle,
    authors: authors.join(", "),
    publishDate,
    description,
    thumbnail,
    isbn10,
    isbn13,
    googleId,
    lccn,
    openLibraryKey,
    lcClass: lcClassification?.class,
    lcTopic: lcClassification?.topic,
    lcSubjectCutter: lcClassification?.subjectCutter,
    lcAuthorCutter: lcClassification?.authorCutter,
    lcYear: lcClassification?.year,
    deweyClassification,
    isCheckedIn: false,
  };
};

export { searchDb, searchApis };
