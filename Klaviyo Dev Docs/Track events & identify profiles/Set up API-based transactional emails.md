# Set up API-based transactional events



Learn how to set up tracking for transactional emails on your website using Klaviyo’s server-side Events API.



Transactional emails are essential communications triggered by a user action. These are not marketing messages, but important updates such as:



\- Password reset

\- Order confirmation

\- Shipping notifications

\- Account alerts



In Klaviyo, **transactional and marketing messages can be triggered from the same events (metrics)**. The difference lies in how the resulting flow or email is configured. :contentReference\[oaicite:1]{index=1}



---



# Why use API-based transactional events?



You can send events to Klaviyo using either:



\- Client-side tracking (JavaScript)

\- Server-side APIs



For transactional messages, **server-side events are strongly recommended**.



> Sending transactional events via a client endpoint can be blocked by browsers or devices.  

> Use the server-side `Create Event` endpoint instead for reliability. :contentReference\[oaicite:2]{index=2}



---



# Overview of the process



The typical setup for API-based transactional messaging looks like this:



1. Define the transactional event in your application

2. Send the event to Klaviyo via the Events API

3. Create a flow in Klaviyo triggered by that event

4. Send the transactional email through the flow



Example use cases:



\- Reset Password

\- Account Verification

\- Invoice Sent

\- Shipment Update



---



# Step 1 — Create a transactional event



Your backend should send an event to Klaviyo whenever the transactional action occurs.



For example:



\- User requests password reset

\- User places an order

\- Subscription renewal occurs



Each event includes:



\- A **metric name** (event type)

\- A **profile**

\- Optional **event properties**



Example metric:



```

Reset Password Requested

```



---



# Step 2 — Send the event using the Events API



Use the `Create Event` endpoint to send the event to Klaviyo.



Endpoint:



```

POST https://a.klaviyo.com/api/events/

```



This endpoint records a new event for a profile.



Each event contains:



\- Event metric

\- Profile data

\- Optional properties



Example payload:



```json

{

     "data": {

       "type": "event",

       "attributes": {

         "metric": {

           "data": {

             "type": "metric",

             "attributes": {

               "name": "Reset Password Requested"

             }

           }

         },

         "profile": {

           "data": {

             "type": "profile",

             "attributes": {

               "email": "\[email protected]"

             }

           }

         },

         "properties": {

           "reset\_url": "https://example.com/reset-password?token=12345"

         }

       }

     }

}

```



This event will be recorded in the user's activity timeline.



---



# Step 3 — Create a flow triggered by the event



Inside Klaviyo:



1. Go to **Flows**

2. Create a new flow

3. Select **Metric Trigger**

4. Choose the event you created



Example trigger:



```

Reset Password Requested

```



This means the flow runs whenever that event is received.



---



# Step 4 — Add the transactional email



Add an email step to the flow that contains the transactional content.



Example reset email:



```

Subject: Reset your password



Click the link below to reset your password:



{{ event.reset\_url }}

```



Use **event properties** to dynamically populate links and data.



---



# Example transactional events



Common transactional event types include:



## Password reset



Metric:



```

Reset Password Requested

```



Properties:



\- reset_url

\- timestamp



---



## Order confirmation



Metric:



```

Placed Order

```



Properties:



\- order_id

\- order_total

\- product_list



---



## Shipping notification



Metric:



```

Order Shipped

```



Properties:



\- tracking_number

\- carrier

\- estimated_delivery



---



# Best practices



### Use server-side events



Always send transactional events from your backend to ensure delivery reliability.



### Keep transactional content non-promotional



Transactional emails must only contain essential information.



Avoid including:



\- Promotional offers

\- Marketing copy

\- Sales messaging



### Include structured event data



Add properties such as:



\- IDs

\- URLs

\- timestamps

\- product details



This improves personalization and debugging.



---



# Summary



API-based transactional events allow you to:



\- Trigger critical customer emails

\- Send events from your backend

\- Use Klaviyo flows for automation

\- Personalize transactional messages using event data



The process:



1. Trigger an event in your application

2. Send it to Klaviyo via the Events API

3. Create a flow triggered by that event

4. Send the transactional email

