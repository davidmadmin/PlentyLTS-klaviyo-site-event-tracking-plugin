# Sparse fieldsets
Learn how to request specific fields from resources.



Sparse fieldsets allow you to request only specific fields from a resource or collection. Note that support for this functionality is endpoint-specific. Refer to the `fields` query parameter in our \[API reference documentation](https://developers.klaviyo.com/en/reference/api_overview).



## Sparse fieldsets syntax



Sparse fieldsets are specified using `?fields\[TYPE]=field1,field2` as a query parameter, where `TYPE` is the singular resource type, e.g., `profile`, from which to select only `field1` and `field2.`



> **🚧**

> 

> 

> The specified field(s) must be in a comma-separated list. Watch out for whitespaces before or after each comma.

> 



## Example request and response



A request to \[Get Catalogs Variants](https://developers.klaviyo.com/en/reference/get_catalog_variants) returns a considerable amount of data, including up to 15 different attributes per catalog variant. Large responses like these can lead to extra HTTP responses and data stored in memory. It’s likely you are only interested in a fraction of this data. Fortunately, this customization can be achieved with sparse fieldsets.



The following request to Get Catalogs Variant uses sparse fieldsets to return only `external_id` and `title` attributes from each catalog variant in the response:



RequestResponse



```bash
curl --request GET \\

--url'https://a.klaviyo.com/api/catalog-variants/?fields\[catalog-variant]=external_id,title'\\

--header 'Authorization: Klaviyo-API-Key your-private-api-key' \\

--header 'accept: application/json' \\

--header 'revision: 2023-09-15'
```



Note that the `relationships` and `links` fields are still fully populated in the response. Each `attribute` object only contains the `external_id` and `title` fields as requested.



## Sparse fieldsets with included resource types



You can specify sparse fieldsets for included resource types. For example, you might want to retrieve profile email addresses linked to a list of events. To do this, you must use the `include` query parameter to include the `profile` resource. Then, you can set `profile` as the resource type and `email` as a field as shown in the example below:



RequestResponse



```bash
curl --request GET \\

--url'https://a.klaviyo.com/api/events?include=profile\&fields\[profile]=email'\\

--header 'Authorization: Klaviyo-API-Key your-private-api-key' \\

--header 'accept: application/json' \\

--header 'revision: 2023-09-15'
```



Note that the `included` field of the response payload contains a list of profiles with its `attributes` limited to the `email` field as requested.



> **🚧**

> 

> 

> Note that sparse fieldsets can only be used on fields that exist across a resource. For example, across the event resource, you can use sparse fieldsets to only return the `event_properties` field. However, you cannot use sparse fieldsets to only return specific fields within the `event_properties` field itself.

> 



## Additional fields



You can use ?`additional-fields` as a query parameter to return additional fields not shown by default in the response body. This query parameter shares the same syntax as sparse fieldsets, i.e., `?additional-fields\[TYPE]=field,` where `TYPE` is the singular resource type, e.g., `profile`, and `field` is the additional field. Support for `additional-fields` is endpoint-specific.



## Example request and response



The following request to \[Get List](https://developers.klaviyo.com/en/reference/get_list) uses the `?additional-fields` query parameter to return `profile_count`, a field representing the number of profiles on a given list:



RequestResponse



```bash
curl --request GET \\

--url'https://a.klaviyo.com/api/lists/RB89mt/?additional-fields\[list]=profile_count'\\

--header 'Authorization: Klaviyo-API-Key your-private-api-key' \\

--header 'accept: application/json' \\

--header 'revision: 2023-09-15'
```



## Predictive analytics



The `?additional-fields` parameter allows you to retrieve predictive analytics via API, which are valuable for monitoring metrics such as \[customer lifetime value](https://help.klaviyo.com/hc/en-us/articles/17797865070235) (CLV) and order predictions for profiles.



> **📘**

> 

> 

> To be eligible for predictive analytics, your account must meet the following conditions:

> 

> - At least 500 customers have placed an order.

> - You have an ecommerce integration or use our API to send placed orders.

> - You have at least 180 days of order history, including orders within the last 30 days.

> - You have customers who have placed 3 or more orders.

> 

> Learn more about \[Klaviyo's predictive analytics](https://help.klaviyo.com/hc/en-us/articles/360020919731).

> 



The full list of predictive analytics fields that can be returned for a profile are:



| **Field** | **Description** |

| --- | --- |

| `historic_clv` | Total value of all historically placed orders. |

| `predicted_clv` | Predicted value of all placed orders in the next 365 days. |

| `total_clv` | Sum of historic and predicted CLV. |

| `historic_number_of_orders` | Number of placed orders. |

| `predicted_number_of_orders` | Predicted number of placed orders in the next 365 days. |

| `average_days_between_orders` | Average number of days between orders, over all time. |

| `average_order_value` | Average value of historically placed orders. |

| `churn_probability` | Probability that the customer will never make another purchase, or churn. |

| `expected_date_of_next_order` | Expected date of next order, calculated at the time of their most recent order. |

| `ranked_channel_affinity` | Lists the profile's subscribed channels from most-preferred to least, for example, `\["sms", "email", "push"]`. If a profile is not subscribed to any channels, this field has a value of `None`. |



> **📘**

> 

> 

> You can use sparse fieldsets to request for only a field(s) not included by default in the response. For example, you can request for additional fields with sparse fieldsets to include only `predictive_analytics` in the response. Be sure to use both query parameters in your request.

> 



## SDK example (Node, PHP, Python, Ruby)



This SDK example shows how to request events along with their related profile attributes limited to `external_id` and `title` fields:



NodePHPPythonRuby



`import { ConfigWrapper, Events } from 'klaviyo-api';

ConfigWrapper(process.env\["KLAVIYO_PRIVATE_API_KEY"]));



const eventsList = await Events.getEvents({fieldsProfile:\["external_id","title"],include:\["profile"]});`

