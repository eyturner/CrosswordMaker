<script>
    const onExport = () => {
        console.log("Exporting...");
    }

    const onGenerateNumbers = () => console.log("Generating Numbers...");
</script>

<div class="container">
    <button on:click={() => onExport()}>Export</button>
    <button on:click={() => onGenerateNumbers()}>Generate Numbers</button>
</div>

<style>
    .container {
        display: flex;
        flex-direction: column;
        justify-content: center;
    }
</style>