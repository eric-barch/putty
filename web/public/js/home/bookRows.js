import { getAllBooks } from "./apiRequests.js";
import { openPopup } from "./popup.js";

const createBookRow = (book) => {
  const bookRow = document
    .importNode(bookRowTemplate.content, true)
    .querySelector("tr");

  const isbn = book.isbn13 || book.isbn10;

  bookRow.setAttribute("data-isbn", isbn);

  const cells = bookRow.querySelectorAll("td");

  cells.forEach((cell) => {
    const className = cell.className;
    const value = book[className];

    switch (className) {
      case "thumbnail":
        const img = document.createElement("img");
        img.src = value ? value : "/no-cover.jpeg";
        img.alt = `Book cover for ${book.title}`;
        cell.textContent = "";
        cell.appendChild(img);
        break;
      case "title":
        const a = document.createElement("a");
        a.href = "javascript:void(0)";
        a.textContent = book.title;
        a.addEventListener("click", () => openPopup(true, book));
        cell.appendChild(a);
        break;
      case "lcClassification":
        const lcClassification = `${book.lcClass || ""}${book.lcTopic || ""} ${book.lcSubjectCutter || ""} ${book.lcAuthorCutter || ""}`;
        cell.textContent = lcClassification;
        break;
      default:
        cell.textContent = value;
    }
  });

  return bookRow;
};

const postAllBookRows = async () => {
  const bookTableBody = document.getElementById("bookTableBody");
  const books = await getAllBooks();

  books.forEach((book) => {
    const bookRow = createBookRow(book);
    bookTableBody.appendChild(bookRow);
  });
};

const postBookRow = async (book) => {
  const newBookRow = createBookRow(book);

  const bookRows = bookTableBody.querySelectorAll("tr[data-isbn]");

  for (const bookRow of bookRows) {
    const lcClassification =
      bookRow.querySelector(".lcClassification")?.textContent;

    if (book.lcClassification < lcClassification) {
      bookRow.before(newBookRow);
      return;
    }
  }

  bookTableBody.appendChild(newBookRow);
};

const putBookRow = async (book) => {
  const isbn = book.isbn13 || book.isbn10;
  const bookRow = bookTableBody.querySelector(`tr[data-isbn="${isbn}"]`);

  if (!bookRow) {
    console.error(`Did not find book with ISBN ${isbn}.`);
    throw new Error(`Did not find book with ISBN ${isbn}.`);
  }

  const lcClassification =
    bookRow.querySelector(".lcClassification")?.textContent;

  if (lcClassification !== book.lcClassification) {
    bookRow.remove();
    await postBookRow(isbn);
  } else {
    /**Classification hasn't changed. No need to re-sort. */
    const newBookRow = createBookRow(book);
    bookRow.replaceWith(newBookRow);
  }
};

const deleteBookRow = async (book) => {
  const isbn = book.isbn13 || book.isbn10;
  const bookRow = bookTableBody.querySelector(`tr[data-isbn="${isbn}"]`);

  if (bookRow) {
    bookRow.remove();
  }
};

export { postAllBookRows, postBookRow, putBookRow, deleteBookRow };
