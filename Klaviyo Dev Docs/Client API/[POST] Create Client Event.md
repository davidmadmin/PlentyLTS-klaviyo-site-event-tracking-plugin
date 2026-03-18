\# Create Client Event



https://a.klaviyo.com/client/events



Create a new event to track a profile's activity.



This endpoint is specifically designed to be called from publicly-browseable, client-side environments only and requires a \[public API key (site ID)](https://www.klaviyo.com/settings/account/api-keys). Never use a private API key with our client-side endpoints.



Do not use this endpoint from server-side applications.



To create events from server-side applications, instead use \[POST /api/events](https://developers.klaviyo.com/en/reference/create\_event).



Note that to update a profile's existing identifiers (e.g., email), you must use a server-side endpoint authenticated by a private API key. Attempts to do so via client-side endpoints will return a 202, however the identifier field(s) will not be updated.



\*Rate limits\*:



Burst: `350/s`



Steady: `3500/m`



\*\*Scopes:\*\* `events:write`



\### \*\*Query Params\*\*



\- \*\*company\_id\*\* (string, required)

&#x20;   

&#x20;   Your Public API Key / Site ID. See \[this article](https://help.klaviyo.com/hc/en-us/articles/115005062267) for more details.

&#x20;   



\### Body Params



\- \*\*data\*\* (object, required)

&#x20;   - \*\*type\*\* (string, enum, required)

&#x20;       

&#x20;       Allowed: `event`

&#x20;       

&#x20;   - \*\*attributes\*\* (object, required)

&#x20;       - \*\*properties\*\* (object, required)

&#x20;           

&#x20;           Properties of this event (must not exceed 400 properties). The size of the event payload must not exceed 5 MB, and each string cannot be larger than 100 KB. For a full list of data limits on event payloads, see \[Limitations](https://developers.klaviyo.com/en/reference/events\_api\_overview#limitations). Note any top-level property that is not an object can be used to create segments. The `$extra` property records any non-segmentable values that can be referenced later, e.g., HTML templates are useful on a segment but are not used to create a segment.

&#x20;           

&#x20;       - \*\*time\*\* (date-time)

&#x20;           

&#x20;           When this event occurred. By default, the time the request was received will be used. The time is truncated to the second. The time must be after the year 2000 and can only be up to 1 year in the future.

&#x20;           

&#x20;       - \*\*value\*\* (number)

&#x20;           

&#x20;           A numeric, monetary value to associate with this event. For example, the dollar amount of a purchase.

&#x20;           

&#x20;       - \*\*value\_currency\*\* (string)

&#x20;           

&#x20;           The ISO 4217 currency code of the value associated with the event.

&#x20;           

&#x20;       - \*\*unique\_id\*\* (string)

&#x20;       - \*\*metric\*\* (object, required)

&#x20;           - \*\*data\*\* (object, required)

&#x20;               - type (string, enum, requiered)

&#x20;                   

&#x20;                   Allowed: `metric`

&#x20;                   

&#x20;               - \*\*attributes\*\* (object, required)

&#x20;                   - \*\*name\*\* (string, required)

&#x20;                       

&#x20;                       Name of the event. Must be less than 128 characters.

&#x20;                       

&#x20;                   - \*\*service\*\* (string)

&#x20;                       

&#x20;                       This is for advanced usage. For api requests, this should use the default, which is set to api.

&#x20;                       

&#x20;       - \*\*profile\*\* (object, requiered)

&#x20;           - \*\*data\*\* (object, required)

&#x20;               - \*\*type\*\* (string, enum, required)

&#x20;               - \*\*id\*\* (string)

&#x20;               - \*\*attributes\*\* (object, required)

&#x20;                   - \*\*email\*\* (string,,required)

&#x20;                       

&#x20;                       Individual's email address

&#x20;                       

&#x20;                   - \*\*phone\_number\*\* (string)

&#x20;                       

&#x20;                       Individual's phone number in E.164 format

&#x20;                       

&#x20;                   - \*\*external\_id\*\* (string)

&#x20;                       

&#x20;                       A unique identifier used by customers to associate Klaviyo profiles with profiles in an external system, such as a point-of-sale system. Format varies based on the external system.

&#x20;                       

&#x20;                   - \*\*anonymous\_id\*\* (string)

&#x20;                   - \*\*\_kx\*\* (string)

&#x20;                       

&#x20;                       Also known as the `exchange\_id`, this is an encrypted identifier used for identifying a

&#x20;                       

&#x20;                       profile by Klaviyo's web tracking.

&#x20;                       

&#x20;                       You can use this field as a filter when retrieving profiles via the Get Profiles endpoint.

&#x20;                       

&#x20;                   - \*\*first\_name\*\* (string)

&#x20;                       

&#x20;                       Individual's first name

&#x20;                       

&#x20;                   - \*\*last\_name\*\* (string)

&#x20;                       

&#x20;                       Individual's last name

&#x20;                       

&#x20;                   - \*\*organization\*\* (string)

&#x20;                       

&#x20;                       Name of the company or organization within the company for whom the individual works

&#x20;                       

&#x20;                   - \*\*locale\*\* (string)

&#x20;                       

&#x20;                       The locale of the profile, in the IETF BCP 47 language tag format like (ISO 639-1/2)-(ISO 3166 alpha-2)

&#x20;                       

&#x20;                   - \*\*title\*\* (string

&#x20;                       

&#x20;                       Individual's job title

&#x20;                       

&#x20;                   - \*\*image\*\* (string)

&#x20;                       

&#x20;                       URL pointing to the location of a profile image

&#x20;                       

&#x20;                   - \*\*location\*\* (object)

&#x20;                       - \*\*adress1\*\* (string)

&#x20;                           

&#x20;                           First line of street address

&#x20;                           

&#x20;                       - \*\*adress2\*\* (string)

&#x20;                           

&#x20;                           Second line of street address

&#x20;                           

&#x20;                       - \*\*city\*\* (string)

&#x20;                           

&#x20;                           City name

&#x20;                           

&#x20;                       - \*\*country\*\* (string)

&#x20;                           

&#x20;                           Country name

&#x20;                           

&#x20;                       - \*\*latitude\*\* (string)

&#x20;                           

&#x20;                           Latitude coordinate. We recommend providing a precision of four decimal places.

&#x20;                           

&#x20;                       - \*\*longitude\*\* (string)

&#x20;                           

&#x20;                           Longitude coordinate. We recommend providing a precision of four decimal places.

&#x20;                           

&#x20;                       - \*\*region\*\* (string)

&#x20;                           

&#x20;                           Region within a country, such as state or province

&#x20;                           

&#x20;                       - \*\*zip\*\* (string)

&#x20;                           

&#x20;                           Zip code

&#x20;                           

&#x20;                       - \*\*timezone\*\* (string)

&#x20;                       - \*\*ip\*\* (string)

&#x20;                           

&#x20;                           IP Address

&#x20;                           

&#x20;                   - \*\*properties\*\* (object)

&#x20;                       

&#x20;                       An object containing key/value pairs for any custom properties assigned to this profile

&#x20;                       



Example:



```html

curl --request POST \\

&#x20;    --url https://a.klaviyo.com/client/events \\

&#x20;    --header 'accept: application/vnd.api+json' \\

&#x20;    --header 'content-type: application/vnd.api+json' \\

&#x20;    --header 'revision: 2026-01-15' \\

&#x20;    --data '

{

&#x20; "data": {

&#x20;   "type": "event",

&#x20;   "attributes": {

&#x20;     "properties": {

&#x20;       "Brand": "Kids Book",

&#x20;       "ProductID": 1111,

&#x20;       "ProductName": "Winnie the Pooh"

&#x20;     },

&#x20;     "time": "2022-11-08T00:00:00+00:00",

&#x20;     "value": 9.99,

&#x20;     "value\_currency": "USD",

&#x20;     "unique\_id": "string",

&#x20;     "metric": {

&#x20;       "data": {

&#x20;         "type": "metric",

&#x20;         "attributes": {

&#x20;           "name": "Viewed Product",

&#x20;           "service": "string"

&#x20;         }

&#x20;       }

&#x20;     },

&#x20;     "profile": {

&#x20;       "data": {

&#x20;         "type": "profile",

&#x20;         "id": "string",

&#x20;         "attributes": {

&#x20;           "email": "sarah.mason@klaviyo-demo.com",

&#x20;           "phone\_number": "+15005550006",

&#x20;           "external\_id": "string",

&#x20;           "anonymous\_id": "string",

&#x20;           "\_kx": "string",

&#x20;           "first\_name": "Sarah",

&#x20;           "last\_name": "Mason",

&#x20;           "organization": "Example Corporation",

&#x20;           "locale": "en-US",

&#x20;           "title": "Regional Manager",

&#x20;           "image": "https://images.pexels.com/photos/3760854/pexels-photo-3760854.jpeg",

&#x20;           "location": {

&#x20;             "address1": "89 E 42nd St",

&#x20;             "address2": "1st floor",

&#x20;             "city": "New York",

&#x20;             "country": "United States",

&#x20;             "latitude": "string",

&#x20;             "longitude": "string",

&#x20;             "region": "NY",

&#x20;             "zip": "10017",

&#x20;             "timezone": "America/New\_York",

&#x20;             "ip": "127.0.0.1"

&#x20;           },

&#x20;           "properties": {

&#x20;             "pseudonym": "Dr. Octopus"

&#x20;           },

&#x20;           "meta": {

&#x20;             "patch\_properties": {

&#x20;               "append": {

&#x20;                 "skus": "92538"

&#x20;               }

&#x20;             }

&#x20;           }

&#x20;         }

&#x20;       }

&#x20;     }

&#x20;   }

&#x20; }

}

'

```

