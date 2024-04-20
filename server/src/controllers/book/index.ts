import { Book, PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { searchLibraryOfCongress } from "./libraryOfCongress.helpers";
import { searchGoogleBooks } from "./googleBooks.helpers";
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

const getAllBooks = async (request: Request, response: Response) => {
  try {
    const books = await prisma.book.findMany({
      orderBy: [
        { lcClass: "asc" },
        { lcTopic: "asc" },
        { lcSubjectCutter: "asc" },
        { lcAuthorCutter: "asc" },
      ],
    });

    response.status(200).json(books);
  } catch (error) {
    response.status(500).json({ error: "Failed to get all books." });
  }
};

const postBook = async (request: Request, response: Response) => {
  const requestBook = request.body;

  try {
    const responseBook = await prisma.book.create({ data: requestBook });
    response.status(201).json(responseBook);
  } catch {
    response.status(500).json({ message: `Failed to post book.`, requestBook });
  }
};

const getBook = async (request: Request, response: Response) => {
  const { query } = request.params;

  try {
    const book = await searchDb(query);
    response.status(200).json({ source: "db", book });
  } catch (error) {
    try {
      const book = await searchApis(query);
      response.status(200).json({ source: "apis", book });
    } catch {
      response
        .status(500)
        .json({ message: `Failed to get book with ISBN ${query}` });
    }
  }
};

const putBook = async (request: Request, response: Response) => {
  const { isbn } = request.params;
  const requestBook = request.body;

  try {
    const responseBook = await prisma.book
      .findFirst({
        where: {
          OR: [{ isbn13: isbn }, { isbn10: isbn }],
        },
      })
      .then(
        (book) =>
          book &&
          prisma.book.update({
            where: { id: book.id },
            data: requestBook,
          }),
      );

    response.status(200).json(responseBook);
  } catch {
    response.status(500).json({
      message: `Failed to put book.`,
      requestBook,
    });
  }
};

const deleteBook = async (request: Request, response: Response) => {
  const { isbn } = request.params;

  try {
    const responseBook = await prisma.book
      .findFirst({
        where: {
          OR: [{ isbn13: isbn }, { isbn10: isbn }],
        },
      })
      .then(
        (book) =>
          book &&
          prisma.book.delete({
            where: { id: book.id },
          }),
      );

    response.status(200).json(responseBook);
  } catch (error) {
    response.status(500).json({ message: `Failed to delete book.`, isbn });
  }
};

export { getAllBooks, getBook, postBook, deleteBook, putBook };
