import { getHighlightedBookRow, setHighlightedBookRow } from "/js/global.js";
import { getBook } from "./apiRequests.js";
import {
  postAllBookRows,
  postBookRow,
  putBookRow,
  deleteBookRow,
} from "./bookRows.js";
import { openPopup } from "./popup.js";

const searchBook = async (event) => {
  event.preventDefault();

  const searchInput = document.getElementById("searchInput");
  const query = searchInput.value;

  try {
    const highlightedBookRow = getHighlightedBookRow();
    const bookRow = document.querySelector(`tr[data-isbn="${query}"]`);

    if (highlightedBookRow) {
      highlightedBookRow.style.backgroundColor = "";
    }

    setHighlightedBookRow(bookRow);
    bookRow.style.backgroundColor = "lightyellow";
    bookRow.scrollIntoView({ behavior: "smooth", block: "center" });
  } catch {
    const book = await getBook(query);

    if (book.source === "db") {
      const errorMessage = `Book with ISBN ${query} is in database but not displayed in table.`;
      console.error(errorMessage);
      throw new Error(errorMessage);
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
        await deleteBookRow(isbn);
        break;
      default:
        throw new Error(`Unrecognized action: ${action}`);
    }
  };
};

document.addEventListener("DOMContentLoaded", bookEventListener);
document.getElementById("searchForm").addEventListener("submit", searchBook);

postAllBookRows();
