<script lang="ts">
    import { currentLine, grid, currentCell } from "../stores/stores";
    import Cell from "./Cell.svelte";

    interface Word {
        defs: Array<string>;
        word: string;
    }

    export let wordOption;
    let definitionNum = 0;
    $: currentDef = formatDefinition(wordOption.defs[definitionNum]);

    const formatDefinition = (definition: string) => {
        if (definition) {
            const NOUN = "n";
            const VERB = "v";
            const ADJECTIVE = "adj";
            const ADVERB = "adv";

            const defBeginning = definition.indexOf("\t");
            const type = definition.slice(0, defBeginning);
            switch (type) {
                case NOUN:
                    return `\n Noun: ${definition.slice(defBeginning)}`;
                case VERB:
                    return `\n Verb: ${definition.slice(defBeginning)}`;
                case ADJECTIVE:
                    return `\n Adjective: ${definition.slice(defBeginning)}`;
                case ADVERB:
                    return `\n Adverb: ${definition.slice(defBeginning)}`;

                default:
                    console.error("Can't find word type");
                    return;
            }
        }
    };

    /*
    This next function is broken into two parts to deal
    with black squares being treated as writeable
*/
    const setGridLine = (wordOption: Word) => {
        const letters = wordOption.word;
        if ($grid[$currentLine[0]].isBlackSquare) {
            for (let i = 1; i <= letters.length; i++) {
                updateGridCell($currentLine[i], {
                    ...$grid[$currentLine[i]],
                    letter: letters[i - 1],
                });
            }
        } else {
            for (let i = 0; i < letters.length; i++) {
                updateGridCell($currentLine[i], {
                    ...$grid[$currentLine[i]],
                    letter: letters[i],
                });
            }
        }
    };

    const updateCurrentDef = (change: number) => {
        currentDef = wordOption.defs[definitionNum + change];
        definitionNum += change;
    };

    const updateGridCell = (cellNumber, cellProps) => {
        grid.update(() => {
            let tempGrid = $grid;
            tempGrid.splice(cellNumber, 1, {
                letter:
                    cellProps.letter !== null
                        ? cellProps.letter
                        : tempGrid[cellNumber].letter,
                isBlackSquare:
                    cellProps.isBlackSquare !== null
                        ? cellProps.isBlackSquare
                        : tempGrid[cellNumber].isBlackSquare,
                number:
                    cellProps.number !== null
                        ? cellProps.number
                        : tempGrid[cellNumber].number,
            });
            return tempGrid;
        });
    };
</script>

<div class="word" on:dblclick={() => setGridLine(wordOption)}>
    <p><strong>{wordOption.word}</strong></p>
    <p>{currentDef}</p>
    <button disabled={definitionNum == 0} on:click={() => updateCurrentDef(-1)}>
        &#60;
    </button>
    <button
        disabled={definitionNum >= wordOption.defs.length - 1}
        on:click={() => updateCurrentDef(1)}
    >
        >
    </button>
</div>

<style>
    .word {
        border: 1px solid grey;
        margin: 5px 0px;
        padding: 5px;
    }
</style>
