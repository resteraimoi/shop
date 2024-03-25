<script>
  let slides = 0;
  import {products} from './products.js';
  export let desktop;

  const images = products.images;

  function handleButtonClick(offset) {
    slides = (slides + offset + images.length) % images.length;
  }
  function previewClicker(index) {
    slides = index;
  }
  let imgModalVisible = false
  const imgModalToggle = () => {
    if (desktop) {
        imgModalVisible = !imgModalVisible;
    }
  }
  function handleEscKey(event) {
    if (event.key === "Escape") {
      imgModalVisible = false;
    }
  }
  document.addEventListener("keydown", handleEscKey);

</script>


<div class="{desktop? 'hidden' : 'buttons'}">
    <button class="arrow-circle" on:click={() => handleButtonClick(-1)}>
        <svg class="arrow-sign-left" width="12" height="18" xmlns="http://www.w3.org/2000/svg"><path d="M11 1 3 9l8 8" fill="none" fill-rule="evenodd"/></svg>
    </button>
    <button class="arrow-circle" on:click={() => handleButtonClick(1)}>
        <svg class="arrow-sign-right" width="12" height="18" xmlns="http://www.w3.org/2000/svg"><path d="m2 1 8 8-8 8" fill="none" fill-rule="evenodd"/></svg>
    </button>
</div>

