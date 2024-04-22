let highlightedBookRow = undefined;

const setHighlightedBookRow = (row) => {
  highlightedBookRow = row;
};

const getHighlightedBookRow = () => {
  return highlightedBookRow;
};

export { getHighlightedBookRow, setHighlightedBookRow };
