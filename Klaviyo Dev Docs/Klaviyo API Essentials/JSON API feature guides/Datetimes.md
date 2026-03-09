## **Date and timestamp support**



Note that event datetimes sent via the legacy v1/v2 endpoints support Unix timestamps in addition to datetime ISO 8601 formats. However, our new APIs do not support Unix timestamps. It is recommended that you convert the Unix timestamp to a supported ISO 8601 format. See the \[MDN docs on the toISOString() method](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString) for more details on conversion.



## **Datetime formatting**



All datetimes across all new APIs in URLs, requests, and response bodies must use the \[ISO 8601 RFC 3339](https://datatracker.ietf.org/doc/html/rfc3339) format, such as `YYYY-MM-DDTHH:MM:SS.\[mmm]`. Note that the letters used in the datetime syntax must always be uppercase. Some examples include:



\- `2023-08-15T12:30:00`

\- `2023-08-15T12:30:00Z`

\- `2023-08-15 12:30:00Z`

\- `2023-08-15T12:30:00+03:00`



For more information on recognized formats, refer to our \[acceptable date and timestamp formats guide](https://developers.klaviyo.com/en/docs/acceptable_date_and_timestamp_formats_for_profile_and_event_properties) for profile and event properties.



## **URI encoding**



Datetimes can contain non-URL-safe characters. To combat this, we recommend that you always URI-encode your datetime values. Refer to the \[MDN docs on encodeURIComponent](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent) for more details.



## **Example request and response**



In this example, we have requested all events that have a datetime greater than `2023-08-07T12:30:00.710Z:`



RequestResponse



```bash
curl --request GET \\

        --url 'https://a.klaviyo.com/api/events/?filter=greater-than(datetime,2023-08-07T12:30:00.710Z)' \\

        --header 'Authorization: Klaviyo-API-Key your-private-api-key' \\

        --header 'accept: application/json' \\

        --header 'revision: 2023-07-15'
```

