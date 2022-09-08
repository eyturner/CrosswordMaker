<script lang="ts">
    import { clues, grid } from "../stores/stores";
    import { setClues } from "../services/storageService";

    import type { Clues } from "../common/types";

    const saveClues = (
        event,
        direction: string,
        number: number | string
    ): void => {
        let newClue: string = event.target.value;
        clues.update((): Clues => {
            let tempClues = $clues;
            tempClues[direction][number] = newClue;
            return tempClues;
        });
        setClues($clues);
    };
</script>

<div class="clueContainer">
    <div class="clues">
        <h5>Across</h5>
        {#each Object.keys($clues.across) as clueNum}
            <div>
                <label for="clueNum">{clueNum}.</label>
                <input
                    type="text"
                    id="clueNum"
                    placeholder="Clue for {clueNum} across"
                    class="clue"
                    value={$clues.across[clueNum]}
                    on:keyup={(event) => saveClues(event, "across", clueNum)}
                />
            </div>
        {/each}
    </div>
    <div class="clues">
        <h5>Down</h5>
        {#each Object.keys($clues.down) as clueNum}
            <div>
                <label for="clueNum">{clueNum}.</label>
                <input
                    type="text"
                    id="clueNum"
                    placeholder="Clue for {clueNum} down"
                    class="clue"
                    on:keyup={(event) => saveClues(event, "down", clueNum)}
                />
            </div>
        {/each}
    </div>
</div>

<style>
    .clueContainer {
        display: flex;
        justify-content: center;
        overflow: scroll;
        margin-top: 5vh;
    }

    .clues {
        max-height: 50vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        padding: 0 2vw;
    }

    .clue {
        outline: 0;
        border-width: 0 0 2px;
        border-color: black;
        width: 35vw;
    }

    .clues > h5 {
        margin: 0;
    }

    label {
        display: inline;
    }
</style>
