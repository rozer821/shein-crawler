// receive pop up message and return product info
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse)
{
    imageCollections = document.getElementsByClassName("swiper-wrapper")[0].getElementsByTagName("img");
    let images = new Array(imageCollections.length);
    for (let i = 0; i < imageCollections.length; i ++) {
        images[i] = imageCollections[i].getAttribute("data-src"); // use data-src instead of src to prevent dynamic loading
    }

    colorCollections = document.getElementsByClassName("product-intro__color-radio")
    let colors = new Array(colorCollections.length)
    for (let i = 0; i < colorCollections.length; i ++) {
        colors[i] = colorCollections[i].ariaLabel
    }
    
    sizeCollections = document.getElementsByClassName("product-intro__size-radio")
    let sizes = new Array(sizeCollections.length)
    for (let i = 0; i < sizeCollections.length; i ++) {
        sizes[i] = sizeCollections[i].ariaLabel
    }

    if (document.getElementsByClassName("product-intro__head-name").length) {
        var product = {
            title: document.getElementsByClassName('product-intro__head-name')[0].innerHTML,
            images: images,
            price: document.getElementsByClassName("from")[0].innerText,
            colors: colors,
            sizes: sizes,
        }
        sendResponse(product);
    }
});

