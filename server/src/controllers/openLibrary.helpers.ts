import { GoogleBook, OpenLibraryBook } from "./book.types";

const queryOpenLibrary = async (
  url: string,
): Promise<OpenLibraryBook | undefined> => {
  console.log("olUrl", url);

  const response = await fetch(url);

  if (!response.ok) return undefined;

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

  const result = {
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

  const allUndefined = Object.values(result).every(
    (value) => !value || (Array.isArray(value) && value.length === 0),
  );

  return allUndefined ? undefined : result;
};

const searchOpenLibrary = async (
  googleBook: GoogleBook,
): Promise<OpenLibraryBook | undefined> => {
  const isbn13Url = `https://openlibrary.org/isbn/${googleBook.isbn13}.json`;
  const isbn10Url = `https://openlibrary.org/isbn/${googleBook.isbn10}.json`;

  const [isbn13Book, isbn10Book] = await Promise.all([
    queryOpenLibrary(isbn13Url),
    queryOpenLibrary(isbn10Url),
  ]);

  const olBook = isbn13Book || isbn10Book;

  console.log("olBook", olBook);

  return olBook;
};

export { searchOpenLibrary };
