import { postAllBookRows } from "./bookRows.js";
import { searchForBook } from "./search.js";

document.getElementById("searchForm").addEventListener("submit", searchForBook);

postAllBookRows();
