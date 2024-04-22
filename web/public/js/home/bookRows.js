import { getAllBooks } from "./apiRequests.js";
import { compareLcClassifications } from "./lcClassification.js";
import { openPopup } from "./popup.js";

const createBookRow = (book) => {
  const bookRow = document
    .importNode(bookRowTemplate.content, true)
    .querySelector("tr");

  const id = book.id;
  const isbn = book.isbn13 || book.isbn10;

  bookRow.setAttribute("data-id", id);
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
        a.addEventListener("click", () => openPopup(true, book));
        a.textContent = book.title;
        cell.appendChild(a);
        break;
      case "lc":
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
  const bookRows = bookTableBody.querySelectorAll("tr");

  for (const bookRow of bookRows) {
    if (compareLcClassifications(book, bookRow) < 0) {
      bookRow.before(newBookRow);
      return;
    }
  }

  bookTableBody.appendChild(newBookRow);
};

const putBookRow = async (book) => {
  const id = book.id;
  const bookRow = bookTableBody.querySelector(`tr[data-id="${id}"]`);

  if (!bookRow) {
    console.error(`Did not find book with id ${id}.`);
    throw new Error(`Did not find book with id ${id}.`);
  }

  if (compareLcClassifications(book, bookRow) !== 0) {
    bookRow.remove();
    await postBookRow(book);
  } else {
    /**Classification hasn't changed. No need to re-sort. */
    const newBookRow = createBookRow(book);
    bookRow.replaceWith(newBookRow);
  }
};

const deleteBookRow = async (book) => {
  const id = book.id;
  const bookRow = bookTableBody.querySelector(`tr[data-id="${id}"]`);

  if (!bookRow) {
    console.error(`Did not find book with id ${id}.`);
    throw new Error(`Did not find book with id ${id}.`);
  }

  if (bookRow) {
    bookRow.remove();
  }
};

export { postAllBookRows, postBookRow, putBookRow, deleteBookRow };
