<script lang="ts">
    import { currentLine, grid, currentCell } from "../stores/stores";
    import { getWordOptions } from "../services/dictionaryService";
    import WordOption from "./WordOption.svelte";

    let wordOptions;

    const getCurrentLineLetters = () => {
        let letterArr = [];
        $currentLine.forEach((cellNumber) => {
            if (!$grid[cellNumber].isBlackSquare) {
                letterArr.push($grid[cellNumber]);
            }
        });
        return letterArr;
    };

    const handleClick = async () => {
        const newWordOptions = await getWordOptions(getCurrentLineLetters());
        wordOptions = newWordOptions;
        currentCell.set(-1);
    };
</script>

<div class="container">
    <button id="big-button" on:click={() => handleClick()}
        >Show me some words!</button
    >
    {#if wordOptions}
        <div class="word-container">
            {#each wordOptions as wordOption}
                <WordOption {wordOption} />
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
</style>
