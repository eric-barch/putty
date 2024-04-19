import { GoogleBook } from "./book.types";

const searchGoogleBooks = async (
  query: string,
): Promise<GoogleBook | undefined> => {
  const url = `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=1`;

  console.log("googleUrl", url);

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
  const isbn10 = bookInfo.industryIdentifiers.find(
    (id: any) => id.type === "ISBN_10",
  )?.identifier;
  const isbn13 = bookInfo.industryIdentifiers.find(
    (id: any) => id.type === "ISBN_13",
  )?.identifier;
  const thumbnailLink = bookInfo.imageLinks?.thumbnail;

  const result = {
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

  const allUndefined = Object.values(result).every(
    (value) => !value || (Array.isArray(value) && value.length === 0),
  );

  const googleBook = allUndefined ? undefined : result;

  console.log("googleBook", googleBook);

  return googleBook;
};

export { searchGoogleBooks };