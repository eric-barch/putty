import { Book, PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { sendBookEvent } from "../events";
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

const getAllDbBooks = async (request: Request, response: Response) => {
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
    response.status(500).json({ error: "Failed to get all database books." });
  }
};

const postBook = async (request: Request, response: Response) => {
  const { isbn } = request.params;

  try {
    const data = await searchApis(isbn);

    if (!data) throw new Error("data is undefined");

    const book = await prisma.book.create({ data });
    response.status(201).json(book);
    sendBookEvent({ action: "post", isbn });
  } catch (error) {
    response
      .status(500)
      .json({ message: `Failed to post book with ISBN ${isbn}` });
  }
};

const getBook = async (request: Request, response: Response) => {
  const { query } = request.params;

  try {
    const details = await searchDb(query);
    response.status(200).json({ source: "db", details });
  } catch (error) {
    try {
      const details = await searchApis(query);
      response.status(200).json({ source: "apis", details });
    } catch {
      response
        .status(500)
        .json({ message: `Failed to get book with ISBN ${query}` });
    }
  }
};

const putBook = async (request: Request, response: Response) => {
  const { isbn } = request.params;
  const data = request.body;

  try {
    let book: Book | undefined;

    if (isbn.length === 10) {
      book = await prisma.book.update({
        where: {
          isbn10: isbn,
        },
        data,
      });
    } else if (isbn.length === 13) {
      book = await prisma.book.update({
        where: {
          isbn13: isbn,
        },
        data,
      });
    }

    response.status(200).json(book);
    sendBookEvent({ action: "put", isbn });
  } catch {
    response.status(500).json({
      message: `Failed to put book with ISBN ${isbn}.`,
    });
  }
};

const deleteBook = async (request: Request, response: Response) => {
  const { isbn } = request.params;

  try {
    if (isbn.length === 10) {
      await prisma.book.delete({
        where: {
          isbn10: isbn,
        },
      });
    } else if (isbn.length === 13) {
      await prisma.book.delete({
        where: {
          isbn13: isbn,
        },
      });
    }

    response.status(200).json({ message: `Deleted book with ISBN ${isbn}.` });
    sendBookEvent({ action: "delete", isbn });
  } catch (error) {
    response
      .status(500)
      .json({ message: `Failed to delete book with ISBN ${isbn}.` });
  }
};

export { getAllDbBooks, getBook, postBook, deleteBook, putBook };
