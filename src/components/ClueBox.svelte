<script lang="ts">
    import { clues, grid } from "../stores/stores";
    import { setClues } from "../services/storageService";

    const updateClue = (event, direction, number) => {
        // Update the clue
        console.log(event);
        const key = event.key;
        clues.update(() => {
            let tempClues = $clues;
            tempClues[direction][number] += key;
            return tempClues;
        });
    };

    const saveClues = (event, direction, number) => {
        console.log(event);
        clues.update(() => {
            let tempClues = $clues;
        });
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
                    on:blur={(event) => saveClues(event, "across", clueNum)}
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
                    on:blur={(event) => saveClues(event, "down", clueNum)}
                />
            </div>
        {/each}
    </div>
</div>

<style>
    .clueContainer {
        display: flex;
        justify-content: center;
        max-height: 50 vh;
        overflow: scroll;
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

    label {
        display: inline;
    }
</style>
