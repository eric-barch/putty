import { getHighlightedBookRow, setHighlightedBookRow } from "/js/global.js";
import { getBook } from "./apiRequests.js";
import {
  postAllBookRows,
  postBookRow,
  putBookRow,
  deleteBookRow,
} from "./bookRows.js";
import { openPopup } from "./popup.js";

const searchForBookRow = (isbn) => {
  console.log(`Searching for book row with ISBN ${isbn}.`);

  const highlightedBookRow = getHighlightedBookRow();
  const bookRow = document.querySelector(`tr[data-isbn="${isbn}"]`);

  if (highlightedBookRow) {
    highlightedBookRow.style.backgroundColor = "";
  }

  if (bookRow) {
    console.log(`Found book row with ISBN ${isbn}.`);
  } else {
    const errorMessage = `Did not find book row with ISBN ${isbn}.`;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  setHighlightedBookRow(bookRow);

  bookRow.style.backgroundColor = "lightyellow";
  bookRow.scrollIntoView({ behavior: "smooth", block: "center" });
};

const searchForBook = async (event) => {
  event.preventDefault();

  const searchInput = document.getElementById("searchInput");
  const query = searchInput.value;

  try {
    searchForBookRow(query);
  } catch {
    const book = await getBook(query);
    console.log("book", book);

    const isbn = book.details.isbn13 || book.details.isbn10;
    console.log("isbn", isbn);

    try {
      searchForBookRow(isbn);
    } catch {
      openPopup(book);
    }
  }

  searchInput.value = "";
};

const eventListener = () => {
  const eventSource = new EventSource(`/api/book-events`);

  eventSource.onmessage = async (event) => {
    const { isbn, action } = JSON.parse(event.data);

    switch (action) {
      case "POST":
        console.log(`Received POST event.`);
        await postBookRow(isbn);
        break;
      case "PUT":
        console.log(`Received PUT event.`);
        await putBookRow(isbn);
        break;
      case "DELETE":
        console.log(`Received DELETE event.`);
        await deleteBookRow(isbn);
        break;
      default:
        throw new Error(`Unrecognized action: ${action}`);
    }
  };
};

document.addEventListener("DOMContentLoaded", eventListener);
document.getElementById("searchForm").addEventListener("submit", searchForBook);

postAllBookRows();
