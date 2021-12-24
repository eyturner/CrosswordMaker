import axios from 'axios';
const baseUrl = 'https://api.datamuse.com/words?sp='

const generateSearchString = (cellArr) => {
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

const getWordOptions = async (cellArr) => {
    try {
        const res = await axios.get(generateSearchString(cellArr));
        return res.data.filter(word => word.defs);
    } catch (err) {
        console.error(err);
    }
}

export { getWordOptions };

