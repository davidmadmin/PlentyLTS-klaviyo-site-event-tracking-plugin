### **Track API metrics with JavaScript**Track metrics in Klaviyo and use them for targeted messaging



Metrics, individual instances of which we refer to as events, record actions that customers take on your website, in response to an email, or through any other data source where customer behavior takes place. Using the `klaviyo` object that's automatically added by the Klaviyo.js tracking snippet, the track method can be leveraged to capture all kinds of metrics, including API metrics, i.e., metrics you've created via API.



Klaviyo's metric tracking and analytics are very flexible. You can customize metrics to keep track of what's important to your business, whether you're building a custom integration or looking to track additional metrics for a native Klaviyo integration.



## **Track a metric**



If you already have our "Active on Site" javascript (known as Klaviyo.js) installed, the `klaviyo` object will be available to you. You will likely have installed Klaviyo.js during your account setup, however, if you need to install it, check out our \[custom integration guide](https://developers.klaviyo.com/en/docs/guide_to_integrating_a_platform_without_a_pre_built_klaviyo_integration#active-on-site-tracking-snippet).



> **📘**

> 

> 

> When you add the Klaviyo.js snippet to your site, we are only able to track the browsing activity of "known browsers" - browsers that have been cookied (e.g., via filling out a form). For this reason, in order to \[test your onsite metric tracking](https://help.klaviyo.com/hc/en-us/articles/115005076767#h_01HADAYAACFYSN7F22XPPCGT6B), you have to be manually cookied. Note that Klaviyo will not track anonymous browsers.

> 



The track method accepts the metric name as a string, and can be given any name you require:



`klaviyo.track('API Metric Name')`



It also accepts an optional dictionary or hash of properties associated with that metric. For example, if you wanted to include properties associated with viewed items:



JavaScript



`<script type="text/javascript">

      var item = {

        "ProductName": "Winnie the Pooh",

        "ProductID": "1111",

        "SKU": "WINNIEPOOH",

        "Categories": \["Fiction", "Children"],

        "ImageURL": "http://www.example.com/path/to/product/image.png",

        "URL": "http://www.example.com/path/to/product",

        "Brand": "Kids Books",

        "Price": 9.99,

        "CompareAtPrice": 14.99

      };

      klaviyo.track("Viewed Product", item);

</script>`



The track method accepts a variety of data types:



\- strings

\- numbers

\- booleans

\- dates



You can also track metrics when a customer clicks a custom button you have defined. In this example, an event listener tracks when a customer clicks a "Like" button on an item, creating an `Added Like` custom event. We can then set up a custom flow trigger to send emails to customers about items they've "liked" or view reports on "liked" items.



JavaScript



`<script type="text/javascript">

    	document.getElementById("Like").addEventListener('click',function (){

    		klaviyo.track('Added Like', item);

    	});

</script>`



## **Use API metrics in flows**



Once your metric tracking is set up, you can create a new flow and select your API metric as the trigger. The flows library also has a variety of prebuilt flows to choose from, which can be modified to suit the purpose of your metric. For example, if you'd like to remind inactive customers of items they've previously "liked", you can modify a standard winback flow with your `Added Like` metric.



To learn more about these flows, \[read our metric-triggered flow guide](https://help.klaviyo.com/hc/en-us/articles/360003057151). The metric trigger option allows you to queue people for a flow when they take a certain action. This action can be any event activity created via the Klaviyo API, or captured through an integration (e.g., started a checkout, placed an order, filled out a form). For example, an abandoned cart flow would trigger off the \*Started Checkout\* event, with an additional flow filter to restrict the flow only to those who have not followed through with placing an order. Any API metric can be used to trigger a flow.



## **Report on API metrics**



Klaviyo’s pre-built, customizable reports enable you to dive deeper into metric, campaign, flow, or product performance. To track the performance of metrics you've created via API, set up a custom report on those metrics.



To access custom reports, click on the **Analytics** tab and select **Custom Reports** from the main dashboard. Create a new report by selecting **Create from scratch**.



Next, click on **Select report type** and choose **Single Metric Deep Dive Report** from the dropdown menu. With the single metric report, you can choose any metric in your account to build a report around and can further customize it by selecting different timeframes, properties, and groupings.



Select your API metric to report on. From the designated dropdown, you can select any metric available in your account. Finally, customize and run your report.



Read more about \[creating a single metric deep dive report](https://help.klaviyo.com/hc/en-us/articles/360046242952).

