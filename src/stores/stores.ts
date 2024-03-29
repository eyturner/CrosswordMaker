import { writable, Writable } from 'svelte/store';

import type { Cell, Clues } from "../common/types";
import { getAll } from "../services/storageService";

const foundItems = getAll();
const foundGrid = foundItems.grid;
const foundClues = foundItems.clues;

// The size of a standard NYT puzzle.
export const SIZE: number = 15;

export const grid: Writable<Cell[]> = writable(foundGrid ||
    Array.from({ length: SIZE * SIZE }, () => ({
        letter: "",
        isBlackSquare: false,
        number: "",
    })));

export const currentCell: Writable<number> = writable(0);
export const currentLine: Writable<number[]> = writable([]);

// Clues will be an object of objects. Each key in the parent object
// will contain the type of clue it is, (across or down).
// The children objects will contain k:v pairs that are of the format:
// number (int) : clue (string)
export const clues: Writable<Clues> = writable(
    foundClues ||
    {
        across: {},
        down: {}
    }
)
