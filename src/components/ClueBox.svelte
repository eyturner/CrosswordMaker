<script lang="ts">
    import { clues, grid } from "../stores/stores";

    const updateClue = (event, direction, number) => {
        // Update the clue
        console.log(event);
        const key = event.keycode;
        clues.update(() => {
            let tempClues = $clues;
            tempClues[direction][number] = key;
            return tempClues;
        });
    };

    //TODO: create saving service for clues && dipslay clues at beginning if they exist.
    // Potential: use on:blur as event to save current clues
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
                    on:keydown={(event) => updateClue(event, "across", clueNum)}
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
                    on:keydown={(event) => updateClue(event, "down", clueNum)}
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
