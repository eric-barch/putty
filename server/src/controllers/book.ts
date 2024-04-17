import { Book, PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { sendBookEvent } from "./events";
import * as cheerio from "cheerio";
import { GoogleBook, LcBook, OpenLibraryBook } from "./book.types";

const prisma = new PrismaClient();

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

const getBook = async (request: Request, response: Response) => {
  const { isbn } = request.params;

  try {
    const book = await getBookFromDb(isbn);
    response.status(200).json({ source: "db", book });
  } catch (error) {
    try {
      const book = await getBookFromApis(isbn);
      response.status(200).json({ source: "apis", book });
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
      OR: [{ scannedIsbn: isbn }, { isbn10: isbn }, { isbn13: isbn }],
    },
  });
};

const getBookFromGoogle = async (isbn: string): Promise<GoogleBook> => {
  const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`;
  const response = await fetch(url);
  const data = await response.json();
  const book = data.items[0];
  const bookInfo = book.volumeInfo;

  const googleId = book.id;
  const title = bookInfo.title;
  const subtitle = bookInfo.subtitle;
  const authors = bookInfo.authors?.join(", ");
  const description = bookInfo.description;
  const publishDate = new Date(bookInfo.publishedDate);
  const isbn10 = bookInfo.industryIdentifiers.find(
    (id: any) => id.type === "ISBN_10",
  )?.identifier;
  const isbn13 = bookInfo.industryIdentifiers.find(
    (id: any) => id.type === "ISBN_13",
  )?.identifier;
  const thumbnailLink = bookInfo.imageLinks?.thumbnail;

  return {
    title,
    subtitle,
    authors,
    description,
    publishDate,
    isbn10,
    isbn13,
    googleId,
    thumbnailLink,
  };
};

const getBookFromOl = async (isbn: string): Promise<OpenLibraryBook> => {
  const url = `https://openlibrary.org/isbn/${isbn}.json`;
  const response = await fetch(url);
  const book = await response.json();

  const title = book.title;
  const subtitle = book.subtitle;
  const description = book.description?.value;
  const publishDate = new Date(book.publish_date);
  const isbn10 = book.isbn_10?.[0];
  const isbn13 = book.isbn_13?.[0];
  const openLibraryKey = book.key;
  const lccn = book.lccn?.[0];
  const lcClassification = book.lc_classifications?.[0];
  const deweyClassification = book.dewey_decimal_class?.[0];

  return {
    title,
    subtitle,
    description,
    publishDate,
    isbn10,
    isbn13,
    openLibraryKey,
    lccn,
    lcClassification,
    deweyClassification,
  };
};

const getBookFromLc = async (isbn: string): Promise<LcBook> => {
  const url = `http://lx2.loc.gov:210/lcdb?version=1.1&operation=searchRetrieve&query=bath.isbn="${isbn}"&startRecord=1&maximumRecords=1&recordSchema=mods`;
  const response = await fetch(url);
  const data = await response.text();

  const $ = cheerio.load(data);

  const lccn = $('identifier[type="lccn"]').text() || undefined;
  const title = $("title").text() || undefined;
  const subtitle = $("subtitle").text() || undefined;
  const authors =
    $('name[type="personal"][usage="primary"]')
      .map((i, el) => {
        return $(el).find("namePart").text();
      })
      .get()
      .join(", ") || undefined;
  const publishDate = $('dateIssued[encoding="marc"]')
    ? new Date($('dateIssued[encoding="marc"]').text())
    : undefined;
  const lcClassification =
    $('classification[authority="lcc"]').text() || undefined;
  const deweyClassification =
    $('classification[authority="ddc"]').text() || undefined;

  return {
    lccn,
    title,
    subtitle,
    authors,
    publishDate,
    lcClassification,
    deweyClassification,
  };
};

