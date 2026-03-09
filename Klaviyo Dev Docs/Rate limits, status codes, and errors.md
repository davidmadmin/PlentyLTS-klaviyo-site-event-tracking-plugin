### **Rate limits, status codes, and errors**Refer to our list of status codes, error responses, rate limits, and ingestion limits for troubleshooting help.



## **Rate limits**



Klaviyo's APIs employ rate limits against bursts of incoming traffic to help maximize its stability. Rate limits for specific endpoints can be found in the API reference for each endpoint.



All new API endpoints are rate limited on a \*per-account\* basis, and use a fixed-window rate limiting algorithm with two distinct windows: burst (1-second window) and steady (1-minute window). All API traffic will be subject to these rate limits, and will receive `HTTP 429` errors in the event either a burst or steady rate limit is reached.



Unless otherwise documented, all API endpoints use one of the following rate limits:



\- **XS**: 1/s burst; 15/m steady

\- **S**: 3/s burst; 60/m steady

\- **M**: 10/s burst; 150/m steady

\- **L**: 75/s burst; 700/m steady

\- **XL**: 350/s burst; 3500/m steady



> **📘**

> 

> 

> \[Rate limiting for OAuth apps](https://developers.klaviyo.com/en/docs/handle_your_apps_oauth_flow#rate-limits) differs from our standard API rate limiting for detailed above. OAuth apps receive their own rate limit quota per installed app instance (i.e., per account per app), while private key integrations share the same rate limit quota per account.

> 



All non-rate-limited (i.e., non 429) responses will contain the following HTTP response headers that indicate the state of the \*steady rate limit window\* to the client. We recommend using these headers to manage your request rate, especially if you maintain a third-party application that makes requests on behalf of Klaviyo customers:



\- `RateLimit–Limit`: The number of requests allowed per time period

\- `RateLimit-Remaining`: The approximate number of requests remaining within a window

\- `RateLimit-Reset`: Number of seconds remaining before current window resets



Treat these limits as maximums and don’t generate unnecessary load.



> **📘**

> 

> 

> Note that the `RateLimit-Limit`, `RateLimit-Remaining`, and `RateLimit-Reset` headers are not returned when you actually hit a `HTTP 429` error. When you hit the error, those headers are replaced with a `Retry-After` header that returns an `int` indicating the number of seconds before you can start making requests.

> 



## **Query Param Rate Limits**



As part of our recent release raising the rate limits for several endpoints, we have also introduced the concept of a rate limit for requests that include the `additional-fields` or `include` parameters in the request. If you're making calls with either of these parameters, we will enforce a stricter rate limit on those requests.



For example: If you're making an HTTP GET request to `/api/profiles?additional-fields\[profile]=predictive_analytics`, your requests will be at a lower rate limit than if you had not requested that information. Similarly, a `GET` request to `/api/profiles/:profile-id:?include=lists` will result in a lower rate limit than a call to `/api/profiles/:profile-id:` without the query parameter.



These changes are enforced at a global level. A request to `/api/segments/:segment-id:/profiles?additional-fields\[profile]=predictive_analytics` will hit the same lower rate limit on profile->additional-fields->predictive_analytics as the call to `/api/profiles?additional-fields\[profile]=predictive_analytics`.



Note that each call now has multiple rate limits that apply. For example, let's assume we have 150 calls per minute on /api/profiles, 50 calls per minute on `additional-fields\[profile]=predictive_analytics`, and 50 calls per minute on `/api/profiles/:profile-id:?include=lists`. We then make the following API calls:



GET `/api/profiles/:profile-id:` – here, we use 1 call on the GET Profile endpoint



GET `/api/profiles/:profile-id:?include=lists` – we use 1 call on the GET Profile endpoint and another call on `profile?include=lists`



GET `/api/profiles/:profile-id:?include=lists\&additional-fields\[profile]=predictive_analytics` – three calls



At the end of these three API calls, we now have:



147 calls remaining on `/api/profiles/:profile-id`:



48 calls remaining on `profiles?include=lists`



49 calls remaining on `additional-fields\[profile]=predictive_analytics`



The rate limits on all of these calls reset at the same window. Similar rules apply for burst limits.



## **Ingestion limits**



> **📘Global payload limit**

> 

> 

> We enforce a maximum total payload size of 5 MB (decompressed) for all of our new APIs.

> 



**Endpoints with additional limits:**



\- `/api/events`

\- `/client/events`

\- legacy `/api/track`



Klaviyo's event tracking endpoints use ingestion limits to prevent processing delays and service interruptions to the event ingestion pipeline. If you are using a Klaviyo webhook, custom integration, or API implementation, it is important to be aware of the limits on the events you send into Klaviyo. The table below provides some guidance on the maximum sizes for your Events payload and its fields.



| **Category** | **Limit** |

| --- | --- |

| Max number of event properties per data packet | 300 |

| Max size of any field | 100 kB |

| Max number of items in arrays | 4000 |

| Max levels of nested objects | 10 |

| Timestamp of events | Between 2000 and “now”+1 year |



## **Response status codes**



Our API uses conventional HTTP response status codes to indicate success or failure of an API request. Response status codes typically fall into the following three ranges:



\- 2xx - Success

\- 4xx - Error as a result of information provided as part of the request, such as a requested object that doesn't exist, an invalid setting, etc.

\- 5xx - Error due to server issues or service unavailability.



See the table below for a list of error codes and their corresponding descriptions:



| **Code** | **Summary** | **Description** |

| --- | --- | --- |

| 200 | OK | The request completed successfully. |

| 201 | Created | The request succeeded, and a new resource was created as a result. |

| 202 | Accepted | The request has been received but not yet acted upon. We return this status code for requests that were accepted but are processed asynchronously. |

| 204 | No Content | The request succeeded, but the API doesn’t provide a response body. |

| 400 | Bad Request | Request is missing a required parameter or has an invalid parameter. |

| 401 | Not Authorized | Request is lacking required authentication information.Please follow \[the guidance here](https://developers.klaviyo.com/en/reference/api_overview#authentication) for more details on authenticating your API requests. |

| 403 | Forbidden | The request contains valid authentication information, but does not have permissions to perform the specified action.See \[API key scopes](https://developers.klaviyo.com/en/reference/api_overview#api-key-scopes) for more information. |

| 404 | Not Found | The requested resource doesn't exist. |

| 405 | Method not Allowed | The requested resource doesn't support the provided HTTP method, e.g. `DELETE`. |

| 409 | Conflict | The request conflicts with the current state of the server. |

| 410 | Gone | The requested content has been permanently deleted from Klaviyo’s server. This status code will occur for requested endpoints that no longer exist in our API. |

| 415 | Unsupported Media Type | The `Content-Type` or `Content-Encoding` header is set incorrectly. |

| 429 | Rate Limit | You hit the rate limit for this endpoint (different endpoints have different rate limits). |

| 500 | Server Error | Something is wrong with the destination server. This may be on Klaviyo's end. |

| 503 | Service Unavailable | Something is wrong on Klaviyo’s end leading to service unavailability.Check \[Klaviyo’s Status](https://status.klaviyo.com/) for updates. |



## **Retries**



We recommend watching for 429 and 503 error codes and building in a retry mechanism. The retry mechanism should follow an \[exponential backoff](https://en.wikipedia.org/wiki/Exponential_backoff) schedule to reduce request volume when necessary. Be sure to build in some randomness into the backoff schedule to avoid a \[thundering herd effect](https://en.wikipedia.org/wiki/Thundering_herd_problem).



> **🚧**

> 

> 

> A retry should only be attempted after the current rate limit is lifted, i.e., the time (in seconds) indicated by the `Retry-After` header on a 429 response has expired. Immediate retries will always receive a 429 error.

> 



## **Errors**



When a request is unsuccessful, the response will include a list of errors, nested under an `errors` field in the response. Within the `error` object, the `title` field includes developer-facing information about why the request failed.



Here is an example of an error response returned for an invalid request to GET `/api/events?fields\[profile]=email\&include=profiless` with an invalid `include` query parameter provided. There’s a typo there! It should be `include=profiles` not `include=profiless`.



JSON



`{

      "errors": \[

          {

              "id": "2c76424d-b1ff-4afd-a2a1-728d85dac775",

              "status": 400,

              "code": "invalid",

              "title": "Invalid input.",

              "detail": "'profiless' is not an allowed include parameter for this resource.",

              "source": {

                  "parameter": "include"

              },

              "meta": {}

          }

      ]

}`

## Source

- https://developers.klaviyo.com/en/docs/rate-limits-and-error-handling
