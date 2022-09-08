export interface Cell {
    letter?: string;
    isBlackSquare?: boolean;
    number?: string | number;
}

type Clue = {
    number?: number | string, clue?: string,
}

export interface Clues {
    across: Clue,
    down: Clue
}

export interface Word {
    defs: Array<string>;
    word: string;
}