/**TODO: Horrible. */
const parseLcClassification = (lcClassification: string | undefined) => {
  const result: {
    lcClass: string | undefined;
    lcTopic: number | undefined;
    lcSubjectCutter: string | undefined;
    lcAuthorCutter: string | undefined;
    lcYear: number | undefined;
  } = {
    lcClass: undefined,
    lcTopic: undefined,
    lcSubjectCutter: undefined,
    lcAuthorCutter: undefined,
    lcYear: undefined,
  };

  if (!lcClassification) return result;

  const patterns = {
    lcClass: /^\s*[A-Z]+/i,
    lcTopic: /\d+(\.\d+)?/,
    subjectCutter: /^\s*\.?[A-Z]\d+/i,
    authorCutter: /^\s*\.?[A-Z]\d+/i,
    lcYear: /\d{4}/,
  };

  const extractComponent = (pattern: RegExp, remaining: string) => {
    const match = remaining.match(pattern);
    return match ? match[0] : undefined;
  };

  let remaining = lcClassification;

  const lcClass = extractComponent(patterns.lcClass, remaining);
  result.lcClass = lcClass;
  remaining = lcClass ? remaining.slice(lcClass.length).trim() : remaining;

  const lcTopic = extractComponent(patterns.lcTopic, remaining);
  result.lcTopic = Number(lcTopic);
  remaining = lcTopic ? remaining.slice(lcTopic.length).trim() : remaining;

  const lcSubjectCutter = extractComponent(patterns.subjectCutter, remaining);
  result.lcSubjectCutter = lcSubjectCutter;
  remaining = lcSubjectCutter
    ? remaining.slice(lcSubjectCutter.length).trim()
    : remaining;

  const lcAuthorCutter = extractComponent(patterns.authorCutter, remaining);
  result.lcAuthorCutter = lcAuthorCutter;
  remaining = lcAuthorCutter
    ? remaining.slice(lcAuthorCutter.length).trim()
    : remaining;

  const lcYear = extractComponent(patterns.lcYear, remaining);
  result.lcYear = Number(lcYear);

  return result;
};

const getBookFromApis = async (isbn: string) => {
  const [googleBook, lcBook, olBook] = await Promise.all([
    getBookFromGoogle(isbn),
    getBookFromLc(isbn),
    getBookFromOl(isbn),
  ]);

  const title = googleBook.title || lcBook.title || olBook.title;
  const subtitle = googleBook.subtitle || lcBook.subtitle || olBook.subtitle;
  const authors = googleBook.authors || lcBook.authors;
  const publishDate =
    googleBook.publishDate || lcBook.publishDate || olBook.publishDate;
  const description = googleBook.description;
  const thumbnail = googleBook.thumbnailLink;
  const isbn10 = googleBook.isbn10 || olBook.isbn10;
  const isbn13 = googleBook.isbn13 || olBook.isbn13;
  const googleId = googleBook.googleId;
  const lccn = lcBook.lccn;
  const openLibraryKey = olBook.openLibraryKey;
  const lcClassification = lcBook.lcClassification || olBook.lcClassification;
  const deweyClassification =
    lcBook.deweyClassification || olBook.deweyClassification;

  if (!title) throw new Error("title is required.");
  if (!authors) throw new Error("authors is required.");

  const { lcClass, lcTopic, lcSubjectCutter, lcAuthorCutter } =
    parseLcClassification(lcClassification);

  return {
    title,
    subtitle,
    authors,
    publishDate,
    description,
    thumbnail,
    scannedIsbn: isbn,
    isbn10,
    isbn13,
    googleId,
    lcId: lccn,
    openLibraryKey,
    lcClass,
    lcTopic,
    lcSubjectCutter,
    lcAuthorCutter,
    deweyClassification,
    isCheckedIn: false,
  };
};

const postBook = async (request: Request, response: Response) => {
  const { isbn } = request.params;

  console.log("post request");

  try {
    const book = await getBookFromApis(isbn);
    response.status(201).json(book);
    sendBookEvent({ isbn });
  } catch (error) {
    console.log(error);
    response
      .status(500)
      .json({ message: `Failed to add book with ISBN ${isbn}` });
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

export { postBook, deleteBook, getAllBooks, getBook, putBook };
