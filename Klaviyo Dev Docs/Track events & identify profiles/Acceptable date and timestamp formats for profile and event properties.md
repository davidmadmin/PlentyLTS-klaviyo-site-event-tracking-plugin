### **Acceptable date and timestamp formats for profile and event properties**Learn acceptable date and timestamp formats for profile properties added via API.

## **Acceptable date and timestamp formats**

When adding an event or profile property to Klaviyo via API, you must use one of the recognized formats outlined below with a few notable exceptions.

An event's `time` sent via the [Create Client Event API](https://developers.klaviyo.com/en/reference/create_client_event) and the [Create Event API](https://developers.klaviyo.com/en/reference/create_event) must be in ISO 8601 format: `YYYY-MM-DDTHH:MM:SS.mmmmmm`. Note that event datetimes sent via the legacy v1/v2 endpoints support a Unix timestamp in addition to datetime ISO 8601 format, while our newest set of APIs do not support Unix timestamps.

When using JSON:API filtering in your GET requests, input a `datetime` or a `timestamp`, depending on the filter.

A `datetime` is formatted in ISO 8601 format, such as `YYYY-MM-DDTHH:MM:SS.[mmm]`. Some examples include:

- `2018-12-27`
- `2018-12-27T12:30:00`
- `2018-12-27T12:30:00Z`
- `2018-12-27T12:30:00.710`
- `2018-12-27T12:30:00.710Z`
- `2018-12-27T12:30:00+03:00`

A `timestamp` is formatted as a Unix Epoch time such as `978354000`.

### **Missing or improperly formatted date and timestamp data**

If the hour, minute, or second, is not included in the event's datetime values, any empty data will default to `0`. For example, a timestamp of `2021-09-15T13:34` will be ingested as `2021-09-15T13:34:00`. A timestamp of `2021-09-15` will be ingested as `2021-09-15T00:00:00`.

When you import a date without a timestamp, a default time of midnight UTC is applied to the date when it is mapped to the `date` data type. This may cause [date-property triggered flows](https://help.klaviyo.com/hc/en-us/articles/360002732652) to send a day early or late depending on the account’s timezone. When you have a date with no associated timestamp to ingest, we recommend amending a timestamp of `12:00:00` for the best outcome in a date-property triggered flow.

### **Considerations for CSV files**

If you need help reformatting your dates in a spreadsheet before uploading your CSV file, head to our article, [Format dates for CSV files](https://help.klaviyo.com/hc/en-us/articles/360039859932).

For more information on uploading a CSV file to Klaviyo, head to our article on [how to add subscribers to an existing list.](https://help.klaviyo.com/hc/en-us/articles/115005251128-How-to-Add-Subscribers-to-an-Existing-List)
