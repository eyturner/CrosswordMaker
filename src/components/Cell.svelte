<script lang="ts">
    export let cellContent;
    export let currentCell;
    export let inCurrentLine;
</script>

<div
    tabindex="-1"
    class="{cellContent.isBlackSquare ? 'cell fill' : 'cell'} 
        {inCurrentLine ? 'inCurrentLine' : ''}"
    id={currentCell ? "currentCell" : ""}
>
    <p class={cellContent.number ? "clueNumber" : "blankNumber"}>
        {cellContent.number || "."}
    </p>
    <h3>
        {cellContent.letter}
    </h3>
</div>

<style>
    .cell {
        height: 34px;
        width: 34px;
        border: 1px solid black;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
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

    .clueNumber {
        font-size: 8px;
        position: relative;
        margin: 0px;
        left: -10px;
        user-select: none;
    }

    .blankNumber {
        font-size: 8px;
        position: relative;
        margin: 0px;
        left: -10px;
        color: transparent;
        user-select: none;
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
