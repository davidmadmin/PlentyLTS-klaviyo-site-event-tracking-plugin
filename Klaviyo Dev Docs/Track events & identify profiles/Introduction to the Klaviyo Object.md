# Introduction to the `klaviyo` object



Learn more about the new `klaviyo` JavaScript object, which offers full support for callbacks and promises.



Source: https://developers.klaviyo.com/en/docs/introduction_to_the_klaviyo_object



---



## What is the `klaviyo` object?



The new `klaviyo` object replaces the legacy `_learnq` and `klOnsite` objects. These JavaScript objects offer a shorthand way to interact with Klaviyo APIs and send events into Klaviyo with event tracking.



The `klaviyo` object provides:



\- Robust support for asynchronous JavaScript implementations

\- Support for callbacks and promises

\- Compatibility with existing `klOnsite` functionality



This includes:



\- Opening signup forms with custom triggers

\- Executing end-user provided callbacks

\- Providing better control over when forms are displayed



`klaviyo.js`, also known as Klaviyo’s **Active on Site JavaScript**, automatically supports the `klaviyo` object. If you enable an integration with your Klaviyo account or manually install `klaviyo.js`, you can initiate `klaviyo` to listen for relevant calls.



---



## How to load the `klaviyo` object



To use the `klaviyo` object immediately on page load, it is recommended to manually install the snippet on your site.



This snippet exists **in addition to Klaviyo's onsite script**.



The `klaviyo` object only needs to be loaded **once per page**.



```javascript

!function(){if(!window.klaviyo){window.\_klOnsite=window.\_klOnsite||\[];try{window.klaviyo=new Proxy({},{get:function(n,i){return"push"===i?function(){var n;(n=window.\_klOnsite).push.apply(n,arguments)}:function(){for(var n=arguments.length,o=new Array(n),w=0;w<n;w++)o\[w]=arguments\[w];var t="function"==typeof o\[o.length-1]?o.pop():void 0,e=new Promise((function(n){window.\_klOnsite.push(\[i].concat(o,\[function(i){t\&\&t(i),n(i)}]))}));return e}}})}catch(n){window.klaviyo=window.klaviyo||\[],window.klaviyo.push=function(){var n;(n=window.\_klOnsite).push.apply(n,arguments)}}}}();

```



---



## Callback support



Klaviyo provides full callback support, giving developers more control over the order in which functions are executed.



Callbacks are invoked with a return value.



Example: identifying a cookied user **without a callback**:



```javascript

klaviyo.identify({});

```



Example: identifying a user **with a callback**, then tracking an event.



```javascript

function myCallback() {

     var item = {

       "ProductName": item.ProductName,

       "ProductID": item.ProductID,

       "SKU": item.SKU,

       "Categories": item.Categories,

       "ImageURL": item.ImageURL,

       "URL": item.URL,

       "Brand": item.Brand,

       "Price": item.Price,

       "CompareAtPrice": item.CompareAtPrice

     };



     klaviyo.track("Viewed Product", item);

}



klaviyo.identify({

     "email": "\[email protected]"

}, myCallback);

```



This approach allows you to:



\- Identify the customer

\- Immediately track an onsite event

\- Avoid reloading the page



---



## Promise support



The `klaviyo` object also supports **Promises**, which provide a cleaner way to handle asynchronous operations.



Promises help reduce the complexity of nested callbacks and simplify your code.



Example:



```javascript

klaviyo.identify({})

     .then(() => console.log("Identify has been completed"));

```



When the identify call completes, the promise resolves.



---



## Supported methods



The `klaviyo` object supports several methods for interacting with Klaviyo APIs.



Optional parameters are represented with `?`.



The documentation continues with the specific method list on the page.
