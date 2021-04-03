<script lang="ts">
	import Grid from './components/Grid.svelte'
	import Navbar from './components/Navbar.svelte'
</script>

<main>
	<Navbar />
	<div class="container">
		<Grid />
	</div>
</main>

<style>
	.container {
		display: flex;
		flex-direction: row;
		justify-content: center;
	}
</style>