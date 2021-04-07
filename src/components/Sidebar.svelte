<script>
    import { currentLine, grid, currentCell } from "../stores/stores";
    import { getWordOptions } from "../services/dictionaryService";

    let wordOptions;

    const getCurrentLineLetters = () => {
        console.log;
        let letterArr = [];
        $currentLine.forEach((cellNumber) => {
            if (!$grid[cellNumber].isBlackSquare) {
                letterArr.push($grid[cellNumber]);
            }
        });
        console.log("YOUR LETTER ARRAY:", letterArr);
        return letterArr;
    };

    const handleClick = async () => {
        const newWordOptions = await getWordOptions(getCurrentLineLetters());
        console.log(newWordOptions);
        wordOptions = newWordOptions;
        currentCell.set(-1);
    };

    const setGridLine = (wordOption) => {
        console.log("UPDATING GRID NOW! :D");
    };
</script>

<div class="container">
    <button id="big-button" on:click={() => handleClick()}
        >Show me some words!</button
    >
    {#if wordOptions}
        <div class="word-container">
            {#each wordOptions as wordOption}
                <div
                    class="word"
                    on:click={(wordOption) => setGridLine(wordOption)}
                >
                    <p><strong>{wordOption.word}</strong></p>
                    <p>{"\n" + wordOption.defs[0].slice(2)}</p>
                </div>
            {/each}
        </div>
    {/if}
</div>

<style>
    .word-container {
        display: flex;
        flex-direction: column;
        max-width: 30vw;
    }

    .container {
        max-height: 525px;
        width: 30vw;
        overflow: scroll;
        border: 1px solid black;
        padding: 5px;
        border-radius: 5px;
    }

    .word {
        border: 1px solid grey;
        margin: 5px 0px;
        padding: 5px;
    }
</style>
