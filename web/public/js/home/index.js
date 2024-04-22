import { postAllBookRows } from "./bookRows.js";
import { searchForBook } from "./search.js";

document.getElementById("searchForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const query = document.getElementById("searchInput").value;
  searchForBook(query);
});

postAllBookRows();
