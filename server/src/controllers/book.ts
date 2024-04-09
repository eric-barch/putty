import axios from "axios";
import { Book, PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { sendBookEvent } from "./events";

const prisma = new PrismaClient();

const getAllBooks = async (request: Request, response: Response) => {
  try {
    const books = await prisma.book.findMany({
      orderBy: {
        deweyClassification: "asc",
      },
    });

    response.status(200).json(books);
  } catch (error) {
    response.status(500).json({ error: "Failed to get all books." });
  }
};

const getBook = async (request: Request, response: Response) => {
  const { isbn } = request.params;

  try {
    const book = await getBookFromDb(isbn);
    response.status(200).json({ source: "db", book });
  } catch (error) {
    try {
      const book = await getBookFromGoogleBooks(isbn);
      response.status(200).json({ source: "googleBooks", book });
    } catch {
      response
        .status(500)
        .json({ message: `Failed to get book with ISBN ${isbn}` });
    }
  }
};

const getBookFromDb = async (isbn: string) => {
  return await prisma.book.findFirstOrThrow({
    where: {
      OR: [{ isbn10: isbn }, { isbn13: isbn }],
    },
  });
};

const getBookFromGoogleBooks = async (isbn: string) => {
  const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`;
  const response = await axios.get(url);
  return response.data.items[0];
};

const getBookFromOpenLibrary = async (isbn: string) => {
  const url = `https://openlibrary.org/isbn/${isbn}.json`;
  const response = await axios.get(url);
  return response.data;
};

const addBook = async (request: Request, response: Response) => {
  const { isbn } = request.params;

  try {
    const googleBook = await getBookFromGoogleBooks(isbn);
    const openLibraryBook = await getBookFromOpenLibrary(isbn);

    let { title, subtitle, description } = googleBook.volumeInfo;

    const googleId = googleBook.id;
    const authors = googleBook.volumeInfo.authors.join(", ");
    const publishedDate = new Date(googleBook.volumeInfo.publishedDate);
    const thumbnail = googleBook.volumeInfo.imageLinks?.thumbnail;
    const isbn10 = googleBook.volumeInfo.industryIdentifiers.find(
      (industryIdentifier: any) => industryIdentifier.type === "ISBN_10",
    )?.identifier;
    const isbn13 = googleBook.volumeInfo.industryIdentifiers.find(
      (industryIdentifier: any) => industryIdentifier.type === "ISBN_13",
    )?.identifier;

    const amazonId = openLibraryBook.identifiers?.amazon?.[0];
    const lcId = openLibraryBook.lccn?.[0];
    const oclcId = openLibraryBook.oclc_numbers?.[0];
    const openLibraryId = openLibraryBook.key;
    const deweyClassification = openLibraryBook.dewey_decimal_class?.[0];
    const lcClassification = openLibraryBook.lc_classifications?.[0];

    const book = await prisma.book.create({
      data: {
        title,
        subtitle,
        authors,
        publishedDate,
        description,
        thumbnail,
        scannedIsbn: isbn,
        isbn10,
        isbn13,
        amazonId,
        googleId,
        lcId,
        oclcId,
        openLibraryId,
        deweyClassification,
        lcClassification,
        isCheckedIn: true,
      },
    });

    response.status(201).json(book);
    sendBookEvent({ isbn });
  } catch (error) {
    console.log(error);

    response
      .status(500)
      .json({ message: `Failed to add book with ISBN ${isbn}` });
  }
};

const updateBook = async (request: Request, response: Response) => {
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

    sendBookEvent({ isbn });
  } catch {
    response.status(500).json({
      message: `Failed to update book with ISBN ${isbn}.`,
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

    sendBookEvent({ isbn });
  } catch (error) {
    response
      .status(500)
      .json({ message: `Failed to delete book with ISBN ${isbn}.` });
  }
};

export { addBook, deleteBook, getAllBooks, getBook, updateBook };
