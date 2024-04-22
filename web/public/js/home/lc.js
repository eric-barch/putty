const parseLcString = (str) => {
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
    lcClass: match[1],
    lcTopic: match[2] ? Number(match[2]) : undefined,
    lcSubjectCutter: match[3],
    lcAuthorCutter: match[4],
    lcYear: match[5] ? Number(match[5]) : undefined,
  };
};

const compareLcClassifications = (book, bookRow) => {
  const {
    lcClass: bookClass,
    lcTopic: bookTopic,
    lcSubjectCutter: bookSubjectCutter,
    lcAuthorCutter: bookAuthorCutter,
    lcYear: bookYear,
  } = book;

  const lc = bookRow.querySelector(".lc")?.textContent;

  if (!lc) return bookClass ? -1 : 0;

  const {
    lcClass: rowClass,
    lcTopic: rowTopic,
    lcSubjectCutter: rowSubjectCutter,
    lcAuthorCutter: rowAuthorCutter,
    lcYear: rowYear,
  } = parseLcString(lc);

  if (bookClass !== rowClass) {
    return bookClass < rowClass ? -1 : 1;
  }

  if (bookTopic !== rowTopic) {
    return bookTopic < rowTopic ? -1 : 1;
  }

  if (bookSubjectCutter !== rowSubjectCutter) {
    return bookSubjectCutter < rowSubjectCutter ? -1 : 1;
  }

  if (bookAuthorCutter !== rowAuthorCutter) {
    return bookAuthorCutter < rowAuthorCutter ? -1 : 1;
  }

  if (bookYear !== rowYear) {
    return bookYear < rowYear ? -1 : 1;
  }

  return 0;
};

export { compareLcClassifications };
