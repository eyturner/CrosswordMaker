let storage = window.localStorage;

export const getGrid = () => {
    let unparsedGrid = storage.getItem('grid');
    return JSON.parse(unparsedGrid);
}

export const setGrid = (grid) => {
    storage.setItem('grid', JSON.stringify(grid));
}

export const getClues = () => {
    let unparsedClues = storage.getItem('clues');
    return JSON.parse(unparsedClues);
}

export const setClues = (clues) => {
    storage.setItem('clues', JSON.stringify(clues));
}

export const getAll = () => {
    return {
        grid: getGrid(),
        clues: getClues()
    }
}