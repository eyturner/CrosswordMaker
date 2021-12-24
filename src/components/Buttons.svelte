<script lang="ts">
    import { grid, SIZE } from "../stores/stores";
    import Cell from "./Cell.svelte";

    const onExport = () => {
        console.log("Exporting...");
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

    const cellGetsNumber = (cellNumber) => {
        if ($grid[cellNumber].letter == "") {
            return false;
        } else if (
            cellNumber % SIZE == 0 ||
            $grid[cellNumber - 1].isBlackSquare
        ) {
            return true;
        } else if (
            cellNumber - SIZE < 0 ||
            $grid[cellNumber - SIZE].isBlackSquare
        ) {
            return true;
        }
    };

    const onGenerateNumbers = () => {
        let currentNumber = 1;
        for (let i = 0; i < $grid.length; ++i) {
            if (cellGetsNumber(i)) {
                const newData = {
                    ...$grid[i],
                    number: currentNumber,
                };
                updateGridCell(i, newData);
                currentNumber += 1;
            }
        }
    };
</script>

<div class="container">
    <button on:click={() => onExport()}>Export</button>
    <button on:click={() => onGenerateNumbers()}>Generate Numbers</button>
</div>

<style>
    .container {
        display: flex;
        flex-direction: column;
        justify-content: center;
    }
</style>
