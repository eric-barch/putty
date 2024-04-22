import { getHighlightedBookRow, setHighlightedBookRow } from "../global.js";
import { getBook } from "./apiRequests.js";
import { openPopup } from "./popup.js";

const highlightBookRow = (idOrIsbn) => {
  const highlightedBookRow = getHighlightedBookRow();
  const bookRow = document.querySelector(
    `tr[data-isbn="${idOrIsbn}"], tr[data-id="${idOrIsbn}"]`,
  );

  if (highlightedBookRow) {
    highlightedBookRow.style.backgroundColor = "";
  }

  if (!bookRow) {
    throw new Error(`${idOrIsbn} is not an id or ISBN in bookTable.`);
  }

  setHighlightedBookRow(bookRow);

  bookRow.style.backgroundColor = "lightyellow";
  bookRow.scrollIntoView({ behavior: "smooth", block: "center" });
};

const searchForBook = async (query) => {
  try {
    highlightBookRow(query);
  } catch {
    const { source, book } = await getBook(query);

    if (source === "db") {
      highlightBookRow(book.id);
    } else {
      const isbn = book.isbn13 || book.isbn10;

      try {
        highlightBookRow(isbn);
      } catch {
        openPopup(false, book);
      }
    }
  }

  searchInput.value = "";
};

export { searchForBook };
