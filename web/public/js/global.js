let state = {
  highlightedBookRow: null,
};

const setHighlightedBookRow = (row) => {
  state.highlightedBookRow = row;
};

const getHighlightedBookRow = () => {
  return state.highlightedBookRow;
};

export { getHighlightedBookRow, setHighlightedBookRow };
