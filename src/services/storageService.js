let storage = window.localStorage;

export const getGrid = () => {
  let unparsedGrid = storage.getItem('grid');
  return JSON.parse(unparsedGrid);
}

export const setGrid = (grid) => {
  storage.setItem('grid', JSON.stringify(grid));
}