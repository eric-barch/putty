import * as cheerio from "cheerio";
import { GoogleBook, LcBook, LcClassification } from "./types";

const parseLcString = (
  str: string | undefined,
): LcClassification | undefined => {
  if (!str) return undefined;

  const patterns = {
    class: "([A-Z]+)",
    topic: "(\\d+(?:\\.\\d+)?)",
    subjectCutter: "(\\.?[A-Z]\\d+)",
    authorCutter: "(\\.?[A-Z]\\d+)",
    year: "(\\d{4})",
  };

  const regex = new RegExp(
    [
      `^\\s*`,
      `${patterns.class}?\\s*`,
      `${patterns.topic}?\\s*`,
      `${patterns.subjectCutter}?\\s*`,
      `${patterns.authorCutter}?\\s*`,
      `${patterns.year}?`,
    ].join(""),
    "i",
  );

  const match = str.match(regex);

  if (!match) return undefined;

  return {
    class: match[1],
    topic: match[2] ? Number(match[2]) : undefined,
    subjectCutter: match[3],
    authorCutter: match[4],
    year: match[5] ? Number(match[5]) : undefined,
  };
};

const queryLibraryOfCongress = async (
  url: string,
): Promise<LcBook | undefined> => {
  const response = await fetch(url);

  if (!response.ok) return undefined;

  const data = await response.text();
  const $ = cheerio.load(data);

  const lccn = $('identifier[type="lccn"]').text().trim() || undefined;
  const title = $("title").text().trim() || undefined;
  const subtitle = $("subtitle").text().trim() || undefined;
  const authors = $('name[type="personal"][usage="primary"]')
    .map((i, el) => $(el).find("namePart").text().trim())
    .get();
  const publishDateText = $('dateIssued[encoding="marc"]').text().trim();
  const publishDate = publishDateText ? new Date(publishDateText) : undefined;
  const lc = parseLcString($('classification[authority="lcc"]').text().trim());
  const dewey = $('classification[authority="ddc"]').text().trim() || undefined;

  const result = {
    lccn,
    title,
    subtitle,
    authors,
    publishDate,
    lc,
    dewey,
  };

  const allUndefined = Object.values(result).every(
    (value) => !value || (Array.isArray(value) && value.length === 0),
  );

  return allUndefined ? undefined : result;
};

const searchLibraryOfCongress = async (
  googleBook: GoogleBook,
): Promise<LcBook | undefined> => {
  const firstAuthor = googleBook.authors?.[0] || "";
  const lastNamePattern =
    /(\b\w+\b)(?:\s*(?:\(|\[)?(?:Jr\.|Sr\.|III|II|IV)(?:\)|\])?)?$/i;
  const match = lastNamePattern.exec(firstAuthor);
  const firstAuthorLastName = match ? match[1] : "";

  const isbn13Url = `http://lx2.loc.gov:210/lcdb?version=1.1&operation=searchRetrieve&query=bath.isbn="${googleBook.isbn13}"&startRecord=1&maximumRecords=1&recordSchema=mods`;
  const isbn10Url = `http://lx2.loc.gov:210/lcdb?version=1.1&operation=searchRetrieve&query=bath.isbn="${googleBook.isbn10}"&startRecord=1&maximumRecords=1&recordSchema=mods`;
  const titleAndAuthorUrl = `http://lx2.loc.gov:210/lcdb?version=1.1&operation=searchRetrieve&query=bath.title="${googleBook.title}" and bath.author="${firstAuthorLastName}"&startRecord=1&maximumRecords=1&recordSchema=mods`;

  const [isbn13Book, isbn10Book, titleAndAuthorBook] = await Promise.all([
    queryLibraryOfCongress(isbn13Url),
    queryLibraryOfCongress(isbn10Url),
    queryLibraryOfCongress(titleAndAuthorUrl),
  ]);

  const lcBook = {
    lccn: isbn13Book?.lccn || isbn10Book?.lccn || titleAndAuthorBook?.lccn,
    title: isbn13Book?.title || isbn10Book?.title || titleAndAuthorBook?.title,
    subtitle:
      isbn13Book?.subtitle ||
      isbn10Book?.subtitle ||
      titleAndAuthorBook?.subtitle,
    authors:
      isbn13Book?.authors || isbn10Book?.authors || titleAndAuthorBook?.authors,
    publishDate:
      isbn13Book?.publishDate ||
      isbn10Book?.publishDate ||
      titleAndAuthorBook?.publishDate,
    lc: isbn13Book?.lc || isbn10Book?.lc || titleAndAuthorBook?.lc,
    dewey: isbn13Book?.dewey || isbn10Book?.dewey || titleAndAuthorBook?.dewey,
  };

  const allUndefined = Object.values(lcBook).every(
    (value) => !value || (Array.isArray(value) && value.length === 0),
  );

  return allUndefined ? undefined : lcBook;
};

export { searchLibraryOfCongress };
