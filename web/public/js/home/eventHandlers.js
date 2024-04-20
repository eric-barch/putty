import { deleteBook, postBook, putBook } from "./apiRequests.js";
import { deleteBookRow, postBookRow, putBookRow } from "./bookRows.js";
import { closePopup } from "./popup.js";

const handleCheckIn = async (requestBook) => {
  closePopup();
  const responseBook = await putBook({
    ...requestBook,
    isCheckedIn: true,
  });
  await putBookRow(responseBook);
};

const handleCheckOut = async (requestBook) => {
  closePopup();
  const responseBook = await putBook({
    ...requestBook,
    isCheckedIn: false,
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
  const responseBook = await postBook(requestBook);
  await postBookRow(responseBook);
};

export { handleCheckIn, handleCheckOut, handleDelete, handlePost };