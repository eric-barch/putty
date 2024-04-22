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
  const isIsbn = /^[0-9X]{10}([0-9X]{3})?$/.test(query);

  const googleBook = await searchGoogleBooks(query, isIsbn);

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
  const thumbnail = googleBook.thumbnail;
  const isbn10 =
    isIsbn && query.length === 10 ? query : googleBook.isbn10 || olBook?.isbn10;
  const isbn13 =
    isIsbn && query.length === 13 ? query : googleBook.isbn13 || olBook?.isbn13;
  const googleId = googleBook.googleId;
  const lccn = lcBook?.lccn;
  const openLibraryKey = olBook?.openLibraryKey;
  const lc = lcBook?.lc || olBook?.lc;
  const dewey = lcBook?.dewey || olBook?.dewey;

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
    lcClass: lc?.class,
    lcTopic: lc?.topic,
    lcSubjectCutter: lc?.subjectCutter,
    lcAuthorCutter: lc?.authorCutter,
    lcYear: lc?.year,
    dewey,
    checkedIn: false,
  };
};

export { searchDb, searchApis };
