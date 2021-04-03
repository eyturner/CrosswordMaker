<script>
    import { currentLine, grid } from "../stores/stores";
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
    };
</script>

{#if wordOptions}
    <div class="word-container">
        {#each wordOptions as wordOption}
            <div class="word">
                <p>{wordOption.word} \n</p>
                <p>{wordOption.defs[0]}</p>
            </div>
        {/each}
    </div>
{:else}
    <div class="container">
        <button id="big-button" on:click={() => handleClick()}
            >Show me some words!</button
        >
    </div>
{/if}

<style>
    .word-container {
        display: flex;
        flex-direction: column;
        max-width: 30vw;
    }
    .word {
        display: flex;
    }
</style>
