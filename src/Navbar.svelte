<script>
	import {products} from './products.js';
	export let menuVisible;
	export let desktop;

	const menuToggle = () => {
		menuVisible = !menuVisible;
	}

	let cartModalVisible = false
	const cartModalToggle = () => {
		cartModalVisible = !cartModalVisible
	}

	export let cartItems;
	const deleteAll = () => {
		cartItems=0
	}
</script>

	<navbar class="{desktop? 'navbar desktop': 'navbar'}">

		<div class="{desktop? 'navbar-left desktop': 'navbar-left'}">
			{#if !desktop}
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<!-- svelte-ignore a11y-no-static-element-interactions -->
			<!-- svelte-ignore a11y-missing-attribute -->
			<a on:click={menuToggle}>
				<svg width="16" height="15" xmlns="http://www.w3.org/2000/svg"><path d="M16 12v3H0v-3h16Zm0-6v3H0V6h16Zm0-6v3H0V0h16Z" fill="#69707D" fill-rule="evenodd"/></svg>
			</a>
			{/if}
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<div class="navbar-brand-logo">
				<a href="index">
				<svg width="138" height="20" xmlns="http://www.w3.org/2000/svg"><path d="M8.217 20c4.761 0 7.519-.753 7.519-4.606 0-3.4-3.38-4.172-6.66-4.682l-.56-.085-.279-.041-.35-.053c-2.7-.405-3.18-.788-3.18-1.471 0-.478.49-1.331 2.843-1.331 2.455 0 3.493.647 3.493 1.87v.134h4.281v-.133c0-2.389-1.35-5.238-7.774-5.238-5.952 0-7.201 2.584-7.201 4.752 0 3.097 2.763 4.086 7.223 4.675.21.028.433.054.659.081 1.669.197 3.172.42 3.172 1.585 0 1.01-1.615 1.222-3.298 1.222-2.797 0-3.784-.593-3.784-1.92v-.134H.002L0 14.926v.317c.008.79.118 1.913 1.057 2.862C2.303 19.362 4.712 20 8.217 20Zm13.21 0v-7.49c0-2.104.547-4.423 4.176-4.423 3.915 0 3.778 2.777 3.768 4.042V20h4.18v-7.768c0-2.264-.176-7.766-6.732-7.766-2.778 0-4.192.911-5.195 2.28h-.197V4.467H17.22V20h4.207Zm21.959 0c5.094 0 7.787-2.07 8.217-5.405H47.53c-.386 1.02-1.63 1.72-4.143 1.72-2.721 0-3.962-1.03-4.25-3.106h12.527c.24-2.13-.029-5.417-3.026-7.44v.005c-1.312-.915-3.056-1.465-5.251-1.465-5.24 0-8.336 2.772-8.336 7.845 0 5.17 3.02 7.846 8.336 7.846Zm4.099-9.574h-8.188c.486-1.574 1.764-2.431 4.089-2.431 2.994 0 3.755 1.267 4.099 2.431ZM70.499 20V4.457H66.29V6.74h-.176c-1.053-1.377-2.809-2.283-5.677-2.283-6.433 0-7.225 5.293-7.253 7.635v.137c0 2.092.732 7.771 7.241 7.771 2.914 0 4.684-.818 5.734-2.169h.131V20H70.5Zm-8.854-3.623c-3.996 0-4.447-3.032-4.447-4.148 0-1.21.426-4.148 4.455-4.148 3.631 0 4.374 2.044 4.374 4.148 0 2.35-.742 4.148-4.382 4.148ZM88.826 20l-6.529-9.045 6.588-6.488h-5.827l-6.836 6.756V0h-4.187v19.954h4.187V16.94l3.02-2.976L83.6 20h5.226Zm9.9 0c5.094 0 7.786-2.07 8.217-5.405h-4.074c-.387 1.02-1.63 1.72-4.143 1.72-2.721 0-3.962-1.03-4.25-3.106h12.527c.24-2.13-.029-5.417-3.026-7.44v.005c-1.312-.915-3.057-1.465-5.251-1.465-5.24 0-8.336 2.772-8.336 7.845 0 5.17 3.02 7.846 8.336 7.846Zm4.098-9.574h-8.187c.485-1.574 1.763-2.431 4.089-2.431 2.994 0 3.755 1.267 4.098 2.431ZM112.76 20v-6.97c0-2.103.931-4.542 4.05-4.542 1.33 0 2.393.236 2.785.346l.67-3.976c-.728-.16-1.626-.392-2.757-.392-2.665 0-3.622.794-4.486 2.282h-.262V4.466h-4.21V20h4.21Zm17.221 0c4.761 0 7.519-.753 7.519-4.606 0-3.4-3.38-4.172-6.66-4.682l-.56-.085-.279-.041-.349-.053c-2.701-.405-3.181-.788-3.181-1.471 0-.478.49-1.331 2.843-1.331 2.455 0 3.493.647 3.493 1.87v.134h4.282v-.133c0-2.389-1.35-5.238-7.775-5.238-5.952 0-7.201 2.584-7.201 4.752 0 3.097 2.763 4.086 7.224 4.675.21.028.432.054.658.081 1.669.197 3.172.42 3.172 1.585 0 1.01-1.615 1.222-3.298 1.222-2.796 0-3.784-.593-3.784-1.92v-.134h-4.319l-.001.301v.317c.008.79.117 1.913 1.056 2.862 1.246 1.257 3.655 1.895 7.16 1.895Z" fill="#1D2026" fill-rule="nonzero"/></svg>
				</a>
			</div>
			<div class="{desktop? 'navbar-links-desktop': 'navbar-links'} {menuVisible? '' : 'hidden'}">
				<ul>
					{#if !desktop}
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
					<li on:click={menuToggle}>
						<svg width="14" height="15" xmlns="http://www.w3.org/2000/svg"><path d="m11.596.782 2.122 2.122L9.12 7.499l4.597 4.597-2.122 2.122L7 9.62l-4.595 4.597-2.122-2.122L4.878 7.5.282 2.904 2.404.782l4.595 4.596L11.596.782Z" fill="#69707D" fill-rule="evenodd"/></svg>
					</li>
					{/if}
					<div class="{desktop? 'link-list-desktop': 'link-list'}">
						<li><a class="{desktop? 'link-nav': ''}" href="index">Collections</a></li>
						<li><a class="{desktop? 'link-nav': ''}" href="index">Men</a></li>
						<li><a class="{desktop? 'link-nav': ''}" href="index">Women</a></li>
						<li><a class="{desktop? 'link-nav': ''}" href="index">About</a></li>
						<li><a class="{desktop? 'link-nav': ''}" href="index">Contact</a></li>
					</div>
				</ul>
			</div>
		</div>

		
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<div class="navbar-right">
			
			<!-- svelte-ignore a11y-no-static-element-interactions -->
			<div class="{desktop? 'navbar-cart-desktop': 'navbar-cart'}" on:click={cartModalToggle}>
				{#if cartItems>=1}
				<div class="items-cart-count-bg">
					<div class="items-cart-count-num">{cartItems}</div>
				</div>
				
				
				{/if}
				<svg width="22" height="20" xmlns="http://www.w3.org/2000/svg"><path d="M20.925 3.641H3.863L3.61.816A.896.896 0 0 0 2.717 0H.897a.896.896 0 1 0 0 1.792h1l1.031 11.483c.073.828.52 1.726 1.291 2.336C2.83 17.385 4.099 20 6.359 20c1.875 0 3.197-1.87 2.554-3.642h4.905c-.642 1.77.677 3.642 2.555 3.642a2.72 2.72 0 0 0 2.717-2.717 2.72 2.72 0 0 0-2.717-2.717H6.365c-.681 0-1.274-.41-1.53-1.009l14.321-.842a.896.896 0 0 0 .817-.677l1.821-7.283a.897.897 0 0 0-.87-1.114ZM6.358 18.208a.926.926 0 0 1 0-1.85.926.926 0 0 1 0 1.85Zm10.015 0a.926.926 0 0 1 0-1.85.926.926 0 0 1 0 1.85Zm2.021-7.243-13.8.81-.57-6.341h15.753l-1.383 5.53Z" fill="#69707D" fill-rule="nonzero"/></svg>
			</div>
			<div >
				<img class="{desktop? 'navbar-profile-pic-desktop': 'navbar-profile-pic'}" src="images/image-avatar.png" alt="profile pic">
			</div>
				
		<!-- svelte-ignore a11y-click-events-have-key-events -->
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<div class="{desktop? 'cart-modal desktop': 'cart-modal'} {cartModalVisible? '' : 'hidden'}">
				<div class="cart-header">Cart</div>
				<hr class="divider cart"/>
		{#if cartItems<1}
				<div class="cart-content-empty">
					<div class="empty-cart-text">
						<p>Your cart is empty</p>
					</div>
				</div>
		{:else}
				<div class="cart-content">
					<div class="cart-product">
						<img src="{products.images[1]}" alt="product preview" >
						<div class="name-price-count">
							<p>{products.name}</p>
							<p>{products.price} x {cartItems} <span class="sum">${(products.priceFloat*cartItems).toFixed(2)}</span></p>	
						</div>
						<!-- svelte-ignore a11y-no-static-element-interactions -->
						<div class="cart-delete-btn" on:click={() => deleteAll()}>
							<svg width="14" height="16" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><defs><path d="M0 2.625V1.75C0 1.334.334 1 .75 1h3.5l.294-.584A.741.741 0 0 1 5.213 0h3.571a.75.75 0 0 1 .672.416L9.75 1h3.5c.416 0 .75.334.75.75v.875a.376.376 0 0 1-.375.375H.375A.376.376 0 0 1 0 2.625Zm13 1.75V14.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 1 14.5V4.375C1 4.169 1.169 4 1.375 4h11.25c.206 0 .375.169.375.375ZM4.5 6.5c0-.275-.225-.5-.5-.5s-.5.225-.5.5v7c0 .275.225.5.5.5s.5-.225.5-.5v-7Zm3 0c0-.275-.225-.5-.5-.5s-.5.225-.5.5v7c0 .275.225.5.5.5s.5-.225.5-.5v-7Zm3 0c0-.275-.225-.5-.5-.5s-.5.225-.5.5v7c0 .275.225.5.5.5s.5-.225.5-.5v-7Z" id="cart-delete-btn"/></defs><use fill="#C3CAD9" fill-rule="nonzero" xlink:href="#cart-delete-btn"/></svg>
						</div>
					</div>
					<button class="button">Checkout</button>
				</div>			
		{/if}
			</div>
	</div>

	</navbar>
	

	
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	{#if !desktop}
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div class="backdrop-close-menu {menuVisible? '' : 'hidden'}" on:click={menuToggle}></div>
	{/if}

	{#if desktop}
	<div>	
		<hr class="divider"/>
	</div>
	{/if}

	
<style>
	:root {
		--navbar-width: 230px;
	}

	.navbar {
		display: flex;
		height: 40px;
		padding: 20px 20px 45px;
		justify-content: space-between;
	}
	.navbar.desktop {
		min-width: 1200px;
		padding: 40px 40px 45px;
	}
	.divider {
		display: block;
		height: 1px;
		width: 1100px;
		border: 0;
		border-top: 1px solid #ece9e9;
		padding: 0;
		margin-top: -10px;
	}
	.name-price-count {
		display: flex;
		flex-direction: column;
		gap: 7px;
	}
	.navbar-left {
		display: flex;
		width: 50%;
		min-width: 150px; 
	}
	.navbar-left.desktop {
		min-height: 30px;
		min-width: 700px;
	}
	.navbar-right {
		display: flex;
		flex-direction: row;
		align-items: center;
		top: 10px;
		position: relative;
	}
	.navbar-brand-logo {
		margin-left: 10px;
		position: relative;
		top: -3px;
	}
	.navbar-links {
		z-index: 3;
		position: fixed;
		top: 0;
		left: 0;
		height: 100vh;
		width: var(--navbar-width);
		background-color: white;
		line-height: 2.4;
		padding: 20px;
		font-weight: bold;
	}
	.navbar-links-desktop {
		display: flex;
		flex-direction: row;
		font-weight: normal;
		position: relative;
		top: -2px;
		
	}
	.link-list {
		margin-top: 40px;
	}
	.link-list-desktop {
		width: 100%;
		display: flex;
		margin-left: 10%;
		justify-content: space-around;
		gap: 20px;
	}
	.navbar-links a {
		text-decoration: none;
		color: var(--very-dark-blue)
	}
	.navbar-links ul {
		list-style-type: none;
	}
	.navbar-links-desktop a {
		text-decoration: none;
		color: var(--gray-clr);
		font-size: 1.1em;
	}
	.navbar-links-desktop ul {
		list-style-type: none;
	}
	.link-nav:hover::after {
		content: '';
		height: 4px;
		width: 100%;
		background-color: var(--orange-clr);
		display: block;
		position: relative;
		top: 42px;
	}
	.navbar-profile-pic {
		width: 30px;
		height: 30px;
	}
	.navbar-profile-pic-desktop {
		width: 40px;
		height: 40px;
	}
	.navbar-profile-pic-desktop:hover {
		cursor: pointer;
		outline: 2px solid var(--orange-clr);
		border-radius: 50%;	
	}
	.navbar-cart-desktop:hover {
		cursor: pointer;
	}
	.cart-modal {
		z-index: 2;
		position: absolute;
		top: 30px;
		right: -10px;
		height: 250px;
		width: 95vw;
		margin: 10px 0px;
		display: block;
		background-color: white;
		border-radius: 10px;
		min-width: 350px;
	}
	.cart-modal.desktop {
		z-index: 2;
		position: absolute;
		top: 25px;
		right: -100px;
		height: 250px;
		width: 350px;
		margin: 10px 0px;
		background-color: white;
		border-radius: 10px;
		box-shadow: rgba(0, 0, 0, 0.3) 0px 15px 25px 0px;
	}
	.cart-header {
		font-weight: bold;
		margin-bottom: 10px;
		padding: 20px;
	}
	.divider.cart {
		width: 100%;
	}
	.cart-content-empty {
		padding-top: 5px;
		display: flex;
		justify-content: center;
		padding: 20px;
	}

	.empty-cart-text {
		width: 50%;
		top: 30%;
		display: flex;
		justify-content: center;
		position: relative;
		top: 50px;
		font-weight: bold;
	}
	p {
		color: var(--gray-clr);
	}
	.sum {
		color: var(--very-dark-blue);
		font-weight: bold;
	}
	.cart-content {
		padding: 20px 20px;
		
	}
	.cart-content .button {
		margin: 10px 0 20px;
	}

	.cart-product {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		margin: 10px 0;
	}
	.cart-product img {
		position: relative;
		object-fit: cover;
		width: 50px;
		height: 50px;
		border-radius: 5px;
	}
	.cart-delete-btn {
		display: flex;
		flex-direction: column;
		justify-content: center;
		cursor: pointer;
	}

	.navbar-cart {
		position: relative;
		display: flex;
		height: 20px;
		justify-content: end;
		margin-right: 20px;
		margin-left: 40px;
	}
	.navbar-cart-desktop {
		position: relative;
		display: flex;
		height: 20px;
		justify-content: end;
		margin-right: 40px;
		margin-left: 40px;
	}
	.items-cart-count-bg {
		position: absolute;
		left: 15px;
		top: -5px;
		width: 18px;
		height: 15px;
		border-radius: 30%;
		background-color: var(--orange-clr);
		display: flex;
		justify-content: center;
	}
	.items-cart-count-num {
		position: relative;
		font-size: 0.7rem;
		color: white;
	}

	.backdrop-close-menu {
		content: "";
		position: fixed;
		top: 0;
		width: 100vw;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.7);
		z-index: 2;
	}
	.hidden {
		display: none
	}
</style>