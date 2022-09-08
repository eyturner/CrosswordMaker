<script lang="ts">
    import { grid, clues, SIZE } from "../stores/stores";
    import { setGrid, setClues } from "../services/storageService";
    import type { Cell, Clues } from "../common/types";

    const onExport = (): void => {
        console.log("Exporting...");
    };

    const updateGridCell = (cellNumber: number, cellProps: Cell): void => {
        grid.update((): Cell[] => {
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

    const cellGetsNumber = (cellNumber: number): boolean => {
        if ($grid[cellNumber].letter == "") {
            return false;
        } else if (
            // Check if across
            cellNumber % SIZE == 0 ||
            $grid[cellNumber - 1].isBlackSquare
        ) {
            return true;
        } else if (
            // Check if down
            cellNumber - SIZE < 0 ||
            $grid[cellNumber - SIZE].isBlackSquare
        ) {
            return true;
        }
    };

    // This function should only be called after ensuring that the cell gets
    // a number
    const createClue = (cellNumber: number): void => {
        // First find whether the tile should be across, down, or both
        let across = false;
        let down = false;

        // If the grid is a black square, no clue needed.
        if ($grid[cellNumber].isBlackSquare) {
            return;
        } else {
            // Check across
            if (cellNumber % SIZE == 0 || $grid[cellNumber - 1].isBlackSquare) {
                across = true;
            }
            // Check down
            if (
                cellNumber - SIZE < 0 ||
                $grid[cellNumber - SIZE].isBlackSquare
            ) {
                down = true;
            }
        }

        // Update $clues accordingly: if across or down, add that number to
        // the object and create a blank string as the clue.
        clues.update((): Clues => {
            let tempClues = $clues;
            let clueNumber = $grid[cellNumber].number;
            if (across) {
                tempClues.across[clueNumber] = "";
            }
            if (down) {
                tempClues.down[clueNumber] = "";
            }
            return tempClues;
        });
    };

    const onGenerateNumbers = (): void => {
        let currentNumber = 1;
        for (let i = 0; i < $grid.length; ++i) {
            if (cellGetsNumber(i)) {
                const newData = {
                    ...$grid[i],
                    number: currentNumber,
                };
                updateGridCell(i, newData);
                createClue(i);
                currentNumber += 1;
            }
        }
        setClues($clues);
        setGrid($grid);
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
