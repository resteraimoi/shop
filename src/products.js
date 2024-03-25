let oldPrice = 250;
let discount = 50;
let newPrice = oldPrice.toFixed(2)-(oldPrice.toFixed(2)/100*(discount))
export const products = {
    id: 1,
    name:"Fall Limited Edition Sneakers",
    oldPrice: '$'.concat(oldPrice.toFixed(2).toString()),
    price: '$'.concat(newPrice.toFixed(2).toString()),
    priceFloat: newPrice,
    discount: (discount.toString()).concat('%'),
    description: "These low-profile sneakers are your perfect casual wear companion. Featuring a durable rubber outer sole, they'll withstand everything the weather can offer.",
    images: [
        "images/image-product-1.jpg",
        "images/image-product-2.jpg",
        "images/image-product-3.jpg",
        "images/image-product-4.jpg"
      ]
}
