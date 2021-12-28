<script lang="ts">
    import {
        currentLine,
        grid,
        currentCell,
        clues,
        SIZE,
    } from "../stores/stores";
    import { setGrid, setClues } from "../services/storageService";

    const handleClear = () => {
        grid.set(
            Array.from({ length: SIZE * SIZE }, () => ({
                letter: "",
                isBlackSquare: false,
                number: "",
            }))
        );

        clues.set({
            across: {},
            down: {},
        });
        currentCell.set(null);
        currentLine.set([]);
        setGrid($grid);
        setClues($clues);
    };
</script>

<div class="container">
    <div class="float-right">
        <button>How to Use</button>
        <button>Check Rules</button>
        <button on:click={() => handleClear()}>Clear</button>
        <checkbox />
    </div>
</div>

<style>
    .float-right {
        float: right;
    }
    .container {
        height: 10vh;
        display: flex;
        justify-content: flex-end;
        flex-direction: row;
        align-items: center;
        padding: 0 1%;
    }
</style>
