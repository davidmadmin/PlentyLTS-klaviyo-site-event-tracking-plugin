# Integrate an E-Commerce Platform Without a Pre-Built Klaviyo Integration

Learn how to integrate a platform without a pre-built Klaviyo integration.



If you’re using an ecommerce platform not currently supported by one of Klaviyo’s \[pre-built integrations](https://help.klaviyo.com/hc/en-us/categories/115000032731-Ecommerce-Integrations) or \[partner integrations](https://connect.klaviyo.com/integrations), or you’ve built your own custom solution, you can integrate with Klaviyo using our APIs, which enable, for example:



\- Onsite activity tracking with the \[JavaScript API](https://developers.klaviyo.com/en/docs/javascript_api).

\- Managing lists and segments with the \[server-side API](https://developers.klaviyo.com/en/reference/api_overview).

\- Creating and managing custom \[catalogs](https://developers.klaviyo.com/en/docs/guide_to_syncing_a_custom_catalog_feed_to_klaviyo).



> **📘**

> 

> 

> Check out our video on how to \[use Klaviyo's JavaScript for onsite tracking](https://www.youtube.com/watch?v=O2oHTGpBdlQ\&list=PLHkNfHgtxcUanrkMnKPdkRzuWU7MGv_xM\&index=3).

> 



## Key integration components



The key components of integrating this type of ecommerce solution are:



\- **Customer data**Tracking information such as name, email, phone number, or other profile attributes.

\- **Website activity**Tracking who is active on your site, what products they view, etc.

\- **Order activity**Tracking when a customer places an order, what products are ordered, etc.

\- **Products**The items in your catalog.



## About JavaScript and server-side event APIs



This guide focuses on how to sync important metrics, or key customer activities, to Klaviyo. These events can be created in the browser with the \[JavaScript API](https://developers.klaviyo.com/en/docs/javascript_api) and on the backend with the \[server-side API](https://developers.klaviyo.com/en/reference/api_overview).



> **🚧**

> 

> 

> It's important that you map your metrics for event tracking in the \[account-level mapping section](https://help.klaviyo.com/hc/en-us/articles/25829057055899). Klaviyo's predictive analytics for measuring \[customer lifetime value](https://help.klaviyo.com/hc/en-us/articles/17797865070235) (CLV) and Benchmarks tool rely on this mapping to calculate predictive analytics and revenue-based performance.

> 



Use our JavaScript API to track customer actions during a browsing session:



\- **Active on Site**When someone visits your website.

\- **Viewed Product**When someone views a product.

\- **Added to Cart**When someone adds an item to their cart.

\- **Started Checkout**When someone lands on the checkout page.



Use our server-side API for events that happen on the backend, starting with when a customer places an order:



\- **Placed Order**When an order successfully processes on your system.

\- **Ordered Product**An event for each item in a processed order.

\- **Fulfilled Order**When an order is sent to the customer.

\- **Canceled Order**When an order is canceled.

\- **Refunded Order**When a customer’s order is refunded.



Use our custom catalog feed for the following:



\- **Catalog Feed**An XML or JSON feed of your product catalog.



> **🚧**

> 

> 

> For populating your Klaviyo product catalog, you can use either a custom catalog feed or the new \[catalog API](https://developers.klaviyo.com/en/reference/get_catalog_items). You can only populate products using one option. To shift from a custom catalog feed to the new catalog API you must first disable the existing custom catalog feed before using the API.

> 



The level of detail in the data you send within these events will determine how you can filter and segment based on these events in Klaviyo. To understand how data must be structured so that key event details are available for segmentation, check out our articles on \[segment conditions](https://help.klaviyo.com/hc/en-us/articles/115005062847-Understand-the-Data-Available-for-Segmentation) and \[how to structure your data for segment and flow filters](https://developers.klaviyo.com/en/docs/custom_integration_faqs#how-should-i-structure-my-data-for-segmentation-and-flow-filtering).



> **🚧**

> 

> 

> Note that the code snippets in this guide use example data. You will need to update the values of the JSON properties in these snippets so that they dynamically pull from the relevant information needed for that property.

> 



Check out our \[Custom integration FAQ](https://developers.klaviyo.com/en/docs/custom_integration_faqs) for questions about custom integrations.



## JavaScript Track API for onsite metrics



## Active on Site tracking snippet



To be able to publish forms directly from Klaviyo to your site, add the following JavaScript snippet so it appears on every page on your website (the end of the footer is often a good place to add it). Make sure to replace `PUBLIC_API_KEY` with your Klaviyo account's six character \[public API key](https://help.klaviyo.com/hc/en-us/articles/115005062267-How-to-Manage-Your-Account-s-API-Keys):




```javascript
<script type="text/javascript" async=""

src="https://static.klaviyo.com/onsite/js/PUBLIC_API_KEY/klaviyo.js"></script>;
```



Once you’ve added the snippet above, an \*Active on Site\* metric will trigger for any person who is cookied. A browser can be cookied in any of the ways listed in our \[article on Klaviyo onsite tracking](https://help.klaviyo.com/hc/en-us/articles/115005076767-Klaviyo-Web-Tracking#who-klaviyo-tracks1).



## Initialize the klaviyo object



Ensure that you have \[initialized the klaviyo object](https://developers.klaviyo.com/en/docs/introduction_to_the_klaviyo_object#how-to-load-the-klaviyo-object) on your page before executing any of the following code snippets.



## Viewed Product tracking snippet



If you'd like to set up a \[browse abandonment flow](https://help.klaviyo.com/hc/en-us/articles/115002775252-Create-a-Browse-Abandonment-Flow) or build segments based on product browsing activity, you'll need to add JavaScript event tracking for the \*Viewed Product\* metric. All \*Viewed Product\* metrics are tied to user profiles. Add the following snippet to your product page template or associated JavaScript:



> **📘**

> 

> 

> Make sure to replace `item.___` in the below code snippet with whatever item object your platform uses for product properties.

> 




```javascript
<script type="text/javascript">

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

</script>
```



Make sure to update the values of the JSON properties in the snippet so that they dynamically pull from the relevant information needed for that property.



Additionally, there is another snippet that allows entries to be added to a “Recently Viewed Items” table for a profile. Calling the Klaviyo object's `trackViewedItem` function below will populate a product feed of recently viewed products that can be included in emails. For more information on how to use the “Recently Viewed Items” feature in a template, check out our article on \[inserting recently viewed items into an email](https://help.klaviyo.com/hc/en-us/articles/360019921772-How-to-Insert-Recently-Viewed-Items-into-an-Email).



The following snippet can be added directly below the \*Viewed Product\* snippet:




```javascript
<script type="text/javascript">

      klaviyo.trackViewedItem({

        "Title": item.ProductName,

        "ItemId": item.ProductID,

        "Categories": item.Categories,

        "ImageUrl": item.ImageURL,

        "Url": item.URL,

        "Metadata": {

          "Brand": item.Brand,

          "Price": item.Price,

          "CompareAtPrice": item.CompareAtPrice

        }

      });

</script>
```



## Added to Cart tracking snippet



If you’d like to send abandoned cart emails to visitors who add items to their cart, but don’t make it to the checkout page, you’ll need to track an \*Added to Cart\* metric. A customer must be identified, (i.e., cookied), to track this event. For the payload, you should include all of the cart information (like \*Started Checkout\* below) and information about the item that was just added (like \*Viewed Product\* above).



You can add as many key/value pairs as you’d like to the JSON payload, with one restriction: you can only use top-level properties in the JSON when adding \[filters to segments](https://help.klaviyo.com/hc/en-us/articles/115005237908-Getting-started-with-segments#filtering-a-segment-condition4) based on this event (\*Added to Cart\* in this case). That is why there is a top-level property `AddedItemCategories` in the below example that is the union of unique `ProductCategories` values of each of the products in the Items array. With this top-level property, you can create a segment of profiles who have viewed products in specific categories.



Here's an example Track request where the cart already contained one item (\*Winnie the Pooh\*) and another item was just added to the cart (\*A Tale of Two Cities\*):




```javascript
<script type="text/javascript">

      klaviyo.track("Added to Cart", {

        "$value": 29.98,

        "AddedItemProductName": "A Tale of Two Cities",

        "AddedItemProductID": "1112",

        "AddedItemSKU": "TALEOFTWO",

        "AddedItemCategories": \["Fiction", "Classics", "Children"],

        "AddedItemImageURL": "http://www.example.com/path/to/product/image2.png",

        "AddedItemURL": "http://www.example.com/path/to/product2",

        "AddedItemPrice": 19.99,

        "AddedItemQuantity": 1,

        "ItemNames": \["Winnie the Pooh", "A Tale of Two Cities"],

        "CheckoutURL": "http://www.example.com/path/to/checkout",

        "Items": \[{

            "ProductID": "1111",

            "SKU": "WINNIEPOOH",

            "ProductName": "Winnie the Pooh",

            "Quantity": 1,

            "ItemPrice": 9.99,

            "RowTotal": 9.99,

            "ProductURL": "http://www.example.com/path/to/product",

            "ImageURL": "http://www.example.com/path/to/product/image.png",

            "ProductCategories": \["Fiction", "Children"]

          },

          {

            "ProductID": "1112",

            "SKU": "TALEOFTWO",

            "ProductName": "A Tale of Two Cities",

            "Quantity": 1,

            "ItemPrice": 19.99,

            "RowTotal": 19.99,

            "ProductURL": "http://www.example.com/path/to/product2",

            "ImageURL": "http://www.example.com/path/to/product/image2.png",

            "ProductCategories": \["Fiction", "Classics"]

          }

        ]

      });

    </script>
```



## Started Checkout



Checkout data is important if you'd like to send \[abandoned cart emails](https://help.klaviyo.com/hc/en-us/articles/115002779411-Guide-to-Creating-an-Abandoned-Cart-Flow) once a person makes it to the checkout page. Abandoned cart emails based on \*Started Checkout\*, as opposed to \*Added to Cart\*, will target shoppers who are potentially more serious about completing their purchase. When someone starts the checkout process, you'll send Klaviyo a metric indicating they’ve started checking out. The best place to trigger this event is either:



\- When someone visits the checkout page after they’ve been identified.

\- When they enter their email address on the checkout page if they have not already been identified.



Include all line item details so your abandoned checkout emails can be customized to include pictures, links, and other information about the products in someone’s cart. Here’s an example call to track a the \*Started Checkout\* event:




```javascript
<script type="text/javascript">

      klaviyo.track("Started Checkout", {

        "$event_id": "1000123_1387299423",

        "$value": 29.98,

        "ItemNames": \["Winnie the Pooh", "A Tale of Two Cities"],

        "CheckoutURL": "http://www.example.com/path/to/checkout",

        "Categories": \["Fiction", "Children", "Classics"],

        "Items": \[{

            "ProductID": "1111",

            "SKU": "WINNIEPOOH",

            "ProductName": "Winnie the Pooh",

            "Quantity": 1,

            "ItemPrice": 9.99,

            "RowTotal": 9.99,

            "ProductURL": "http://www.example.com/path/to/product",

            "ImageURL": "http://www.example.com/path/to/product/image.png",

            "ProductCategories": \["Fiction", "Children"]

          },

          {

            "ProductID": "1112",

            "SKU": "TALEOFTWO",

            "ProductName": "A Tale of Two Cities",

            "Quantity": 1,

            "ItemPrice": 19.99,

            "RowTotal": 19.99,

            "ProductURL": "http://www.example.com/path/to/product2",

            "ImageURL": "http://www.example.com/path/to/product/image2.png",

            "ProductCategories": \["Fiction", "Classics"]

          }

        ]

      });

    </script>
```



The `$event_id` should be a unique identifier for the cart combined with the UNIX formatted time when the event was triggered. This allows someone to trigger \*Started Checkout\* more than once when they return after adding additional items.



## Server-side metrics



We recommend tracking certain metrics on the server-side due to potential limitations of frontend code, security concerns, and general availability of data on the server-side versus the front-end. For example, if someone has a slow connection or a ad-blocking extension on their browser, the JavaScript API requests might not fire. In the case of more crucial metrics (e.g., transactional events and properties) or ones that may contain sensitive data, use our server-side POST \[create event](https://developers.klaviyo.com/en/reference/create_event) API. For more information on this question, check out our \[custom integration FAQ on the topic](https://developers.klaviyo.com/en/docs/custom_integration_faqs#should-i-use-the-server-side-or-front-end-api).



Klaviyo also has \[SDKs](https://developers.klaviyo.com/en/docs/sdk_overview) in several languages.



## Syncing historical data



Along with your ongoing data, it is best practice to send your historical order data, which will enhance your ability to segment off past data and improve historical accuracy in revenue tracking and \[predictive analytics](https://help.klaviyo.com/hc/en-us/articles/360020919731-Guide-to-Klaviyo-s-Predictive-Analytics). Historical data can be sent to Klaviyo by iterating through your historical orders and generating POST \[create event](https://developers.klaviyo.com/en/reference/create_event) API requests for each server-side event as needed. The special `time` property for these events should be in ISO 8601 `datetime` (i.e. `2023-10-15T00:00:00`) of when that order occurred.



## Placed Order



After an order is placed, make a call to to our server-side POST \[create event API](https://developers.klaviyo.com/en/reference/create_event) to create a \*Placed Order\* event. Tracking \*Placed Order\* events is useful for calculating predictive analytics such as average order value and predicted CLV.



Send order data to Klaviyo in one of two ways: real-time or batch.



\- **Real-time**Make requests as soon as an order is placed.

\- **Batch**Write some code that will run (for example) at least every 30 minutes (e.g., on a cron) to send all order events that occurred in that past 30 minutes.



If you plan to send \[abandoned cart](https://help.klaviyo.com/hc/en-us/articles/115002779411-Guide-to-Creating-an-Abandoned-Cart-Flow) messages, you'll need to send order data at a frequency that falls within your flow time delay (at least) in order to stop the flow email from going to people who have completed their order. For example, if you have a one hour time delay between when someone triggers the abandoned cart flow and when they receive the first email, make sure that you send data over at least once every hour to fall within that window and filter them out of the flow before the email sends.



For each order, we recommend you send two types of events:



\- One event named \*Placed Order\* for the entire order.

       - Useful for triggering post-purchase flows and managing conversion revenue.

       - Includes a `value` property that represents the total value of the entire order.

\- One event for each line item named \*Ordered Product\* (see below).

       - Allows for deeper segmentation and filtering based on product-specific data.

       - Includes a `value` property that represents the total cost of an item in the order before any adjustments as well as more SKU-level detailed information about the item.



Here’s an example POST \[create event](https://developers.klaviyo.com/en/reference/create_event) request for `Placed Order`:



cURL



```bash
curl --request POST \\

        --url https: //a.klaviyo.com/api/events/ \\

        --header 'Authorization: Klaviyo-API-Key your-private-api-key' \\

        --header 'accept: application/json' \\

        --header 'content-type: application/json' \\

        --header 'revision: 2024-02-15' \\

        --data '

{

       "data": {

           "type": "event",

           "attributes": {

               "properties": {

                   "OrderId": "1234",

                   "Categories": \[

                       "Fiction",

                       "Classics",

                       "Children"

                   ],

                   "ItemNames": \[

                       "Winnie the Pooh",

                       "A Tale of Two Cities"

                   ],

                   "DiscountCode": "Free Shipping",

                   "DiscountValue": 5,

                   "Brands": \[

                       "Kids Books",

                       "Harcourt Classics"

                   ],

                   "Items": \[

                       {

                           "ProductID": "1111",

                           "SKU": "WINNIEPOOH",

                           "ProductName": "Winnie the Pooh",

                           "Quantity": 1,

                           "ItemPrice": 9.99,

                           "RowTotal": 9.99,

                           "ProductURL": "http://www.example.com/path/to/product",

                           "ImageURL": "http://www.example.com/path/to/product/image.png",

                           "Categories": \[

                               "Fiction",

                               "Children"

                           ],

                           "Brand": "Kids Books"

                       },

                       {

                           "ProductID": "1112",

                           "SKU": "TALEOFTWO",

                           "ProductName": "A Tale of Two Cities",

                           "Quantity": 1,

                           "ItemPrice": 19.99,

                           "RowTotal": 19.99,

                           "ProductURL": "http://www.example.com/path/to/product2",

                           "ImageURL": "http://www.example.com/path/to/product/image2.png",

                           "Categories": \[

                               "Fiction",

                               "Classics"

                           ],

                           "Brand": "Harcourt Classics"

                       }

                   ],

                   "BillingAddress": {

                       "FirstName": "John",

                       "LastName": "Smith",

                       "Address1": "123 Abc St",

                       "City": "Boston",

                       "RegionCode": "MA",

                       "CountryCode": "US",

                       "Zip": "02110",

                       "Phone": "+15551234567"

                   },

                   "ShippingAddress": {

                       "Address1": "123 Abc St"

                   }

               },

               "time": "2022-11-08T00:00:00",

               "value": 29.98,

               "value_currency": "USD",

               "unique_id": "d47aeda5-1751-4483-a81e-6fcc8ad48711",

               "metric": {

                   "data": {

                       "type": "metric",

                       "attributes": {

                           "name": "Placed Order"

                       }

                   }

               },

               "profile": {

                   "data": {

                       "type": "profile",

                       "attributes": {

                           "email": "sarah.mason@klaviyo-demo.com",

                           "phone_number": "+15005550006"

                       }

                   }

               }

           }

       }

}

'
```



> **📘**

> 

> 

> Creating an event requires at least one \[profile identifier](https://developers.klaviyo.com/en/reference/profiles_api_overview#profile-identifiers). For example, the \*Placed Order\* event from the POST Create Event call above uses `email` as a profile identifier. Providing every identifier is unnecessary. You should limit your provided identifiers to known values.

> 



Key things to be aware of when tracking server-side events:



\- Make sure to replace `PRIVATE_API_KEY` with a \[private key](https://help.klaviyo.com/hc/en-us/articles/7423954176283-How-to-create-a-private-API-key) from your Klaviyo account; this key must have write permissions to create events.

\- The `unique_id` should be a unique identifier for the order (e.g., Order ID).

\- If the `unique_id` is repeated for the same profile and metric, only the first processed event will be recorded. If the `unique_id` is not present, it will default to the event's datetime value.

\- `value` is a special property that allows Klaviyo to track revenue; this should be the total numeric (not a string), monetary value of the event it’s associated with.

\- The `Items` array should contain one JSON block/dictionary for each line item.

\- `time` is a special property that should bean ISO 8601 `datetime` (i.e. `2023-10-15T00:00:00Z`) for the order date and time.

\- Note that the billing address is not used to determine a profile's location. You'll need to set profiles' locations with the `location` object (\[Profiles API](https://developers.klaviyo.com/en/reference/profiles_api_overview)).



## Ordered Product



For each line item, you should also generate an \*Ordered Product\* event. This metric is useful if you plan to create any filters or triggers based on product-specific information (as opposed to the order as a whole) that isn't "\[top-level](https://developers.klaviyo.com/en/docs/custom_integration_faqs#how-should-i-structure-my-data-for-segmentation-and-flow-filtering)" for the \*Placed Order\* metric. This metric is also used in conjunction with your Catalog Feed in order to \[enable personalized recommendations](https://developers.klaviyo.com/en/docs/custom_integration_faqs#how-do-i-enable-personalized-recommendations) and in the benchmarks feature to calculate average item value and average cart size.



The remainder of the POST \[create event](https://developers.klaviyo.com/en/reference/create_event) calls in this guide will use the same headers as the \*Placed Order\* call.




```json
{

       "data": {

           "type": "event",

           "attributes": {

               "properties": {

                   "OrderId": "1234",

                   "ProductID": "1111",

                   "SKU": "WINNIEPOOH",

                   "ProductName": "Winnie the Pooh",

                   "Quantity": 1,

                   "ProductURL": "http://www.example.com/path/to/product",

                   "ImageURL": "http://www.example.com/path/to/product/image.png",

                   "Categories": \[

                       "Fiction",

                       "Children"

                   ],

                   "ProductBrand": "Kids Books"

               },

               "time": "2022-11-08T00:00:00",

               "value": 9.99,

               "value_currency": "USD",

               "unique_id": "d47aeda5-1751-4483-a81e-6fcc8ad48711",

               "metric": {

                   "data": {

                       "type": "metric",

                       "attributes": {

                           "name": "Ordered Product"

                       }

                   }

               },

               "profile": {

                   "data": {

                       "type": "profile",

                       "attributes": {

                           "email": "sarah.mason@klaviyo-demo.com",

                           "phone_number": "+15005550006"

                       }

                   }

               }

           }

       }

}
```



## Fulfilled Order, Canceled Order, and Refunded Order



Depending on how your products are sent to the customer, and whether they are able to be canceled or refunded, you may want to send additional metrics that reflect these actions. Each of these order-related metrics will have a similar payload to a \*Placed Order\* event.



> **📘**

> 

> 

> For \*Canceled Order\* and \*Refunded Order\* to be included in CLV calculations, they must have `unique_id`s that correspond to a previously tracked \*Placed Order\* event.

> 



## Fulfilled Order example



For \*Fulfilled Order\*, the only update needed is the metric name and the time at which the fulfillment took place. You can also track additional details about the fulfillment itself (e.g., tracking number, shipping method):




```json
{

       "data": {

           "type": "event",

           "attributes": {

               "properties": {

                   "OrderId": "1234",

                   "Categories": \[

                       "Fiction",

                       "Classics",

                       "Children"

                   ],

                   "ItemNames": \[

                       "Winnie the Pooh",

                       "A Tale of Two Cities"

                   ],

                   "Brands": \[

                       "Kids Books",

                       "Harcourt Classics"

                   ],

                   "DiscountCode": "Free Shipping",

                   "DiscountValue": 5,

                   "Items": \[

                       {

                           "ProductID": "1111",

                           "SKU": "WINNIEPOOH",

                           "ProductName": "Winnie the Pooh",

                           "Quantity": 1,

                           "ItemPrice": 9.99,

                           "RowTotal": 9.99,

                           "ProductURL": "http://www.example.com/path/to/product",

                           "ImageURL": "http://www.example.com/path/to/product/image.png",

                           "Categories": \[

                               "Fiction",

                               "Children"

                           ],

                           "Brand": "Kids Books"

                       },

                       {

                           "ProductID": "1112",

                           "SKU": "TALEOFTWO",

                           "ProductName": "A Tale of Two Cities",

                           "Quantity": 1,

                           "ItemPrice": 19.99,

                           "RowTotal": 19.99,

                           "ProductURL": "http://www.example.com/path/to/product2",

                           "ImageURL": "http://www.example.com/path/to/product/image2.png",

                           "Categories": \[

                               "Fiction",

                               "Classics"

                           ],

                           "Brand": "Harcourt Classics"

                       }

                   ],

                   "BillingAddress": {

                       "FirstName": "John",

                       "LastName": "Smith",

                       "Address1": "123 Abc St",

                       "City": "Boston",

                       "RegionCode": "MA",

                       "CountryCode": "US",

                       "Zip": "02110",

                       "Phone": "+15551234567"

                   },

                   "ShippingAddress": {

                       "Address1": "123 Abc St"

                   }

               },

               "time": "2022-11-10T00:00:00",

               "value": 29.98,

               "value_currency": "USD",

               "unique_id": "d47aeda5-1751-4483-a81e-6fcc8ad48711",

               "metric": {

                   "data": {

                       "type": "metric",

                       "attributes": {

                           "name": "Fulfilled Order"

                       }

                   }

               },

               "profile": {

                   "data": {

                       "type": "profile",

                       "attributes": {

                           "email": "sarah.mason@klaviyo-demo.com",

                           "phone_number": "+15005550006"

                       }

                   }

               }

           }

       }

}
```



## Canceled Order example



For \*Canceled Order\*, update the metric name and timestamp, and add an additional property for the cancellation reason. You can also include which items were and weren’t canceled in the event payload, in case the order is only partially canceled.




```json
{

       "data": {

           "type": "event",

           "attributes": {

               "properties": {

                   "OrderId": "1234",

                   "Reason": "No longer needed",

                   "Categories": \[

                       "Fiction",

                       "Classics",

                       "Children"

                   ],

                   "ItemNames": \[

                       "Winnie the Pooh",

                       "A Tale of Two Cities"

                   ],

                   "Brands": \[

                       "Kids Books",

                       "Harcourt Classics"

                   ],

                   "Discount Code": "Free Shipping",

                   "Discount Value": 5,

                   "Items": \[

                       {

                           "ProductID": "1111",

                           "SKU": "WINNIEPOOH",

                           "ProductName": "Winnie the Pooh",

                           "Quantity": 1,

                           "ItemPrice": 9.99,

                           "RowTotal": 9.99,

                           "ProductURL": "http://www.example.com/path/to/product",

                           "ImageURL": "http://www.example.com/path/to/product/image.png",

                           "Categories": \[

                               "Fiction",

                               "Children"

                           ],

                           "Brand": "Kids Books"

                       },

                       {

                           "ProductID": "1112",

                           "SKU": "TALEOFTWO",

                           "ProductName": "A Tale of Two Cities",

                           "Quantity": 1,

                           "ItemPrice": 19.99,

                           "RowTotal": 19.99,

                           "ProductURL": "http://www.example.com/path/to/product2",

                           "ImageURL": "http://www.example.com/path/to/product/image2.png",

                           "Categories": \[

                               "Fiction",

                               "Classics"

                           ],

                           "Brand": "Harcourt Classics"

                       }

                   ],

                   "BillingAddress": {

                       "FirstName": "John",

                       "LastName": "Smith",

                       "Address1": "123 Abc St",

                       "City": "Boston",

                       "RegionCode": "MA",

                       "CountryCode": "US",

                       "Zip": "02110",

                       "Phone": "+15551234567"

                   },

                   "ShippingAddress": {

                       "Address1": "123 Abc St"

                   }

               },

               "time": "2022-11-09T00:00:00",

               "value": 29.98,

               "value_currency": "USD",

               "unique_id": "d47aeda5-1751-4483-a81e-6fcc8ad48711",

               "metric": {

                   "data": {

                       "type": "metric",

                       "attributes": {

                           "name": "Canceled Order"

                       }

                   }

               },

               "profile": {

                   "data": {

                       "type": "profile",

                       "attributes": {

                           "email": "sarah.mason@klaviyo-demo.com",

                           "phone_number": "+15005550006"

                       }

                   }

               }

           }

       }

}
```



## Refunded Order example



For \*Refunded Order\*, update the metric name and timestamp, and add an additional property for the refund reason. You can also include which items were and weren’t refunded in the event payload, in case the order is only partially refunded.




```json
{

       "data": {

           "type": "event",

           "attributes": {

               "properties": {

                   "OrderId": "1234",

                   "Reason": "No longer needed",

                   "Categories": \[

                       "Fiction",

                       "Classics",

                       "Children"

                   ],

                   "ItemNames": \[

                       "Winnie the Pooh",

                       "A Tale of Two Cities"

                   ],

                   "Brands": \[

                       "Kids Books",

                       "Harcourt Classics"

                   ],

                   "Discount Code": "Free Shipping",

                   "Discount Value": 5,

                   "Items": \[

                       {

                           "ProductID": "1111",

                           "SKU": "WINNIEPOOH",

                           "ProductName": "Winnie the Pooh",

                           "Quantity": 1,

                           "ItemPrice": 9.99,

                           "RowTotal": 9.99,

                           "ProductURL": "http://www.example.com/path/to/product",

                           "ImageURL": "http://www.example.com/path/to/product/image.png",

                           "Categories": \[

                               "Fiction",

                               "Children"

                           ],

                           "Brand": "Kids Books"

                       },

                       {

                           "ProductID": "1112",

                           "SKU": "TALEOFTWO",

                           "ProductName": "A Tale of Two Cities",

                           "Quantity": 1,

                           "ItemPrice": 19.99,

                           "RowTotal": 19.99,

                           "ProductURL": "http://www.example.com/path/to/product2",

                           "ImageURL": "http://www.example.com/path/to/product/image2.png",

                           "Categories": \[

                               "Fiction",

                               "Classics"

                           ],

                           "Brand": "Harcourt Classics"

                       }

                   ],

                   "BillingAddress": {

                       "FirstName": "John",

                       "LastName": "Smith",

                       "Address1": "123 Abc St",

                       "City": "Boston",

                       "RegionCode": "MA",

                       "CountryCode": "US",

                       "Zip": "02110",

                       "Phone": "+15551234567"

                   },

                   "ShippingAddress": {

                       "Address1": "123 Abc St"

                   }

               },

               "time": "2022-11-10T00:00:00",

               "value": 29.98,

               "value_currency": "USD",

               "unique_id": "d47aeda5-1751-4483-a81e-6fcc8ad48711",

               "metric": {

                   "data": {

                       "type": "metric",

                       "attributes": {

                           "name": "Refunded Order"

                       }

                   }

               },

               "profile": {

                   "data": {

                       "type": "profile",

                       "attributes": {

                           "email": "sarah.mason@klaviyo-demo.com",

                           "phone_number": "+15005550006"

                       }

                   }

               }

           }

       }

}
```



## Catalog feed integration



Integrating your catalog will allow you to utilize \[product blocks](https://help.klaviyo.com/hc/en-us/articles/115000219092-Insert-a-Product-Block) in emails. In order to set up a custom catalog integration, please follow the process outlined in \[Sync a custom catalog feed to Klaviyo](https://developers.klaviyo.com/en/docs/guide_to_syncing_a_custom_catalog_feed_to_klaviyo).
