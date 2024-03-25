<script>
import './globalStyles.css';
import {products} from './products.js';
export let desktop;
export let cartItems = 0;
let itemsToAdd = 0;
const addItem = () => {
    itemsToAdd++
}
const subtractItem = () => {
    if (itemsToAdd>=1) {
        itemsToAdd--
    }
}
const addToCart = () => {
    if (itemsToAdd>=1) {
        cartItems = itemsToAdd
    }
}
</script>

<div class="{desktop? 'item-outer-desktop' : 'item-outer'}">
    <div class="item-inner">
        <h4 class="{desktop? 'h4 desktop' : 'h4'}">SNEAKER COMPANY</h4>
        <div class="product-name">
            <h2 class="{desktop? 'h2-desktop' : 'h2'}">{products.name}</h2>
        </div>
        
        <p class="description">{products.description}</p>
        <div class="{desktop? 'price-row desktop' : 'price-row'}">
            <div class="price-row-left">
                <h2 class="current-price">{products.price}</h2> 
                <div class="discount">
                   {products.discount}
                </div> 
            </div>

            <div class="{desktop? 'old-price desktop': 'old-price'}">{products.oldPrice}</div> 
        </div>
        <div class="{desktop? 'adder-button-desktop': ''}">
            <div class="items-adder-outer">
                <div class="items-adder">
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <!-- svelte-ignore a11y-no-static-element-interactions -->
                    <div class="svg-area" on:click={() => subtractItem()}>
                        <svg class='plus-minus' width="12" height="4" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><defs><path d="M11.357 3.332A.641.641 0 0 0 12 2.69V.643A.641.641 0 0 0 11.357 0H.643A.641.641 0 0 0 0 .643v2.046c0 .357.287.643.643.643h10.714Z" id="a"/></defs><use fill-rule="nonzero" xlink:href="#a"/></svg>
                    </div>
                    <div class="num-of-items">{itemsToAdd}</div>
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <!-- svelte-ignore a11y-no-static-element-interactions -->
                    <div class="svg-area" on:click={() => addItem()}>
                        <svg class='plus-minus' width="12" height="12" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><defs><path d="M12 7.023V4.977a.641.641 0 0 0-.643-.643h-3.69V.643A.641.641 0 0 0 7.022 0H4.977a.641.641 0 0 0-.643.643v3.69H.643A.641.641 0 0 0 0 4.978v2.046c0 .356.287.643.643.643h3.69v3.691c0 .356.288.643.644.643h2.046a.641.641 0 0 0 .643-.643v-3.69h3.691A.641.641 0 0 0 12 7.022Z" id="b"/></defs><use fill-rule="nonzero" xlink:href="#b"/></svg>
                    </div>
                </div>
            </div>
        
            <button class="button" on:click={() => addToCart()}>
                <svg class="cart-svg" width="22" height="20" xmlns="http://www.w3.org/2000/svg"><path d="M20.925 3.641H3.863L3.61.816A.896.896 0 0 0 2.717 0H.897a.896.896 0 1 0 0 1.792h1l1.031 11.483c.073.828.52 1.726 1.291 2.336C2.83 17.385 4.099 20 6.359 20c1.875 0 3.197-1.87 2.554-3.642h4.905c-.642 1.77.677 3.642 2.555 3.642a2.72 2.72 0 0 0 2.717-2.717 2.72 2.72 0 0 0-2.717-2.717H6.365c-.681 0-1.274-.41-1.53-1.009l14.321-.842a.896.896 0 0 0 .817-.677l1.821-7.283a.897.897 0 0 0-.87-1.114ZM6.358 18.208a.926.926 0 0 1 0-1.85.926.926 0 0 1 0 1.85Zm10.015 0a.926.926 0 0 1 0-1.85.926.926 0 0 1 0 1.85Zm2.021-7.243-13.8.81-.57-6.341h15.753l-1.383 5.53Z" fill="#fff" fill-rule="nonzero"/></svg>
                <p>Add to cart</p>
            </button>
        </div>
    </div>
</div>

<style>
    .item-outer-desktop {
       width: 500px;
    }
    .item-inner {
        padding: 20px;
    }
    .h2 {
        font-size: 1.6rem;
        line-height: 1.1;
    }
    .h2-desktop {
        font-size: 2.5rem;
    }
    .h4 {
        color: var(--orange-clr);
        margin-bottom: 10px;
        font-size: 0.8rem;
        letter-spacing: 0.1rem;
    }
    .h4.desktop {
        margin-bottom: 20px;
    }
    .product-name {
        width: 100%;
    }
    .description {
        color: var(--gray-clr);
        margin: 15px 0 25px;
        line-height: 1.6;
    }

    .old-price {
        color: var(--grayish-blue);
        text-decoration: line-through;
        margin-right: 10px;
    }
    .old-price.desktop {
        margin-top: 20px;
    }
    .price-row > * {
        font-weight: bold;
    }
    .price-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 5px 0;
    }
    .price-row.desktop {
        flex-direction: column;
        align-items: start;
        padding: 5px 0;
    }
    .price-row-left {
        display: flex;
        justify-content: start;
        align-items: center;
    }
    .discount {
        background-color: var(--pale-orange-clr);
        color: var(--orange-clr);
        border-radius: 4px;
        padding: 2px 7px;
        margin-left: 15px;
        height: 25px;
    }
    .adder-button-desktop {
        display: flex;
        align-items: center;
        gap: 20px;
        margin-top: 30px;
    }
    .adder-button-desktop .button{
        flex:3;
        height: 55px;
    }
    .adder-button-desktop .items-adder-outer {
        flex:2;
    }
    .items-adder-outer {
        width: 100%;
        display: flex;
        justify-content: center;
    }
    .items-adder > * {
        display: inline;
    }
    .items-adder {
        margin: 30px 0;
        width: 85%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: bold;
    }
    .svg-area {
        height: 18px;
        width: 18px;
        display: flex;
        align-items: center;
        padding: 2px;
        cursor: pointer;
    }
    .plus-minus {
        fill: #FF7E1B;
    }

    .plus-minus:hover {
        fill: #f7ab70;
    }

    .button > * {
        display: inline;
    }
    .button {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .cart-svg {
        position: relative;
        margin-right: 20px;
    }

</style>