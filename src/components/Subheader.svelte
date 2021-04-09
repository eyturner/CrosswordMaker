<script lang="ts">
  import { currentLine, grid, currentCell, size } from "../stores/stores";
  import { setGrid } from "../services/storageService";

  const handleClear = () => {
    grid.set(
      Array.from({ length: size * size }, () => ({
        letter: "",
        isBlackSquare: false,
        number: "",
      }))
    );
    currentCell.set(null);
    currentLine.set([]);
    setGrid($grid);
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
