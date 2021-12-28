import { writable } from 'svelte/store';

import { getAll } from "../services/storageService";

const foundItems = getAll();
console.log("FOUND:", foundItems)
const foundGrid = foundItems.grid;
const foundClues = foundItems.clues;

// The size of a standard NYT puzzle.
export const SIZE = 15;

export const grid = writable(foundGrid ||
    Array.from({ length: SIZE * SIZE }, () => ({
        letter: "",
        isBlackSquare: false,
        number: "",
    })));

export const currentCell = writable(0);
export const currentLine = writable([]);

// Clues will be an object of objects. Each key in the parent object
// will contain the type of clue it is, (across or down).
// The children objects will contain k:v pairs that are of the format:
// number (int) : clue (string)
export const clues = writable(
    foundClues ||
    {
        across: {},
        down: {}
    }
)
