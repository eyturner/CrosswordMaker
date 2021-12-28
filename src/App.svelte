<script lang="ts">
    import Grid from "./components/Grid.svelte";
    import Navbar from "./components/Navbar.svelte";
    import Sidebar from "./components/Sidebar.svelte";
    import Subheader from "./components/Subheader.svelte";
    import ClueBox from "./components/ClueBox.svelte";
</script>

<main>
    <Navbar />
    <Subheader />
    <div class="container">
        <Grid />
        <Sidebar />
    </div>
    <ClueBox />
</main>

<style>
    .container {
        display: flex;
        flex-direction: row;
        justify-content: space-evenly;
    }
</style>
