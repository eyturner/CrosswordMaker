<script lang="ts">
    import CellBox from "./CellBox.svelte";
    import { setGrid } from "../services/storageService";
    import { grid, currentCell, currentLine, SIZE } from "../stores/stores";
    import type { Cell } from "../common/types";

    // acrossAxis is a boolean to determine current writing direction
    let acrossAxis = true;
    let deleteMode = false;
    let mouseDown = false;

    // Grid update functions ////////////////////////////////////////
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

    const changeCellFill = (cellNumber: number): void => {
        const cellIsBlack = $grid[cellNumber].isBlackSquare;

        const newData: Cell = {
            letter: "",
            number: "",
            isBlackSquare: !cellIsBlack,
        };

        updateGridCell(cellNumber, newData);
        updateGridCell($grid.length - 1 - cellNumber, newData);

        currentLine.set(determineCurrentLine());
        setGrid($grid);
    };

    const determineCurrentLine = (): number[] => {
        const getRow = (cellNumber: number) => Math.floor(cellNumber / SIZE);
        const getCol = (cellNumber: number) => cellNumber % SIZE;
        const inc = acrossAxis ? 1 : SIZE;

        let min: number;
        let max: number;
        for (let i = 0; i < SIZE * inc; i += inc) {
            if (min == undefined) {
                // Min boundary conditions
                if (
                    acrossAxis
                        ? getCol($currentCell - i) === 0
                        : getRow($currentCell - i) === 0
                )
                    min = $currentCell - i;
                else if ($grid[$currentCell - i].isBlackSquare)
                    min = $currentCell - i;
            }
            if (max == undefined) {
                // Max boundary conditions
                if (
                    acrossAxis
                        ? getCol($currentCell + i) === SIZE - 1
                        : getRow($currentCell + i) === SIZE - 1
                ) {
                    max = $currentCell + i;
                } else if ($grid[$currentCell + i].isBlackSquare) {
                    max = $currentCell + i;
                }
            }
        }
        let potentialLine: number[] = [];
        for (let i = min; i <= max; i += inc) {
            potentialLine = potentialLine.concat(i);
        }
        return potentialLine;
    };

    const setCurrentCell = (cellNumber: number): void => {
        currentCell.set(mod(cellNumber, SIZE * SIZE));
        currentLine.set(determineCurrentLine());
    };

    const flipAxis = (e): void => {
        e.preventDefault(); // Needed to remain on current input element
        acrossAxis = !acrossAxis;
    };

    // moveRight: move(0,1), moveLeft: move(0,-1), moveUp: move(0,-SIZE), moveDown: move(0,SIZE)
    const move = (acc: number, inc: number): void => {
        if ($grid[mod($currentCell + acc + inc, SIZE * SIZE)].isBlackSquare) {
            move(acc + inc, inc);
        } else if ($currentCell + acc + inc <= 0) {
            setCurrentCell(0);
        } else {
            setCurrentCell($currentCell + acc + inc);
        }
    };

    // Event handling functions ////////////////////////////////////////
    const handleClick = (cellNumber: number): void => {
        setCurrentCell(cellNumber);
        setTimeout(function () {
            if (mouseDown) {
                changeCellFill(cellNumber);
            }
        }, 200);
    };

    const handleArrow = (direction: number): void => {
        const L_ARROW: number = 37;
        const U_ARROW: number = 38;
        const R_ARROW: number = 39;
        const D_ARROW: number = 40;
        switch (direction) {
            // Left movement
            case L_ARROW:
                move(0, -1);
                break;
            case U_ARROW:
                move(0, -SIZE);
                break;

            // Right or Down Movement
            case R_ARROW:
                move(0, 1);
                break;

            case D_ARROW:
                move(0, SIZE);
                break;

            default:
                console.log("ERROR, keycode not recognized:", direction);
                break;
        }
    };

    const handleBackSpace = (): void => {
        if (deleteMode) {
            updateGridCell($currentCell, {
                ...$grid[$currentCell],
                letter: "",
            });
            move(0, acrossAxis ? -1 : -SIZE);
        } else if ($grid[$currentCell].letter) {
            updateGridCell($currentCell, {
                ...$grid[$currentCell],
                letter: "",
            });
        } else move(0, acrossAxis ? -1 : -SIZE);
        deleteMode = true;
        setGrid($grid);
    };

    const handleKeyDown = (event: any): void => {
        if ($grid[$currentCell].isBlackSquare) {
            acrossAxis ? move(0, 1) : move(0, SIZE);
        }

        const A_CODE: number = 65;
        const Z_CODE: number = 90;
        const B_SPACE: number = 8;
        const L_ARROW: number = 37;
        const D_ARROW: number = 40;
        const TAB: number = 9;
        const SPACE: number = 32;
        const key: number = event.keyCode;

        if (key >= A_CODE && key <= Z_CODE) {
            deleteMode = false;
            updateGridCell($currentCell, {
                ...$grid[$currentCell],
                letter: event.key,
            });
            move(0, acrossAxis ? 1 : SIZE);
            setGrid($grid);
        } else if (key === B_SPACE) {
            handleBackSpace();
        } else if (key >= L_ARROW && key <= D_ARROW) {
            deleteMode = false;
            handleArrow(key);
        } else if (key === TAB) {
            // Switch directionality
            deleteMode = false;
            flipAxis(event);
            currentLine.set(determineCurrentLine());
        } else if (key === SPACE) {
            deleteMode = false;
            changeCellFill($currentCell);
            move(0, acrossAxis ? 1 : SIZE);
        }
    };

    const handleMouseOver = (cellNumber: number): void => {
        if (mouseDown) {
            changeCellFill(cellNumber);
        }
    };

    // Helper functions
    const mod = (m: number, n: number): number => {
        return ((m % n) + n) % n;
    };
</script>

<div
    class="grid"
    on:mousedown={() => (mouseDown = true)}
    on:mouseup={() => (mouseDown = false)}
>
    {#each $grid as cellContent, i}
        <div
            class="cell"
            on:mousedown={() => handleClick(i)}
            on:keydown={(e) => handleKeyDown(e)}
            on:mouseover={() => handleMouseOver(i)}
        >
            <CellBox
                {cellContent}
                currentCell={$currentCell === i}
                inCurrentLine={$currentLine.includes(i)}
            />
        </div>
    {/each}
</div>

<style>
    .grid {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        width: 525px;
        height: 525px;
    }

    .cell {
        height: 35px;
        width: 35px;
    }
</style>
