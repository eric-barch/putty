import { GoogleBook, OpenLibraryBook } from "./types";

const queryOpenLibrary = async (
  url: string,
): Promise<OpenLibraryBook | undefined> => {
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
  const lc = book.lc_classifications?.[0];
  const dewey = book.dewey_decimal_class?.[0];

  const result = {
    title,
    subtitle,
    description,
    publishDate,
    isbn10,
    isbn13,
    openLibraryKey,
    lccn,
    lc,
    dewey,
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

  const olBook = {
    openLibraryKey: isbn13Book?.openLibraryKey || isbn10Book?.openLibraryKey,
    title: isbn13Book?.title || isbn10Book?.title,
    subtitle: isbn13Book?.subtitle || isbn10Book?.subtitle,
    description: isbn13Book?.description || isbn10Book?.description,
    publishDate: isbn13Book?.publishDate || isbn10Book?.publishDate,
    isbn10: isbn13Book?.isbn10 || isbn10Book?.isbn10,
    isbn13: isbn13Book?.isbn13 || isbn10Book?.isbn13,
    lccn: isbn13Book?.lccn || isbn10Book?.lccn,
    lc: isbn13Book?.lc || isbn10Book?.lc,
    dewey: isbn13Book?.dewey || isbn10Book?.dewey,
  };

  const allUndefined = Object.values(olBook).every(
    (value) => !value || (Array.isArray(value) && value.length === 0),
  );

  return allUndefined ? undefined : olBook;
};

export { searchOpenLibrary };
