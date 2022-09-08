import axios from 'axios';
import type { Cell } from "../common/types";

const baseUrl = 'https://api.datamuse.com/words?sp='

type WordDef = {
    defs: string[];
    score: number;
    word: string;
}

const generateSearchString = (cellArr: Cell[]): string => {
    let searchStr = baseUrl;
    cellArr.forEach(cell => {
        if (cell.letter) {
            searchStr += cell.letter;
        } else {
            searchStr += '?';
        }
    });
    return (searchStr + '&md=d');
}

const getWordOptions = async (cellArr: Cell[]): Promise<WordDef[]> => {
    try {
        const res = await axios.get(generateSearchString(cellArr));
        return res.data.filter(word => word.defs);
    } catch (err) {
        console.error(err);
    }
}

export { getWordOptions };

