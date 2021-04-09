import { writable } from 'svelte/store';

import { getGrid } from "../services/storageService";


// The size of a standard NYT puzzle.
export const size = 15;

export const grid = writable(getGrid() ||
  Array.from({ length: size * size }, () => ({
    letter: "",
    isBlackSquare: false,
    number: "",
  })));

export const currentCell = writable(0);

export const currentLine = writable([]);