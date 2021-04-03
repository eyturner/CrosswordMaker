<script lang="ts">
  import Cell from "./Cell.svelte";
  import { setGrid } from "../services/storageService";
  import { grid, currentCell, currentLine } from "../stores/stores";

  // The size of a standard NYT Puzzle
  const size = 15;

  // acrossAxis is a boolean to determine current writing direction
  let acrossAxis = true;

  let deleteMode = false;

  let mouseDown = false;

  const updateGridCell = (cellNumber, cellProps) => {
    // console.log(`Params: cellNumber: ${cellNumber}, letter: ${cellProps.letter}, number: ${cellProps.number}, isBlackSquare: ${cellProps.isBlackSquare}`);
    grid.update(tempGrid => {
      tempGrid = $grid;
      tempGrid.splice(cellNumber, 1, {
      letter: cellProps.letter !== null ? cellProps.letter : tempGrid[cellNumber].letter,
      isBlackSquare: cellProps.isBlackSquare !== null ? cellProps.isBlackSquare : tempGrid[cellNumber].isBlackSquare,
      number: cellProps.number !== null ? cellProps.number : tempGrid[cellNumber].number,
    });
    // console.log("GRID[CC] is now:", tempGrid[cellNumber]);
    return tempGrid;
    });
  }

  const changeCellFill = (cellNumber) => {
    const cellIsBlack = $grid[cellNumber].isBlackSquare;

    const newData = { 
      letter: "", 
      number: "",
      isBlackSquare: !cellIsBlack
    };
    
    updateGridCell(cellNumber, newData);
    updateGridCell($grid.length - 1 - cellNumber, newData);

    currentLine.set(determineCurrentLine());
    setGrid($grid);
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
            ? getCol($currentCell - i) === 0
            : getRow($currentCell - i) === 0
        )
          min = $currentCell - i;
        else if ($grid[$currentCell - i].isBlackSquare) min = $currentCell - i;
      }
      if (max == undefined) {
        // Max boundary conditions
        if (
          acrossAxis
            ? getCol($currentCell + i) === size - 1
            : getRow($currentCell + i) === size - 1
        ) {
          max = $currentCell + i;
        }
        else if ($grid[$currentCell + i].isBlackSquare) {
          max = $currentCell + i;
        }
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

  const handleClick = (cellNumber) => {
    setCurrentCell(cellNumber);
    setTimeout(function() {
      if(mouseDown) {
        changeCellFill(cellNumber);
      }
    }, 200);
  }

  const setCurrentCell = (cellNumber: number) => {
    currentCell.set(mod(cellNumber, size * size));
    currentLine.set(determineCurrentLine());
  };

  const mod = (m, n) => {
    return ((m % n) + n) % n;
  };

  // moveRight: move(0,1), moveLeft: move(0,-1), moveUp: move(0,-size), moveDown: move(0,size)
  const move = (acc, inc) => {
    if ($grid[mod($currentCell + acc + inc, size * size)].isBlackSquare) {
      move(acc + inc, inc);
    } else if ($currentCell + acc + inc <= 0) {
      setCurrentCell(0);
    } else {
      setCurrentCell($currentCell + acc + inc);
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
      updateGridCell($currentCell, {...$grid[$currentCell], letter: ""});
      move(0, acrossAxis ? -1 : -size);
    } else if ($grid[$currentCell].letter) {
      updateGridCell($currentCell, {...$grid[$currentCell], letter: ""});
    } else move(0, acrossAxis ? -1 : -size);
    deleteMode = true;
    setGrid($grid);
  };

  const handleKeyDown = (event) => {
    if ($grid[$currentCell].isBlackSquare) {
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
      updateGridCell($currentCell, {...$grid[$currentCell], letter: event.key})
      move(0, acrossAxis ? 1 : size);
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
      move(0, acrossAxis ? 1 : size);
    }
  };

  const handleMouseOver = (cellNumber) => {
    if (mouseDown) {
      changeCellFill(cellNumber);
    }
  };
</script>

<div class="container">
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
        <Cell
          {cellContent}
          currentCell={$currentCell === i}
          inCurrentLine={$currentLine.includes(i)}
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