{#if desktop}
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="modal-outer {imgModalVisible? '' : 'hidden'}">
    <div class="modal-inner">
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div class="close-icon" on:click={imgModalToggle}>
            <svg class="close-icon-svg" xmlns="http://www.w3.org/2000/svg"><path d="m11.596.782 2.122 2.122L9.12 7.499l4.597 4.597-2.122 2.122L7 9.62l-4.595 4.597-2.122-2.122L4.878 7.5.282 2.904 2.404.782l4.595 4.596L11.596.782Z" /></svg>
        </div>
        <div class="modal-img">
            {#each images as imageURL, index (index)}
            <li class="{desktop? 'product-image-desktop': 'product-image'}" class:active={index === slides}>
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <img src={imageURL} alt={`product #${index + 1}`}/>
            </li>
            {/each}
            <div class="buttons-desktop">
                <button class="arrow-circle" on:click={() => handleButtonClick(-1)}>
                    <svg class="arrow-sign-left" width="12" height="18" xmlns="http://www.w3.org/2000/svg"><path d="M11 1 3 9l8 8" stroke-width="3" fill="none" fill-rule="evenodd"/></svg>
                </button>
                <button class="arrow-circle" on:click={() => handleButtonClick(1)}>
                    <svg class="arrow-sign-right" width="12" height="18" xmlns="http://www.w3.org/2000/svg"><path d="m2 1 8 8-8 8" stroke-width="3" fill="none" fill-rule="evenodd"/></svg>
                </button>
            </div>
        </div>

        <div class="modal-preview-outer">
            <div class="modal-preview-inner">
                    {#each images as imageURL, index (index)}
                        <!-- svelte-ignore a11y-no-static-element-interactions -->
                        <div class="preview-product-desktop" class:active={index === slides} on:click={() => previewClicker(index)}>
                            <img class="img-preview" src={imageURL} alt={`product`}  />
                        </div>
                    {/each}
            </div>
        </div>
    </div>
</div>
{/if}

<div class={desktop? 'carousel-desktop': 'carousel'}>
    <div class={desktop? 'pictures-desktop': 'pictures'}>
        <ul>
            {#each images as imageURL, index (index)}
            <li class="{desktop? 'product-image-desktop': 'product-image'}" class:active={index === slides}>
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                <img src={imageURL} alt={`product #${index + 1}`} on:click={imgModalToggle}/>
            </li>
            {/each}
        </ul>   
    </div>

    {#if desktop}
    <div class="preview-outer">
        <div class="preview-inner">
                {#each images as imageURL, index (index)}
                    <!-- svelte-ignore a11y-no-static-element-interactions -->
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <div class="preview-product-desktop" class:active={index === slides} on:click={() => previewClicker(index)}>
                        <img class="img-preview" src={imageURL} alt={`product`} />
                    </div>
                {/each}

        </div>
    </div>
    {/if}
</div>



<style>
    :root {
        --picture-height: 35dvh;
    }

    .modal-outer {
        position: fixed;
        width: 100%;
        height: 100%;
        overflow: auto;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 3;
        top: 0;
        left: 0;
        background-color: rgba(0, 0, 0, 0.7);
    }
    .modal-inner {
        position: absolute;
        display: flex;
        flex-direction: column;
    }
    .modal-img{
        width: 500px;
        height: 500px;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .modal-img img {
        border-radius: 20px;
    }
    .carousel {
        height: var(--picture-height);
        width: 100%;
    }
    .pictures {
        height: var(--picture-height);
        display: flex;
        justify-content: center;
    }
    ul {
        height: 100%;
        width: 100%;
        overflow: hidden;
        position: relative;
    }
    li {
        list-style-type: none;
        position: relative;
    }
    .carousel-desktop {
        display: flex;
        flex-direction: column;
        height: 650px;
        justify-content: space-between;
        min-width: 600px;
        width: 100%;
        padding: 20px;
    }
    .product-image-desktop,.product-image {
        position: relative;
        display: none;
    } 
    .pictures-desktop {
        height: 100%;
        display: flex;
        justify-content: center;
    }
    .product-image > img {
        display: block;
        width: 100vw;
        height: var(--picture-height);
        object-fit: cover;
        position: relative; 
    }
    .product-image-desktop > img {
        display: block;
        width: 100%;
        height: 500px;
        object-fit: cover;
        position: relative;
        border-radius: 20px; 
    }
    .product-image-desktop.active {
        display: block;
    }
    .product-image.active {
        display: block;
    }
    .modal-preview-outer, .preview-outer {
        padding: 40px 0px;
    }
    .modal-preview-inner,.preview-inner {
        display: flex;
        flex-direction: row;
        justify-content: space-between;   
    }
    .modal-preview-outer {
        display: flex;
        justify-content: center;
    }
    .modal-preview-inner {
        width: 90%;
    }
    .preview-product-desktop {
        position: relative;
        overflow: hidden;
        border: none;
        border-radius: 15px;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
    }
    .preview-product-desktop.active {
        height: 100px;
        width: 100px;
        overflow: hidden;
        border: solid var(--orange-clr);
    }
    .preview-product-desktop.active::before {
        content: "";
        z-index: 2;
        display: block;
        position: absolute;
        height: 100vh;
        top: 0;
        left: 0;
        right: 0;
        background: rgba(255, 255, 255, 0.7);
    }

    .preview-product-desktop:hover::before {
        content: "";
        z-index: 2;
        display: block;
        position: absolute;
        height: 100%;
        top: 0;
        left: 0;
        right: 0;
        background: rgba(255, 255, 255, 0.4);
    }

    .img-preview {
        height: 100px;
        width: 100px;
    }

    .close-icon {
        position: relative;
        margin-bottom: 25px;
        fill: white;
        cursor: pointer;
        display: flex;
        justify-content: end;
    }
    .close-icon-svg {
        height: 15px;
        width: 15px;
        transform: scale(1.3);
    }
    .close-icon-svg:hover {
        fill: var(--orange-clr)
    }


/* arrow buttons */
    .buttons {
        display: flex;
        justify-content: space-between;
        position: absolute;
        width: 90%;
        top: calc(var(--picture-height)/1.6);
    }
    .buttons-desktop {
        width: 110%;
        display: flex;
        justify-content: space-between;
        position: absolute;
    }
    .arrow-circle {
        position: relative;
        z-index: 1;
        cursor: pointer;
        height: 40px;
        width: 40px;
        border-radius: 50%;
        background-color: white;
        border-color: white;
        border-style: solid;
    }
    .buttons-desktop .arrow-circle {
        height: 50px;
        width: 50px;
    }

    .arrow-sign-right, .arrow-sign-left {
        position: relative;
        stroke: #1D2026;
        transform: scale(0.8);
        stroke-width: 4
    }
    .buttons-desktop .arrow-sign-right,
    .buttons-desktop .arrow-sign-left {
        transform: scale(0.9);
    }

    .arrow-sign-right{
        left: 1px;
        top: 2px;
    }
    .arrow-sign-left{
        left: -1px;
        top: 2px;
    }

    /* animation and hover */
    .arrow-circle:active .arrow-sign-right{
        transform: translateX(10px);  
    }
    .arrow-circle:active .arrow-sign-left{
        transform: translateX(-10px);  
    }
    .buttons-desktop .arrow-sign-right:hover,.buttons-desktop .arrow-sign-left:hover {
        stroke: var(--orange-clr);
    }

    .hidden {
		display: none
	}
</style>