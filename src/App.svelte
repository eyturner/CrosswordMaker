<script lang="ts">
	import Grid from "./components/Grid.svelte";
	import Navbar from "./components/Navbar.svelte";
	import Sidebar from "./components/Sidebar.svelte";
</script>

<main>
	<Navbar />
	<div class="container">
		<Grid />
		<Sidebar />
	</div>
</main>

<style>
	.container {
		display: flex;
		flex-direction: row;
		justify-content: space-evenly;
	}
</style>
