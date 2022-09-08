import type { Cell, Clues } from "../common/types";

let storage = window.localStorage;

export const getGrid = (): Cell[] => {
    let unparsedGrid = storage.getItem('grid');
    return JSON.parse(unparsedGrid);
}

export const setGrid = (grid: Cell[]) => {
    storage.setItem('grid', JSON.stringify(grid));
}

export const getClues = (): Clues => {
    let unparsedClues = storage.getItem('clues');
    return JSON.parse(unparsedClues);
}

export const setClues = (clues: Clues) => {
    storage.setItem('clues', JSON.stringify(clues));
}

export const getAll = (): { grid: Cell[], clues: Clues } => {
    return {
        grid: getGrid(),
        clues: getClues()
    }
}