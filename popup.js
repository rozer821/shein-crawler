
document.getElementById('process').style.display = "none";
// grab logic
let grabBtn = document.getElementById("grab");
const imageData = [];
const colorData = [];
const sizeData = [];
// When the button is clicked, extract element from html to current popup page
grabBtn.addEventListener("click", async () => {
  sendMessageToContentScript('', (response) => {
		if(response) {
      
      document.getElementById("title").innerHTML = response.title;
      document.getElementById("price").innerHTML = response.price;
      document.getElementById("sizes").innerHTML = response.sizes;
      document.getElementById("colors").innerHTML = response.colors;
      images = response.images;
      dedupeImages = [...new Set(images)];

      // remove child if exist
      let element = document.getElementById("images");
      while (element.firstChild) {
        element.removeChild(element.firstChild);
      }
      for (let i = 0; i < dedupeImages.length; i ++) {
        // skip null image
        if (dedupeImages[i] == null) {
          continue
        }

        var elem = document.createElement("img");
        elem.setAttribute("src", 'https:' + dedupeImages[i]);
        elem.setAttribute("height", "200");
        elem.setAttribute("width", "100");
        elem.setAttribute("alt", "Flower");
        document.getElementById("images").appendChild(elem);
        imageData.push('https:' + dedupeImages[i]);
      }

      for (let i = 0; i < response.colors.length; i ++) {
        // SHEIN sometimes uses the same color name such as: [multiColor, multiColor]
        // add a suffix to prevent invalid request to Shopify
        if (colorData.includes(response.colors[i])) {
          colorData[i] = response.colors[i] + "_" + i
        } else {
          colorData[i] = response.colors[i]
        }
      }

      for (let i = 0; i < response.sizes.length; i ++) {
        if (sizeData.includes(response.sizes[i])) {
          sizeData[i] = response.sizes[i] + "_" + i
        } else {
          sizeData[i] = response.sizes[i]
        }
      }
    } else {
      // alert user that this page cannot be picked
      alert("wrong page, please go to product detail page to pick products")
    }    
	});
});

function sendMessageToContentScript(message, callback)
{
	getCurrentTabId((tabId) =>
	{
		chrome.tabs.sendMessage(tabId, message, function(response)
		{
			if(callback) callback(response);
		});
	});
}


function getCurrentTabId(callback)
{
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs)
	{
		if(callback) callback(tabs.length ? tabs[0].id: null);
	});
}


// Pick logic
let pickBtn = document.getElementById("pick");
pickBtn.addEventListener("click", async () => {
  if (!document.getElementById("title") || document.getElementById("title").innerHTML.length == 0) {
    alert("you need to grab info first")
    return
  }
  document.getElementById('process').style.display = "block";

  product = {
      product: {
        title: document.getElementById("title").innerText,
        body_html: "<strong>This is a test!</strong>",
        vendor: "WEIHAO",
        variants: [],
        options: [],
        images: [],
      },
  };

  // add color and size option if exist
  if (colorData.length > 0) {
    const color = {
      name:"Color"
    }
    product.product.options.push(color)
  } 
  if (sizeData.length > 0) {
    const size = {
      name:"Size"
    }
    product.product.options.push(size)
  } 

  // SHEIN use webp file to reduce loading time for user, but Shopify
  // doesn't support webp file when upload image. Thankfully, SHEIN also
  // provide jpg file by easily change the extension of file name.
  for (i = 0; i<imageData.length; i ++) {
    product.product.images[i] = {src:imageData[i].replace(".webp",".jpg")}
  }

  // construct variants
  if (colorData.length != 0 && sizeData.length != 0) {
    for (i = 0; i < colorData.length; i ++) {
      for (j = 0; j < sizeData.length; j ++) {
        var dict = {
          option1: colorData[i],
          option2: sizeData[j],
          price: document.getElementById("price").innerText,
        }
        product.product.variants.push(dict)
      }
    }
  } else if (colorData.length != 0 && sizeData.length == 0) {
    for (i = 0; i < colorData.length; i ++) {
      var dict = {
        option1: colorData[i],
        price: document.getElementById("price").innerText,
      }
      product.product.variants.push(dict)
    }
  } else if (colorData.length == 0 && sizeData.length != 0) {
    for (i = 0; i < sizeData.length; i ++) {
      var dict = {
        option1: sizeData[i],
        price: document.getElementById("price").innerText,
      }
      product.product.variants.push(dict)
    }
  }

  // This post should not direct send request to shopify at client side, it should send to server
  // side first as it will expose the credential. However, this is a front-end assignment and also
  // a private app. So we can keep this method.
  postData('https://bwhteststore.myshopify.com/admin/api/2021-07/products.json', product)
  .then(data => {
    product = data.product
    if (product.status = "active" && product.id) {
      alert("Success")
      document.getElementById('process').style.display = "none";
    };
  })
  .catch(error => {
    console.error(error)
    alert(error)
    document.getElementById('process').style.display = "none";
  });
});

function postData(url, data) {
  return fetch(url, {
    credentials: "omit", // required otherwise browser will send cookies to shopify
    body: JSON.stringify(data),
    headers: {
      'Authorization': 'Basic '+ btoa("772f6e28356c886b52ab35cd162cb581"+":"+"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"),
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })
  .then(response => response.json()) // parses response to JSON
}
