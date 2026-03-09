# Set Up API-Based Website Activity Events

Learn how to set up tracking for events on your website using Klaviyo’s APIs to enhance your marketing goals.

While our pre-built integrations offer some common onsite events by default, you may have other event information that you'd like to track. This guide will review some examples of additional data you can track which can enhance your marketing goals.

The first question to ask when you consider tracking additional data is "what is the marketing or reporting goal of tracking this data?" If there is a clear answer, it makes sense to track it! If not, it may just add clutter to your Klaviyo account. Remember, while more data can be better, unnecessary data may add unneeded overhead and detract from the user-friendliness of your account.

This guide will provide examples of how to implement the following common onsite activity events:

- Referrals and Shares
    - Send to a Friend (product, article, page)
    - Refer a Friend (referral code)
- Website activity
    - Viewed Category
    - Searched Site
    - Clicked Banner

The level of detailed data you send to Klaviyo within these web activity events will determine how you can filter and segment based on these events in Klaviyo. To understand how data must be structured so that key event details are available for segmentation, [check out our guide on segment conditions](https://help.klaviyo.com/hc/en-us/articles/115005062847).

The snippets in this guide use example data. You will need to update the values of the JSON properties in these snippets such that they dynamically pull from the relevant information needed for that property.

If you have questions about custom integrations check out our [Custom integration FAQ](https://developers.klaviyo.com/en/docs/custom_integration_faqs).

## JavaScript requests

To enable our JavaScript API and the ability to push events and profile properties to Klaviyo from your site, add the following snippet so it appears on every page on your website. Often, the end of the footer is a good place to add it. Make sure to replace PUBLIC_API_KEY (also known as your Company ID) with your Klaviyo account's 6 character [Public API Key](https://www.klaviyo.com/account#api-keys-tab):


```javascript
<script type="application/javascript" async src="https://static.klaviyo.com/onsite/js/<PUBLIC_API_KEY>/klaviyo.js"></script>
```

## Server-side requests

For sending server-side events and profile properties, you should use our [server-side API](https://developers.klaviyo.com/en/reference/api_overview). We have libraries available for [Python](https://github.com/klaviyo/klaviyo-api-python), [Ruby](https://github.com/klaviyo/klaviyo-api-ruby), [Node](https://github.com/klaviyo/klaviyo-api-node), and [PHP](https://github.com/klaviyo/klaviyo-api-php) but in a general sense the API requires making an HTTP POST request with a JSON payload.

You'll want to send server-side data to Klaviyo in one of two ways: real-time or batch.

- **Real-time**Requests are made as soon as an action is taken.
- **Batch**Script is run at least once an hour, sending all events from the past hour to your Klaviyo account.

Key things to be aware of when tracking server-side events:

- Make sure to replace `PRIVATE_API_KEY` with [your private API key](https://www.klaviyo.com/account#api-keys-tab).
- The `unique_id` should be a unique identifier for the order (e.g. Order ID).
- If the same combination of metric and `unique_id` are sent more than once, we will skip all tracked events after the first with the same combination.
- If no `unique_id` is provided, `time` will be used.
- `time` is a special property that should be a UNIX timestamp of the order date and time in the format of `2022-11-08T00:00:00`. If this is not submitted, it will be created upon submission of the event.
- Build in retry logic to key off of the ['Retry-After' header](https://developers.klaviyo.com/en/docs/rate_limits_and_error_handling#rate-limits) returned on any rate limited API calls that return a 429 error.

Server-side events should include any information about the person who took the action (e.g., first name) as profile properties in the `customer_properties` dictionary and any information specific to the event itself (e.g., a list of ordered items) in the `properties` dictionary.

In this example, we will be using Python with the Requests library. Many other language examples are available in our [API reference](https://developers.klaviyo.com/en/reference/create_event) as well as in our [Postman Workspace](https://www.postman.com/klaviyo/workspace/klaviyo-developers/overview).

## Shares and referrals

Shares and referrals can be leveraged by your business to gain new customers and increase brand awareness.

### Share an item

There are two types of events you can track when someone shares something (a product, an article, a page, etc.) with another person:

- An event for the person who sent the item.
- An event per person who received the item.

The first is sent using our Javascript Track API, but the second must be sent using our server-side API. For the sake of simplicity, we will use blog articles as an example.

### Shared Article event

When the article is initially shared, the *Shared Article* event uses our Track API to record the following information:

- The article recipient(s), identified by their email address (array of strings).
- The quantity of articles shared.
- The name of the article (string).
- Article URL (string).
- Identifying picture for article (string).

Once someone enters the email address(es) of the person(s) they'd like to share with, send a *Shared Article* event that looks something like this:


```javascript
<script>
   klaviyo.track("Shared Article", {
     "Recipients": ["email.on.list@email.com","email.2.on.list@email.com"],
     "Quantity": 2,
     "Name": "Top 10 flows for great holiday success!",
     "URL": "https://www.example.com/top-10-flows-holidays",
     "ImageURL": "https://www.example.com/top-10-flows-holidays-hero-image.png"
   });
</script>
```

### Received Article Share event

The *Received Article Share* event is sent to people who aren’t cookied or identified by Klaviyo on the front-end at the time of this action. So, this event requires a server-side events request for each email in the *Shared Article* event.

Server-side requests require use of your private API key, and this is passed with additional details in the header of the request.

Successful requests to the Create Event endpoint return a 202/Accepted response with a response body value of "1".

> **📘**
> 
> 
> To make sure the Received Article Share events are recorded separately, each call needs to have a different `unique_id`. There are many ways to generate a `unique_id`; one method is to base64 encode the email address of the recipient and concatenate it with the current UNIX timestamp, as shown below.
> 


```python
import requests
url = "https://a.klaviyo.com/api/events/"
payload = {"data": {
        "type": "event",
        "attributes": {
            "profile": {"email": "email.on.list@email.com"},
            "metric": {"name": "Received Article Share"},
            "properties": {
                "SharerName": "Erin Smith",
                "SharerEmail": " erin.smith@test.com",
                "Name": "Top 10 flows for great holiday success!",
                "URL": "https://www.example.com/top-10-flows-holidays",
                "ImageURL": "https://www.example.com/top-10-flows-holidays-hero-image.png"
            },
            "time": "2023-02-08T11:10:15",
            "unique_id": "ZW1haWwub24ubGlzdEBlbWFpbC5jb20xNjc1ODgyMTYy"
        }
    }}
headers = {
    "accept": "application/json",
    "revision": "2024-02-15",
    "content-type": "application/json",
    "Authorization": "Klaviyo-API-Key your-private-api-key"
}
response = requests.post(url, json=payload, headers=headers)
```

### Referrals

If you’d like to report on who’s referred your brand to a friend or send a thank you note to the person who referred you, you can track *Referred Friend* and *Referred by Friend* events. Similar to when someone shares content with a friend, you’ll need to track two kinds of events:

- An event for the person who referred a friend, sent via the JavaScript Track API.
- An event per friend referred, sent via our server-side events API.

As part of a server-side events request, you can also send profile properties, which may be useful in this case if a person can use a referral code to gain some kind of perk with your brand.

### Referred Friend event

When the referral is initially made, the *Referred Friend* event uses our Track API to record the following information:

- The article recipient(s), identified by their email address (array of strings).
- The quantity of recipients.

See the code below for an example of what the *Referred Friend* event looks like:


```javascript
<script type="text/javascript">
   klaviyo.track("Referred Friend", {
     "Recipients": ["email.on.list@email.com","email.2.on.list@email.com"],
     "Quantity": 2
   });
 </script>
```

### Referred by Friend event

At the same time, send something like the following payload for each referred person:


```python
import requests
url = "https://a.klaviyo.com/api/events/"
payload = {"data": {
        "type": "event",
        "attributes": {
            "profile": {"email": "email.on.list@email.com"},
            "metric": {"name": "Referred by Friend"},
            "properties": {
                "ReferrerName": "Erin Smith",
                "ReferrerEmail": "erin.smith@test.com",
                "ReferrerCode": "12abc456def",
            },
            "time": "2023-02-08T14:22:23",
            "unique_id": "ZW1haWwub24ubGlzdEBlbWFpbC5jb20xNjc1ODkxMDIy"
        }
    }}
headers = {
    "accept": "application/json",
    "revision": "2024-02-15",
    "content-type": "application/json",
    "Authorization": "Klaviyo-API-Key your-private-api-key"
}
response = requests.post(url, json=payload, headers=headers)
```

You can then use the `ReferrerCode` to create unique URLs for each referral, and insert those URLs into a referral email. For example, if you had an email flow triggered by the *Referred by Friend* event, you could include the following:


```html
{{ event|lookup:'ReferrerName' }} thought you might like this,
<a href="https://www.example.com/?referral_code={{ event|lookup:'ReferrerCode' }}">click here</a>
to find out if you do!
```

## Website activity

In addition to our standard events like [Viewed Product](https://developers.klaviyo.com/en/docs/guide_to_integrating_a_platform_without_a_pre_built_klaviyo_integration#viewed-product), people can take other actions on your website which you may want to track for targeting or reporting. Below are some common examples.

### Viewed Category

Similar to a *Viewed Product* event, the *Viewed Category* event allows you to capture when someone views a particular category of items, and triggers when a person lands on a category page.

This event uses our JavaScript Track API to record the following information:

- The category name (string).
- The category ID (string).
- The category image URL (string).
- The category URL (string).

See the code below for an example of what the *Viewed Category* event looks like:


```javascript
<script type="text/javascript">
   klaviyo.track("Viewed Category",{
     "CategoryName": "Fantasy Books",
     "CategoryID": "01",
     "ImageURL": "http://www.example.com/path/to/category/hero/image.png",
     "URL": "http://www.example.com/path/to/category"
   });
</script>
```

### Searched Site

The *Searched Site* event allows you to track search terms users look for on your site. This event also allows you to track any suggestions your site made based off of the user’s initial search term, such as correcting their spelling or closest match.

This event should be triggered when someone submits a search query, and it uses our JavaScript Track API to record the following information:

- The exact term the user searched for (string).
- The autocorrected term (string).
- The number of results returned (integer).

See the code below for an example of what the *Searched Site* event looks like:


```javascript
<script>
   klaviyo.track("Searched Site",{
     "SearchTerm": "Fantasty Boks",
     "SearchTerm (autocorrected)": "Fantasy Books",
     "ReturnedResults": 54
   });
</script>
```

### Clicked Banner

The *Clicked Banner* event is used to track when someone clicks a banner on your site, allowing you to better target the users based on their click activity. This event can be used for any kind of banner as long as the user will be directed to a specific destination.

> **📘Info**
> 
> 
> Before implementing this event, make sure there’s a clear reason to track it, such as a strong marketing or reporting goal. Otherwise, it may add unnecessary clutter to your Klaviyo account.
> 

The *Clicked Banner* event uses our JavaScript Track API to record the following information:

- The URL the user was at when they clicked the banner (string).
- The URL they navigated to by clicking the banner (string).
- The banner title (string).

The example below is specifically for banner ads, but this can be extrapolated to other use-cases as well:


```javascript
<script>
   klaviyo.track("Clicked Banner",{
     "SourceURL": "https://www.example.com/home",
     "DestinationURL": "https://www.example.com/black-friday-deals",
     "BannerTitle": "Check out these awesome Black Friday sales!"
   });
</script>
```
