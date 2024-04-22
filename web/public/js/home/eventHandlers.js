import { deleteBook, postBook, putBook } from "./apiRequests.js";
import { deleteBookRow, postBookRow, putBookRow } from "./bookRows.js";
import { closePopup } from "./popup.js";
import { searchForBook } from "./search.js";

const handleCheckIn = async (requestBook) => {
  closePopup();
  const responseBook = await putBook({
    ...requestBook,
    checkedIn: true,
  });
  await putBookRow(responseBook);
};

const handleCheckOut = async (requestBook) => {
  closePopup();
  const responseBook = await putBook({
    ...requestBook,
    checkedIn: false,
  });
  await putBookRow(responseBook);
};

const handleDelete = async (requestBook) => {
  closePopup();
  const responseBook = await deleteBook(requestBook);
  await deleteBookRow(responseBook);
};

const handlePost = async (requestBook) => {
  closePopup();
  const responseBook = await postBook({
    ...requestBook,
    checkedIn: true,
  });
  await postBookRow(responseBook);
  searchForBook(responseBook.id);
};

export { handleCheckIn, handleCheckOut, handleDelete, handlePost };
