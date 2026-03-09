# Relationships
Learn more about resource relationships available with the JSON:API standard.



## What are relationships?



Klaviyo’s modern APIs offer powerful new functionality via the `relationships` object, a thorough set of syntax offered by JSON:API for modeling relationships between resources. This syntax allows developers to efficiently query specific groups of related resources, eliminating the need to perform redundant queries.



Relationships can be to-one or to-many.



Because of the myriad ways our partners and customers model and sync data to and from Klaviyo, the JSON:API relationship syntax used by the new APIs accounts for a wide variety of use cases. Keep in mind that a full relationship mapping may not always be required for all resources.



## The `include` query parameter



You can use `?include=resource1,resource2` as a query parameter to include related resource(s) in a response. For example, a call to \[Get Event](https://developers.klaviyo.com/en/reference/get_event) with `?include=profile,metric` will include related profile and metric data for each event in the response. To determine which relationships a specific resource supports, refer to the endpoint’s supported `include` values in the endpoint description.



> **🚧**

> 

> 

> The specified resources must be in a comma-separated list. You cannot use `?include` more than once in your request, i.e, `?include=resource1\&include=resource2`. Use `?include=resource1,resource2` for including multiple related resources. Watch out for whitespaces before or after each comma.

> 



Note that `include` values may be singular or plural depending on the relationship between resources:



\- **Singular (to-one)**`GET /api/events/?include=profile`Includes each profile related to each event.

\- **Plural (to-many)**`GET /api/profiles/{profile_id}/?include=lists`Includes lists related to a single profile.



## Example request and response



In the example request to \[Get Profile](https://developers.klaviyo.com/en/v2023-09-15/reference/get_profile) below, `?include=lists,segments` returns any related list and/or segment object(s) related to a specific profile in the `included` field of the response:



RequestResponse



```bash
curl --request GET \\

        --url 'https://a.klaviyo.com/api/profiles/01HD2CCW560NWG693CYF6KF28S/?include=lists,segments' \\

        --header 'Authorization: Klaviyo-API-Key your-private-api-key' \\

        --header 'accept: application/json' \\

        --header 'revision: 2023-10-15'
```



## Scopes



When using relationships, you must use an API key with Read-only (for GET requests) or Full (for GET and POST requests) permissions to both the requested endpoint and its related resource.



For example, to call `GET /api/profiles/{profile_id}/?include=lists` the scope of your API key must include read access to both the profiles endpoint and the lists endpoint.



Check out the \[guide to API scopes](https://help.klaviyo.com/hc/en-us/articles/7423954176283) to learn more about creating and using scopes.



## Relationship support



When a relationship between two resources is defined, there are two main ways of querying this relationship: single source and collection-level.



## Single resource relationship support



Let's use `/profiles` and `/lists` as an example. A common use case for many Klaviyo developers is getting all lists a profile belongs to. With the new APIs, this could be accomplished the following ways:



\- `GET /api/profiles/{profile_id}/lists`Get the lists for a single profile directly. Do this if you do not need the profile resource itself, you only need the list.

\- `GET /api/profiles/{profile_id}/?include=lists`Include the lists for a single profile. Do this if you need both the profile resource, and its corresponding lists.

\- `GET /api/profiles/{profile_id}/relationships/lists`Get just the relationship object (the ID mapping) to the corresponding list ID.Do this if you only need the list IDs for a profile's lists, and do not need either the profile resource or its corresponding lists.This is also the endpoint you can use to create, update or delete relationships, if these operations are supported for the relationship in question.



## Example request \& response



In this example, we have requested all lists related to the specified profile ID. This request returns the list resources only.



RequestResponse



```bash
curl --request GET \\

        --url 'https://a.klaviyo.com/api/profiles/{profile_id}/lists' \\

        --header 'Accept: application/json'

        --header 'Authorization: Klaviyo-API-Key {your-private-api-key}'

        --header 'Revision: YYYY-MM-DD.pre'
```



## Collection-level relationship support



Additionally, certain endpoints support `include` parameters for top-level `GET` endpoints. Refer to our API reference documentation for more information on which endpoints support `include` parameters.



Use `include` if you need all resources from a particular endpoint (paginated) AND all of their corresponding resources from the relationship.



## Example request \& response



In this example, we have requested a specific event ID, and have included all profiles related to that event.



RequestResponse



```bash
curl --request GET \\

        --url 'https://a.klaviyo.com/api/events/{event-ID}/?include=profile' \\

        --header 'Accept: application/json'

        --header 'Authorization: Klaviyo-API-Key {your-private-api-key}'

        --header 'Revision: YYYY-MM-DD.pre'
```



## Modify a relationship



You can not only read relationships, you can also create and delete them.



## Create a relationship



To create a new relationship between two resources, make a `POST` request to the endpoint with the relationship specified in the request body. In this example, we add a profile to a list by sending a POST to that profiles’ list relationship URL, specifying the list ID in the body.



cURL



```bash
curl --request POST \\

        --url 'https://a.klaviyo.com/api/profiles/{profile_id}/relationships/lists' \\

        --header 'Accept: application/json'

        --header 'Authorization: Klaviyo-API-Key {your-private-api-key}'

        --header 'Revision: YYYY-MM-DD.pre'

        --data '

{

         "type": "list",

         "id": "{list_id}"

}

’
```



## Delete a relationship



To delete a relationship, make a `DELETE` request to the endpoint with the relationship specified in the request body. In this example, we are removing the relationship between a profile and the list ID defined in the request body.



cURL



```bash
curl --request DELETE \\

        --url 'https://a.klaviyo.com/api/profiles/{profile_id}/relationships/lists' \\

        --header 'Accept: application/json'

        --header 'Authorization: Klaviyo-API-Key {your-private-api-key}'

        --header 'Revision: YYYY-MM-DD.pre'

        --data '

{

         "type": "list",

         "id": "{list_id}"

}

’
```

