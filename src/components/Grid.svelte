<script lang="ts">
  import Cell from "./Cell.svelte";
  import { getGrid, setGrid } from "../services/storageService";

  let size = 15; // 15 x 15 for a standard weekday puzzle
  let grid =
    getGrid() ||
    Array.from({ length: size * size }, () => ({
      letter: "",
      isBlackSquare: false,
      number: "",
    }));
  let currentCell;
  let currentLine: number[] = [];
  // acrossAxis is a boolean to determine current writing direction
  let acrossAxis = true;

  let deleteMode = false;

  let mouseDown = false;

  const handleDoubleClick = (cellNumber) => {
    const cellIsBlack = grid[cellNumber].isBlackSquare;

    grid.splice(cellNumber, 1, {
      letter: "",
      isBlackSquare: !cellIsBlack,
      number: "",
    });
    grid.splice(grid.length - 1 - cellNumber, 1, {
      letter: "",
      isBlackSquare: !cellIsBlack,
      number: "",
    });
    grid = grid;
    currentLine = determineCurrentLine();
    setGrid(grid);
  };

  const determineCurrentLine = () => {
    const getRow = (cellNumber) => Math.floor(cellNumber / size);
    const getCol = (cellNumber) => cellNumber % size;
    const inc = acrossAxis ? 1 : size;

    let min;
    let max;
    for (let i = 0; i < size * inc; i += inc) {
      if (min == undefined) {
        // Min boundary conditions
        if (
          acrossAxis
            ? getCol(currentCell - i) === 0
            : getRow(currentCell - i) === 0
        )
          min = currentCell - i;
        else if (grid[currentCell - i].isBlackSquare) min = currentCell - i;
      }
      if (max == undefined) {
        // Max boundary conditions
        if (
          acrossAxis
            ? getCol(currentCell + i) === size - 1
            : getRow(currentCell + i) === size - 1
        )
          max = currentCell + i;
        else if (grid[currentCell + i].isBlackSquare) max = currentCell + i;
      }
    }
    let potentialLine = [];
    for (let i = min; i <= max; i += inc) {
      potentialLine = potentialLine.concat(i);
    }
    return potentialLine;
  };

  const flipAxis = (e) => {
    e.preventDefault();
    acrossAxis = !acrossAxis;
  };

  const setCurrentCell = (cellNumber: number) => {
    currentCell = mod(cellNumber, size * size);
    currentLine = determineCurrentLine();
  };

  const mod = (m, n) => {
    return ((m % n) + n) % n;
  };

  // moveRight: move(0,1), moveLeft: move(0,-1), moveUp: move(0,-size), moveDown: move(0,size)
  const move = (acc, inc) => {
    if (grid[mod(currentCell + acc + inc, size * size)].isBlackSquare) {
      move(acc + inc, inc);
    } else {
      setCurrentCell(currentCell + acc + inc);
    }
  };

  const handleArrow = (direction) => {
    const L_ARROW = 37;
    const U_ARROW = 38;
    const R_ARROW = 39;
    const D_ARROW = 40;
    switch (direction) {
      // Left movement
      case L_ARROW:
        move(0, -1);
        break;
      case U_ARROW:
        move(0, -size);
        break;

      // Right or Down Movement
      case R_ARROW:
        move(0, 1);
        break;

      case D_ARROW:
        move(0, size);
        break;

      default:
        console.log("ERROR, keycode not recognized:", direction);
        break;
    }
  };

  const handleBackSpace = () => {
    if (deleteMode) {
      grid[currentCell] = { ...grid[currentCell], letter: "" };
      move(0, acrossAxis ? -1 : -size);
    } else if (grid[currentCell].letter) {
      grid[currentCell] = { ...grid[currentCell], letter: "" };
    } else move(0, acrossAxis ? -1 : -size);
    deleteMode = true;
    setGrid(grid);
  };

  const handleKeyDown = (event) => {
    if (grid[currentCell].isBlackSquare) {
      acrossAxis ? move(0, 1) : move(0, size);
    }

    const A_CODE = 65;
    const Z_CODE = 90;
    const B_SPACE = 8;
    const L_ARROW = 37;
    const D_ARROW = 40;
    const TAB = 9;
    const SPACE = 32;
    const key = event.keyCode;

    if (key >= A_CODE && key <= Z_CODE) {
      deleteMode = false;
      grid[currentCell] = { ...grid[currentCell], letter: event.key };
      move(0, acrossAxis ? 1 : size);
      setGrid(grid);
    } else if (key === B_SPACE) {
      handleBackSpace();
    } else if (key >= L_ARROW && key <= D_ARROW) {
      deleteMode = false;
      handleArrow(key);
    } else if (key === TAB) {
      // Switch directionality
      deleteMode = false;
      flipAxis(event);
      currentLine = determineCurrentLine();
    } else if (key === SPACE) {
      deleteMode = false;
      handleDoubleClick(currentCell);
      move(0, acrossAxis ? 1 : size);
    }
  };

  const handleMouseOver = (cellNumber) => {
    if (mouseDown) {
      handleDoubleClick(cellNumber);
    }
  };
</script>

<div class="container">
  <div
    class="grid"
    on:mousedown={() => (mouseDown = true)}
    on:mouseup={() => (mouseDown = false)}
  >
    {#each grid as cellContent, i}
      <div
        class="cell"
        on:dblclick={() => handleDoubleClick(i)}
        on:click={() => setCurrentCell(i)}
        on:keydown={(e) => handleKeyDown(e)}
        on:mouseover={() => handleMouseOver(i)}
      >
        <Cell
          {cellContent}
          currentCell={currentCell === i}
          inCurrentLine={currentLine.includes(i)}
        />
      </div>
    {/each}
  </div>
</div>

<style>
  .container {
    display: flex;
    flex-direction: row;
    justify-content: center;
  }

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
