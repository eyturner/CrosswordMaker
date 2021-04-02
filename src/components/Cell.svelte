<script lang="ts">
  export let cellContent;
  export let currentCell;
  export let inCurrentLine;
</script>

<div
  tabindex="-1"
  class="{cellContent.isBlackSquare
    ? 'cell fill'
    : 'cell'} 
        {inCurrentLine ? 'inCurrentLine' : ''}"
  id={currentCell ? "currentCell" : ""}
>
  <h3>
    {cellContent.letter}
  </h3>
</div>

<style>
  .cell {
    height: 34px;
    width: 34px;
    border: 1px solid black;
    display: inline-flex;
    justify-content: center;
    align-items: center;
  }

  #currentCell {
    background: rgba(241, 227, 29, 0.932);
  }

  .fill {
    background: black !important;
  }

  .inCurrentLine {
    background: rgba(112, 136, 241, 0.836);
  }

  h3 {
    padding: 0px;
    margin: 0px;
    border: none;
    border-radius: 0px;
    text-align: center;
    text-transform: uppercase;
  }

  *:focus {
    outline: none;
  }
</style>
