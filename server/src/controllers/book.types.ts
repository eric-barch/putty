type GoogleBook = {
  googleId: string | undefined;
  title: string | undefined;
  subtitle: string | undefined;
  authors: string | undefined;
  description: string | undefined;
  publishDate: Date | undefined;
  isbn10: string | undefined;
  isbn13: string | undefined;
  thumbnailLink: string | undefined;
};

type OpenLibraryBook = {
  openLibraryKey: string | undefined;
  title: string | undefined;
  subtitle: string | undefined;
  description: string | undefined;
  publishDate: Date | undefined;
  isbn10: string | undefined;
  isbn13: string | undefined;
  lccn: string | undefined;
  lcClassification: string | undefined;
  deweyClassification: string | undefined;
};

type LcBook = {
  lccn: string | undefined;
  title: string | undefined;
  subtitle: string | undefined;
  authors: string | undefined;
  publishDate: Date | undefined;
  lcClassification: string | undefined;
  deweyClassification: string | undefined;
};

export { GoogleBook, OpenLibraryBook, LcBook };
