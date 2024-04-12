let state = {
  highlightedBookRow: null,
};

export function setHighlightedBookRow(row) {
  state.highlightedBookRow = row;
}

export function getHighlightedBookRow() {
  return state.highlightedBookRow;
}
