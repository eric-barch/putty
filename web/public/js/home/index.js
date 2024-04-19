import { getHighlightedBookRow, setHighlightedBookRow } from "./global.js";
import {
  postAllBookRows,
  postBookRow,
  putBookRow,
  deleteBookRow,
} from "./bookRows.js";
import { openPopup } from "./popup";

const searchBook = async (event) => {
  event.preventDefault();

  const searchInput = document.getElementById("searchInput");
  const query = searchInput.value;

  try {
    const bookRow = document.querySelector(`tr[data-isbn="${query}"]`);
    const highlightedBookRow = getHighlightedBookRow();

    if (highlightedBookRow) {
      highlightedBookRow.style.backgroundColor = "";
    }

    bookRow.style.backgroundColor = "lightyellow";
    bookRow.scrollIntoView({ behavior: "smooth", block: "center" });

    setHighlightedBookRow(bookRow);
  } catch {
    const book = await getBook(query);

    if (book.source === "db") {
      throw new Error(
        `Book with ISBN ${query} is in database but not displayed in table.`,
      );
    }

    openPopup(book);
  }

  searchInput.value = "";
};

const bookEventListener = () => {
  const eventSource = new EventSource(`/api/book-events`);

  eventSource.onmessage = async (event) => {
    const { isbn, action } = JSON.parse(event.data);

    switch (action) {
      case "post":
        await postBookRow(isbn);
        break;
      case "put":
        await putBookRow(isbn);
        break;
      case "delete":
        await deleteRow(isbn);
        break;
      default:
        throw new Error(`Unrecognized action: ${action}`);
    }
  };
};

document.addEventListener("DOMContentLoaded", bookEventListener);
document.getElementById("searchForm").addEventListener("submit", searchBook);

postAllBookRows();
