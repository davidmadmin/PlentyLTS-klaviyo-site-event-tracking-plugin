# Profiles API overview



## Before you begin



Check out our general \[API overview](https://developers.klaviyo.com/en/reference/api_overview) to make sure you’re ready to get started with specific endpoints.



You can use our \[Profiles API](https://developers.klaviyo.com/en/reference/get_profiles) to create unique experiences based on profile data. A profile represents a person’s contact stored in your Klaviyo account. There are two types of profiles captured in Klaviyo which can be accessed via the Profiles API:



\- **Active profiles**

       

       Profiles that can be messaged via email or SMS. For example, a profile that has subscribed to marketing updates via sign-up form.

       

\- **Suppressed profiles**

       

       Profiles that cannot receive emails, even if they have provided consent. Learn more about \[suppressed email profiles](https://help.klaviyo.com/hc/en-us/articles/115005246108).

       



> **📘**

> 

> 

> Active profiles also include profiles representing customers who have not opted-in to marketing updates - for example, a profile that has provided an email for order confirmation and tracking purposes. Learn about \[collecting consent and best practices](https://developers.klaviyo.com/en/docs/collect_email_and_sms_consent_via_api).

> 



## Use cases



> **📘**

> 

> 

> To delete profiles, use Klaviyo's \[Data Privacy API](https://developers.klaviyo.com/en/reference/request_profile_deletion).

> 



Here are some example use cases supported by the Profiles API:



\- Create a profile with a set of profile attributes, and if it already exists, update the existing profile.

\- Add custom fields to profiles that can be used for segmentation, flows, and template personalization.

\- Retrieve profile data, consent status, and predictive analytics.

\- Subscribe/unsubscribe profiles to email and/or SMS marketing.

\- Suppress/unsuppress profiles for email marketing.



You can find example code for all of these use cases in our \[api-examples](https://github.com/klaviyo-labs/api-examples/tree/main/profiles) repo.



## Data model



## Profile identifiers



Profile identifiers are important for fetching profiles and merging shared data associated with a profile. A profile must have at least 1 profile identifier:



\- `email`(recommended for use as the primary identifier)

       

       The profile’s valid email address (must be <= 100 characters). We recommend using \[regex for email validation](https://emailregex.com/index.html).

       

\- `phone_number`

       

       The profile’s phone number (a valid E.164 number, e.g., +15005550006).

       

       > **🚧Phone numbers must be in E.164 format**

       > 

       > 

       > We recommend using a library like \[libphonenumber](https://github.com/google/libphonenumber) to ensure numbers are valid and properly formatted prior to sending.

       > 

\- `external_id`

       

       A unique identifier to associate Klaviyo profiles with profiles in an external system. Usually set via integrations or API.

       

       > **🚧**

       > 

       > 

       > `external_id` is not involved in profile merging, so its use can lead to duplicate profiles. This identifier should only be used if you are aware of its \[impact on profile duplication](https://developers.klaviyo.com/en/docs/custom_integration_faqs#should-i-use-emailphone-or-external-id-as-my-unique-identifier).

       > 



## Additional attributes



A profile can contain additional personal information, including:



\- `first_name` and `last_name`

       

       The profile’s first and last names.

       

\- `organization` and `title`

       

       The profile’s organization and their job title.

       

\- `image`

       

       The profile image’s URL.

       

\- `locale`

       

       The locale of the profile, in the IETF BCP 47 language tag format `ISO 639-1/2)-(ISO 3166 alpha-2` e.g., `en-US`.

       

\- `location`

       

       An object containing location-related information.

       

       - `address1` and `address2`

           

           First and second lines of the profile’s street address.

           

       - `city, country, region,` and `zip`

           

           Fields for the profile’s city, country, region (e.g., state), and zip code.

           

       - `latitude` and `longitude`

           

           The profile’s latitude and longitude coordinates.

           

       - `timezone`

           

           The profile’s timezone name. Names from the \[IANA Time Zone Database](https://www.iana.org/time-zones) are recommended.

           

       - `ip`

           

           The profile’s IP address.

           



## Profile properties



A profile has a `properties` object for storing custom properties. Some use cases of these properties include:



\- **Segmentation**

       

       Use non-object property values to segment your audience and target customers with personalized content, e.g., create a segment for profiles who identify as women and share brand preferences.

       

\- **Flows**

       

       Filter flows based on profile properties, e.g., store a `birthday` field collected via form to use in a \[date property-triggered flow](https://help.klaviyo.com/hc/en-us/articles/360002732652).

       

\- **Reporting**

       

       Generate reports to analyze customer behavior based on profile property, e.g., create a report that details performance of the "Clicked Email" metric for a campaign that contains dynamic content based on gender.

       



## Setting the `locale` property



We have expanded support for the `$locale` property and added `$locale`, `$locale_language`, and `$locale_country` to the \[profile properties reference](https://help.klaviyo.com/hc/en-us/articles/115005074627).



Klaviyo generates `$locale_language` and `$locale_country` on a profile by default. The `$locale` property can be updated with the \[Update Profile](https://developers.klaviyo.com/en/reference/update_profile) endpoint. When setting this property via API, use the IETF BCP 47 language tag format `ISO 639-1/2)-(ISO 3166 alpha-2`. For example, `en-US` includes the language subtag for English and the region subtag for United States.



The `locale` property can be updated from a variety of sources, such as from a custom integration.



## Additional fields



When you make a Get Profile(s) request, there are additional fields that are not returned by default in the response. You might want to access subscription data to filter out profiles that have been suppressed for a particular reason and/or from a specific list. Use \[additional fields](https://developers.klaviyo.com/en/docs/sparse_fieldsets#additional-fields) as a query parameter if you’d like to retrieve subscription data and/or predictive analytics that can help you monitor your business’s performance.



## Subscription data



It’s best practice to collect consent from profiles to subscribe them to email and SMS marketing (e.g., via sign-up forms). When subscriptions-related data is collected (such as consent or list suppressions) it is stored in a profile’s subscriptions object. You must use `?additional-fields\[profile]=subscriptions` as a query parameter to include this data in your response.



We recommend including a given profile in no more than one subscribe job every 30 minutes to ensure the profiles' subscription status is not impacted by additional rate limits.



> **🚧**

> 

> 

> You cannot subscribe a profile and edit custom properties with one API request. If you would like to subscribe a profile and modify the profile's properties, you need to first subscribe the profile with \[Subscribe Profiles](https://developers.klaviyo.com/en/reference/subscribe_profiles). Then, make a subsequent call to \[update custom profile properties](https://developers.klaviyo.com/en/reference/update_profile) if desired.

> 



The `subscriptions` object should look like the example object shown below:




```json
    "subscriptions": {

       "email": {

            "marketing": {

                "can_receive_email_marketing": true,

                "consent": "SUBSCRIBED",

                "consent_timestamp": "2023-02-21T20:07:38+00:00",

                "last_updated": "2023-02-21T20:07:38+00:00",

                "method": "PREFERENCE_PAGE",

                "method_detail": "mydomain.com/signup",

                "custom_method_detail": "marketing drive",

                "double_optin": "True",

                "suppression": \[

                 {

                   "reason": "HARD_BOUNCE",

                   "timestamp": "2023-02-21T20:07:38+00:00"

                 }

                ],

                "list_suppressions": \[

                 {

                  "list_id": "Y6nRLr",

                  "reason": "USER_SUPPRESSED",

                  "timestamp": "2023-02-21T20:07:38+00:00"

                 }

               ]

             }

           },

       "sms": {

         "marketing": {

             "can_receive_sms_marketing": true,

             "consent": "SUBSCRIBED",

             "consent_timestamp": "2023-02-21T20:07:38+00:00",

             "method": "TEXT",

             "method_detail": "JOIN",

             "last_updated": "2023-02-21T20:07:38+00:00"

           }

        }

},
```



Note that the `subscriptions` object contains `email` and `sms` objects, for email and sms marketing data respectively. In addition to consent information, the `email` object includes suppression-related data with reasons for suppression, timestamps, and any lists a profile may be suppressed from.



> **🚧**

> 

> 

> When subscribing a profile to SMS while age-gating is enabled, `age_gated_date_of_birth` is a required field. If this field is not included or the DOB provided does not meet the region's requirements, the call returns a `400` error.

> 



In the following example request to \[Get Profiles](https://developers.klaviyo.com/en/reference/get_profiles), the `subscriptions` object is included as an additional field. This object is useful for fetching suppression data, such as the exact time (within a given timeframe) a list or overall marketing suppression took place (see \*Available `subscriptions` filters\*):



Request



```bash
curl --get 'https://a.klaviyo.com/api/profiles/' \\

--data-urlencode 'additional-fields\[profile]=subscriptions' \\

--header 'Authorization: Klaviyo-API-Key your-private-api-key' \\

--header 'revision: 2023-12-15'
```



## Fetching suppressed profiles



You may want to retrieve profiles that have recently been suppressed from marketing. To fetch suppressed profiles, your request to Get Profiles should look a little like the request below:



Request



```bash
curl --get 'https://a.klaviyo.com/api/profiles/' \\

--data-urlencode 'additional-fields\[profile]=subscriptions' \\

--data-urlencode 'filter=greater-than(subscriptions.email.marketing.suppression.timestamp,2023-12-05T00:00:00Z)' \\

--header 'Authorization: Klaviyo-API-Key your-private-api-key' \\

--header 'revision: 2023-12-15'
```



> **📘**

> 

> 

> You do not need to include the `subscriptions` object in your response to filter profiles by suppression fields.

> 



## Fetching suppressed profiles from a list



The following Get Profiles request fetches any profiles who were recently suppressed \*from a specific list\*:



Request



```bash
curl --get 'https://a.klaviyo.com/api/profiles/' \\

--data-urlencode 'additional-fields\[profile]=subscriptions' \\

--data-urlencode 'filter=and(equals(subscriptions.email.marketing.list_suppressions.list_id,"LIST_ID"),greater-than(subscriptions.email.marketing.list_suppressions.timestamp,2023-12-05T00:00:00Z))' \\

--header 'Authorization: Klaviyo-API-Key your-private-api-key' \\

--header 'revision: 2023-12-15'
```



## Suppression data filters



You can apply the following filters to fetch profiles by suppression data including suppression reason, timestamp, and list ID. For example, you can fetch excluded profiles by list suppression and time of suppression with the following query:



`?filter=greater-than(subscriptions.email.marketing.list_suppressions.timestamp,YYYY-MM-DD),equals(subscriptions.email.marketing.list_suppressions.list_id,"LIST_ID")`.



| **Filter description** | **Filter structure** | **Available filters** | **Example** |

| --- | --- | --- | --- |

| Get excluded profiles by timestamp of suppression | `subscriptions.email.marketing.suppression.timestamp` | - `greater-than`

- `greater-or-equal`

- `less-than`

- `less-or-equal` | `?filter=greater-or-equal(subscriptions.email.marketing.suppression.timestamp,YYYY-MM-DD)` |

| Get excluded profiles by suppression reason | `subscriptions.email.marketing.suppression.reason` | `equals` | `?filter=equals(subscriptions.email.marketing.suppression.reason,"UNSUBSCRIBE")`Suppression reasons: `UNSUBSCRIBE`, `SPAM_COMPLAINT`, `HARD_BOUNCE`, `INVALID_EMAIL`, `USER_SUPPRESSED`. |

| Get excluded profiles by timestamp of list suppression | `subscriptions.email.marketing.list_suppressions.timestamp` | - `greater-than`

- `greater-or-equal`

- `less-than`

- `less-or-equal` | `?filter=less-or-equal(subscriptions.email.marketing.list_suppressions.timestamp,YYYY-MM-DD)` |

| Get excluded profiles by list suppression reason | `subscriptions.email.marketing.list_suppressions.reason` | `equals` | `?filter=equals(subscriptions.email.marketing.list_suppressions.reason,"UNSUBSCRIBE")`Suppression reasons: `UNSUBSCRIBE`, `SPAM_COMPLAINT`, `HARD_BOUNCE`, `INVALID_EMAIL`, `USER_SUPPRESSED`. |

| Get excluded profiles by list ID | `subscriptions.email.marketing.list_suppressions.list_id` | `equals` | `?filter=greater-or-equal(subscriptions.email.marketing.list_suppressions.list_id,"LIST_ID")` |



## Predictive analytics



You can also retrieve \[predictive analytics](https://help.klaviyo.com/hc/en-us/articles/360020919731) with the additional fields query parameter (`?additional-fields\[profile]=predictive_analytics`). Note that there are some \[conditions](https://developers.klaviyo.com/en/docs/sparse_fieldsets#predictive-analytics) your account must meet in order for predictive analytics to be calculated.



If your account is eligible for predictive analytics, the above query should return a `predictive_analytics` object like the example object below:




```json
"predictive_analytics": {

       "historic_clv": 93.87,

       "predicted_clv": 27.24,

       "total_clv": 121.11,

       "historic_number_of_orders": 2,

       "predicted_number_of_orders": 0.54,

       "average_days_between_orders": 189,

       "average_order_value": 46.94,

       "churn_probability": 0.89,

       "expected_date_of_next_order": "2022-11-08T00:00:00",

       "ranked_channel_affinity": \["sms", "email", "push"]

     }
```



For more information about each field, please review the sparse fieldset guidance for \[predictive analytics](https://developers.klaviyo.com/en/docs/sparse_fieldsets#predictive-analytics).



## Create or Update Profile



> **📘**

> 

> 

> Check out our \[YouTube tutorial on creating and updating Klaviyo profiles via API](https://www.youtube.com/watch?v=Lir9g0pQfCM\&list=PLHkNfHgtxcUanrkMnKPdkRzuWU7MGv_xM\&index=1).

> 



To create a profile or update an existing one, you’ll need at least one profile identifier. Your request payload for \[Create or Update Profile](https://developers.klaviyo.com/en/reference/create_or_update_profile) should be formatted like the example below:



Request



`{

       "data": {

           "type": "profile",

           "attributes": {

               "email": "sarah.mason@klaviyo-demo.com",

               "first_name": "Sarah",

               "last_name": "Mason"

           },

           "properties": {

               "birthday": "1989-12-13T00:00:00Z"

           }

       }

}`



> **🚧**

> 

> 

> Note that setting a field to `null` will clear out the field, whereas not including a field in your request will leave it unchanged.

> 



> **📘**

> 

> 

> When creating a profile, note that if you use a phone number as a profile identifier and you haven’t \[set up SMS in your Klaviyo account](https://help.klaviyo.com/hc/en-us/articles/4404274419355), you’ll need to include at least one other identifier (`email` or `external_id`) for the API call to work.

> 



## Bulk Import Profiles API



Our Profiles API has support for creating and updating profiles via \[Bulk Import Profiles](https://developers.klaviyo.com/en/reference/bulk_import_profiles). To learn more, see our \[Bulk Import Profiles API guide](https://developers.klaviyo.com/en/docs/use_klaviyos_bulk_profile_import_api).



## Get Profile(s)



> **📘**

> 

> 

> Check out our \[YouTube tutorial on retrieving and filtering customer profile data](https://www.youtube.com/watch?v=bHXJlV7wP0Q\&list=PLHkNfHgtxcUanrkMnKPdkRzuWU7MGv_xM) with the Get Profiles API.

> 



When making a \[Get Profile](https://developers.klaviyo.com/en/reference/get_profile) or \[Get Profiles](https://developers.klaviyo.com/en/reference/get_profiles) request, here’s an example of how a profile should look in your response:




```json
{

       "type": "profile",

       "id": "01H260JDT1NJVY1EF61ET64Z7F",

       "attributes": {

           "email": "henry.downing@klaviyo-demo.com",

           "first_name": "Henry",

           "last_name": "Downing",

           "created": "2023-06-05T14:49:54+00:00",

           "updated": "2023-07-17T14:36:25+00:00",

           "last_event_date": "2023-06-05T14:49:56+00:00",

           "location": {

               "address1": "225 Franklin St",

               "address2": "6th floor",

               "city": "Boston",

               ...

           },

           "properties": {

               "FavoriteColors": \["blue","yellow"],

               ...

           }

       },

       "relationships": {

           "lists": {

               "links": {

                   "self": "https://a.klaviyo.com/api/profiles/01H260JDT1NJVY1EF61ET64Z7F/relationships/lists/",

                   "related": "https://a.klaviyo.com/api/profiles/01H260JDT1NJVY1EF61ET64Z7F/lists/"

               }

           },

           "segments": {

               "links": {

                   "self": "https://a.klaviyo.com/api/profiles/01H260JDT1NJVY1EF61ET64Z7F/relationships/segments/",

                   "related": "https://a.klaviyo.com/api/profiles/01H260JDT1NJVY1EF61ET64Z7F/segments/"

               }

           }

       },

       "links": {

           "self": "https://a.klaviyo.com/api/profiles/01H260JDT1NJVY1EF61ET64Z7F/"

       }

},
```



Note that the `updated` field represents the last time any profile property has been changed, including changes to a profile's timestamps like `last_event_date` (a timestamp representing when a profile was last active).



## Querying profiles



Querying profiles with the Profiles API is useful for monitoring valuable information like the time a profile has last been updated, collected email and SMS consent, and average order value. Check out the supported query parameters below and \[test them out with our latest Postman collection](https://developers.klaviyo.com/en/docs/use_klaviyos_postman_collections). Note that support for given operators and fields is endpoint-specific. Review the \[API reference documentation](https://developers.klaviyo.com/en/reference/get_profiles) for more information on allowed fields and query operators.



| **Parameter** | **Description** | **Query example** |

| --- | --- | --- |

| `filter` | Retrieve a subset of profiles, e.g., profiles created within a given time frame. Learn about the \[filter query parameter](https://developers.klaviyo.com/en/docs/filtering_). | `GET /api/profiles?filter=equals(email,"sarah.mason@klaviyo-demo.com")GET /api/profiles?filter=equals(phone_number,"+15005550006")GET /api/profiles?filter=greater-than(created,"2023-06-05T12:30:00+00:00")` |

| `sort` | Sort profiles, e.g., by updated datetime in descending order (newest to oldest). Learn about the \[sort query parameter](https://developers.klaviyo.com/en/docs/sorting_). | `GET /api/profiles?sort=-updated` |

| `fields` | Request for only specified profile data (e.g., emails). Learn more about \[sparse fieldsets](https://developers.klaviyo.com/en/docs/sparse_fieldsets). | `GET /api/profiles?fields\[profile]=email, phone_number` |

| `additional-fields` | Request for fields not returned by default (e.g., subscriptions). Learn about \[additional fields](https://developers.klaviyo.com/en/docs/sparse_fieldsets#additional-fields). | `GET /api/profiles?additional-fields\[profile]=subscriptions` |



## Limitations



A set limit is allotted for each unique data identifier or digested piece of information. In most instances, if you reach the maximum data limit for a set category, the overflow information will not be processed and messages will be rejected. The following table provides the data limits for each profile property so you can ensure successful delivery and storage.



| **ID** | **Category** | **Definition** | **Limit** |

| --- | --- | --- | --- |

| 1 | Profile payload size | Profile payloads submitted via any mode (Profile APIs, Event APIs, SFTP upload, via the Klaviyo UI, etc); payloads that exceed this limit will be rejected | 100 kB |



## Next steps



Using your Klaviyo test account and \[Postman](https://www.postman.com/klaviyo), try out the following:



\- Create profiles with \[Create Profile](https://developers.klaviyo.com/en/reference/create_profile) and \[Bulk Import Profiles](https://developers.klaviyo.com/en/reference/bulk_import_profiles).

\- Use a filter on \[Get Profiles](https://developers.klaviyo.com/en/reference/get_profiles) to retrieve a profile with a given identifier, e.g., email. Use the profile’s ID to update its custom properties with \[Update Profile](https://developers.klaviyo.com/en/reference/update_profile).

\- Subscribe profiles to an existing list in your test account.

\- Retrieve subscriptions data from a call to \[Get Profiles](https://developers.klaviyo.com/en/reference/get_profiles) with the `additional-fields` query parameter.

\- Try out some of the query parameters above to customize your response.



## Troubleshooting



Below are error status codes you may encounter with the Profiles API, including the corresponding reasons for these errors to help you resolve them.



| **Status code** | **Reasons** |

| --- | --- |

| 400 | Profile(s) are missing 1 or more required fields.Profile(s) have an invalid email address.Profile(s) have an invalid phone number without a valid email address.The provided list is invalid, e.g., the list ID does not exist in the account. |

| 401 | Missing auth information. See details on \[key authentication](https://developers.klaviyo.com/en/reference/api_overview#authentication). |

| 403 | API key is missing required API scopes. This endpoint requires both `profiles:write` and `lists:write`. |

| 409 | A profile already exists with one of the identifiers provided. We recommend using \[Create or Update Profile](https://developers.klaviyo.com/en/reference/create_or_update_profile), which creates a given profile only if it does not already exist and otherwise updates the profile matching the provided identifiers. |

| 413 | Request payload size is too large (> 5 MB), see \*Limitations\* above. |

| 429 | Rate limit exceeded. |

## Source

- https://developers.klaviyo.com/en/docs/profiles_api_overview
