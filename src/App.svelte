<script lang="ts">
    import Grid from "./components/Grid.svelte";
    import Navbar from "./components/Navbar.svelte";
    import Sidebar from "./components/Sidebar.svelte";
    import Subheader from "./components/Subheader.svelte";
    import ClueBox from "./components/ClueBox.svelte";

    /* Listing all things to be done/fixed:
        TODO: Implement Typescript fully
        TODO: Add modal for "How to Use"
        TODO: Add rule checking in modal (checkboxes for all rules)
        TODO: Implement export to PDF
        FIXME:
        BUG:
        COMPLETE:
    */
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
