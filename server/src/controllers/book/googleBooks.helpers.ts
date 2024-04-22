import { GoogleBook } from "./types";

const searchGoogleBooks = async (
  query: string,
  isIsbn: boolean,
): Promise<GoogleBook | undefined> => {
  const urlQuery = isIsbn ? `isbn:${query}` : query;
  const url = `https://www.googleapis.com/books/v1/volumes?q=${urlQuery}&maxResults=1`;

  const response = await fetch(url);

  if (!response.ok) return undefined;

  const data = await response.json();
  const book = data.items[0];
  const bookInfo = book.volumeInfo;

  const googleId = book.id;
  const title = bookInfo.title
    .replace(/\s*\(.*?\)\s*/g, "")
    .replace(/:.*$/, "")
    .trim();
  const subtitle = bookInfo.subtitle;
  const authors = bookInfo.authors;
  const description = bookInfo.description;
  const publishDate = new Date(bookInfo.publishedDate);
  const isbn10 = bookInfo.industryIdentifiers?.find(
    (id: any) => id.type === "ISBN_10",
  )?.identifier;
  const isbn13 = bookInfo.industryIdentifiers?.find(
    (id: any) => id.type === "ISBN_13",
  )?.identifier;
  const thumbnail = bookInfo.imageLinks?.thumbnail;

  const result = {
    title,
    subtitle,
    authors,
    description,
    publishDate,
    isbn10,
    isbn13,
    googleId,
    thumbnail,
  };

  const allUndefined = Object.values(result).every(
    (value) => !value || (Array.isArray(value) && value.length === 0),
  );

  const googleBook = allUndefined ? undefined : result;

  return googleBook;
};

export { searchGoogleBooks };
