<script lang="ts">
    import { currentLine, grid, currentCell, clues } from "../stores/stores";

    const gridHasNumbers = () => {
        $grid.forEach((cell) => {
            if (cell.number !== "") {
                return true;
            }
        });

        return false;
    };
</script>

<style>
</style>
