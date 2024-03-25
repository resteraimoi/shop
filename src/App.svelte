<script>
	import Navbar from './Navbar.svelte';
	import Carousel from './Carousel.svelte';
	import ItemDesc from './ItemDesc.svelte';

	import './globalStyles.css';
	let cartItems = 0;

	let windowSize = window.innerWidth;
	let menuVisible = windowSize >= 376;
	let desktop = windowSize >= 376;

	const handleResize = () => {
		windowSize = window.innerWidth;
		desktop = windowSize >= 376;
		menuVisible = windowSize >= 376;
	}
</script>

<svelte:window on:resize={handleResize} />

<div class="{desktop? 'desktop-view': 'mobile-view'}">
	<Navbar bind:cartItems={cartItems} bind:desktop={desktop} bind:menuVisible={menuVisible}/>
	<div class="{desktop? 'content-desktop': 'content-mobile'}">
		<div class="{desktop? 'Carousel-desktop': 'Carousel'}">
			<Carousel bind:desktop={desktop}/>
		</div>
		<div class="{desktop? 'ItemDesc-desktop': 'ItemDesc'}">
			<ItemDesc bind:desktop={desktop} bind:cartItems={cartItems}/>
		</div>
	</div>
</div>

<style>
	.mobile-view {
		display: flex;
		flex-direction: column;
	}
	.desktop-view {
		width: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		min-width: 1200px;
		gap: 30px;
	}
	.content-desktop {
		display: flex;
		justify-content: center;
		align-items: center;
		min-width: 1200px;
		gap: 80px;
		padding: 30px 0px; 
	}
	.content-mobile {
		display: flex;
		flex-direction: column;
	}
	.Carousel{
		display: flex;
		justify-content: center;
	}
</style>