<script lang="ts">
    import Buttons from '../components/Buttons.svelte'
</script>

<div class="container">
    <div class="title">
        <h1>Crossword Maker</h1>
        <h4>By Eli Turner</h4>
    </div>
    <Buttons />
</div>

<style>
    .container {
        height: 20vh;
        border: 1px solid black;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0px 10vw;
        margin-bottom: 2vh;
    }

    h1, h4 {
        font-family: "Franklin Gothic Medium", "Franklin Gothic";
    }
</style>
