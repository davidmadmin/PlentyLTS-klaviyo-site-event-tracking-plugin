# Use data in Klaviyo
Learn how data is used in Klaviyo and how to get data in using integrations, APIs, and developer tools.



> **📘**

> 

> 

> Learn about Klaviyo's data model and how to map your data into Klaviyo with our official \[Map your data into Klaviyo](https://academy.klaviyo.com/map-your-data-into-klaviyo) course.

> 



## Data objects



When understanding how to use data in Klaviyo, it is helpful to first understand Klaviyo’s data model (i.e., what data Klaviyo collects and how it’s organized). Klaviyo’s three primitive data objects are:



\- Profiles

\- Metrics

\- Catalogs



Klaviyo also includes an object for data feeds, which is related to our catalogs implementation.



\- Below, you’ll find an explanation of how each one is used in Klaviyo.



## How data is used



Data pushed into Klaviyo is primarily used for two reasons:



\- Targeting - Defining who receives a message and when they receive it

\- Personalization - What content that person is shown



There are three main ways in Klaviyo to send messages:



\- Campaigns

\- Flows

\- Advertising



There are three main ways in Klaviyo to target users and personalize content:



\- Flow event triggers

\- Segmentation and conditional filters

\- Personalized/dynamic content in messages



Part of the power of Klaviyo is how these mechanisms work together and interact. For example, consider an abandoned cart flow. Suppose that we want to target and personalize by applying the following logic:



## Targeting



Send an email one hour after someone adds an item into their cart, but only if that user has not completed a purchase since adding that item. People from the United States receive one version of the message, while people outside the United States receive another version of the message.



## Personalization



Dynamically insert the person’s name, details about the items in the cart, and details for other recommended products based on purchase history into a message.



This table illustrates how different data objects are used in flows, segmentation, and messaging:



|  | **Profiles** | **Metrics** | **Catalogs / Data Feeds** |

| --- | --- | --- | --- |

| Flow event triggers | Birthday flow triggered on `Birthday` property | Define trigger as Added to Cart event |  |

| Segmentation and conditional filters | Configure flow split Where `Country` equals `United States` | Define flow filter to include anyone who Has not Placed Order since starting this flow |  |

| Dynamic content in messages | Configure template to reference`{{ person.first_name }}` | Configure template to reference data from the Added to Cart event, such as`{{ event.line_items.product_name }}` | Configure template to include a Klaviyo product block, which renders recommended products from catalog |



## Getting data into Klaviyo



Once you understand Klaviyo’s data model and how data is used in Klaviyo, you can then learn about how to get data into Klaviyo. There are a variety of ways this can be done, which are outlined below.



## Native and third-party integrations



Klaviyo has more than 50 pre-built native integrations. In many cases, you’ll be able to synchronize your data into Klaviyo simply by enabling one of these integrations. To see integrations we natively support, navigate to the Integrations tab.



Additionally, because our APIs are open, many third-parties have productized integrations into Klaviyo which they support. These can be enabled by creating an API key in Klaviyo and following the configuration instructions from the third-party. For a full list of third-party integrations, check out our \[App Marketplace](http://marketplace.klaviyo.com/).



## APIs



If you want to programmatically push data into Klaviyo, you can utilize our APIs to create, read, update, or delete records for most of the objects in our data model. The specific endpoints, supported request formats, and example responses are detailed in our API documentation.



We’ve built Klaviyo to make it easy to push data to us and use it. Here are some of the key usability principles we design for:



\- No pre-configuration - We store data in a highly-denormalized manner, which means there’s no need to pre-configure your data schema in the UI or otherwise. Just send data to our APIs, and you’ll be able to see it and use it in the app in real-time.

\- Flexibility - We offer a very large allocation of unique event metrics, aggregate events, and event properties. We allow you to pass complex data structures as JSON payloads including nested complex objects..

\- Simplicity - Pushing customer data typically requires interacting with just two endpoints, \[Events](https://developers.klaviyo.com/en/reference/create_event) and \[Profiles](https://developers.klaviyo.com/en/reference/create_profile). We have certain properties that have special meaning, which we have enumerated here. Additionally, Klaviyo will automatically parse and infer the data types: numbers, dates, booleans, or and text, without requiring specification.

\- No data limitations - You have complete control over, and access to, all of your data. We don’t have any data retention limits nor any downstream filters on how you can query data in the UI. You have the ability to access every event, and all associated metadata for every user over all time.



## Other ways to upload data



Klaviyo also supports uploading \[Events and Profiles via SFTP](https://developers.klaviyo.com/en/docs/use_klaviyos_sftp_import_tool), \[uploading profiles into a List](https://help.klaviyo.com/hc/en-us/articles/115005078967-Create-and-Add-Contacts-to-a-New-List) as well as \[uploading historical metric data via a CSV file upload](https://help.klaviyo.com/hc/en-us/articles/115005081247-Manually-Import-Historical-Event-Data). Additionally, any individual profile property or list membership may be edited manually in the app.

## Source

- https://developers.klaviyo.com/en/docs/use_data_in_klaviyo
