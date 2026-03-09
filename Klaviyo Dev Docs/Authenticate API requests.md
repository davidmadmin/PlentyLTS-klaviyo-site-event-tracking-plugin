# Authenticate API requests

Learn how to authenticate requests to Klaviyo endpoints.

## You will learn

After reading this article, you will be able to distinguish which methods of authentication you should use for making calls with Klaviyo's server- and client-side APIs. You will also learn how to set custom scopes to protect you and your customers’ data.

## Server-side vs client-side APIs📘

Check out our video on \[client- and server-side tracking with Klaviyo's APIs](https://www.youtube.com/watch?v=x0RjkP8T13A\&list=PLHkNfHgtxcUanrkMnKPdkRzuWU7MGv_xM\&index=3).

A majority of Klaviyo’s APIs are server-side endpoints, which should be securely handled on your server rather than exposed in the browser. Handle sensitive information via server-side APIs, like bulk-creating events for one or more profiles.

Client-side APIs are used to track and send user behavior data from the client to Klaviyo. They are designed to be called from publicly-searchable, client-side environments only (see \[Client API reference](https://developers.klaviyo.com/en/reference/create_client_subscription)).

Klaviyo provides 3 methods of authentication including private key authentication and OAuth (used to call server-side APIs) and public key authentication (used to call client-side APIs). Read the table below to learn more about how each method can be used for authenticating API calls:**Server-side APIsClient-side APIsPrivate key authentication**All /api endpoints use API private keys to authenticate requests. If you do not use an API key for your requests, or if you use a key from the wrong account, your call will return an error. A 400 error indicates an invalid or missing API key.**OAuth**If you are a tech partner integrating with Klaviyo, we recommend using OAuth to \[make authorized API calls](https://developers.klaviyo.com/en/docs/set_up_oauth). OAuth offers multiple benefits over a private key integration, including security, usability, improved rate limits, and the ability to be listed in Klaviyo's App Marketplace.**Public key authentication**All /client endpoints use a public API key: your 6-character company ID, also known as a site ID. We recommend using the \[Klaviyo object](https://developers.klaviyo.com/en/docs/introduction_to_the_klaviyo_object) or our \[Mobile SDKs](https://developers.klaviyo.com/en/docs/sdk_overview#mobile-sdks) for interacting with our client-side APIs.**📘**

To manage API keys, you must have an Owner, Admin, or Manager role on your Klaviyo account.

## Private key authentication

Private API keys can be used to read and write data to your Klaviyo account. Klaviyo allows you to generate multiple private keys for your applications.**🚧**

For your account's security, your private API keys should never be used with Client endpoints, exposed in client-side code, or made accessible from public repositories.

## Create a private key

To create a private key:

1. Navigate to your account’s \*Settings\* page and select \[**API keys**](https://www.klaviyo.com/settings/account/api-keys).

2. Under the \*Private API Keys\* section, select **Create Private API Key**.

1. Provide a name for your private key and add any of the following scopes:

- Custom KeyAllows you to decide how much access to give the third party.

- Read-Only KeyOnly allows third parties to view all data associated with the endpoint.

- Full Access KeyAllows third parties to create, delete, or make changes to anything associated with that endpoint.**🚧**

Note that you cannot add a scope to an existing private key. You also cannot edit a private API key after it’s been created. If you need to remove access to a key based on its current scope, delete it and then create a new key with the correct scope.

1. When you have finished setting your key’s scopes, select **Create**. To protect your account from unauthorized access, you cannot view your private API keys in Klaviyo. After you have created your private API key, copy it to a secure location.

Private keys will have the prefix pk_ followed by a longer alphanumeric string.

## Use a private key

Private key authentication for `/api` endpoints is performed by setting the following request header:



`Authorization: Klaviyo-API-Key your-private-api-key`

cURL



```bash
curl --request GET \\

        --url https://a.klaviyo.com/api/{endpoint}/ \\

        --header 'Authorization: Klaviyo-API-Key your-private-api-key' \\

        --header 'accept: application/json' \\

        --header 'revision: 2024-10-15'
```



## Public key authentication

Your 6-character public key, sometimes referred to as a site ID, is a short alphanumeric string that serves as the unique identifier for your Klaviyo account.

Public keys cannot be used to access secure data in your account and are safe to share. Use your public key when you need to track people and events in client-side JavaScript code.

Client-side API calls only require a public API key, also known as a `company_id`, for authentication:cURL



```bash
curl --request POST \\

        --url 'https://a.klaviyo.com/client/subscriptions/?company_id=PUBLIC_API_KEY' \\

        --header 'content-type: application/json' \\

        --header 'revision: 2023-12-15' \\

        --data '

        ...
```



## OAuth

If you're building an app with Klaviyo, use \[OAuth](https://developers.klaviyo.com/en/docs/set_up_oauth) to provide secure delegated access to users via access tokens (required to enter Klaviyo’s App Marketplace). When setting up OAuth, you must provide designated scopes for each API authorization request you'll want to make.

## Set custom scopes

Setting custom scopes helps you protect your and your customers’ data by limiting what third parties can access. When requesting authorization to make API calls (OAuth), you should only request the scopes required to use your app.

View the API reference documentation to understand which scopes you’ll need to define. For example, if your private key or Klaviyo app needs to create lists, your app needs the `lists:write` scope as shown in the following API reference documentation for the Create List endpoint:

See the full list of scopes needed for each of our APIs below:**Available scopes for each API** 



**API endpointAssociated scopes**Accounts`accounts:read`Campaigns`campaigns:read`

`campaigns:write`Conversations`conversations:read`

`conversations:write`Catalogs`catalogs:read`

`catalogs:write`Coupons`coupons:read`

`coupons:write`Coupon codes`coupon-codes:read`

`coupon-codes:write`Data privacy`data-privacy:read`

`data-privacy:write`Events`events:read`

`events:write` (allows for creating/updating profiles)Flows`flows:read`

`flows:write`Forms`forms:read`Images`images:read`

`images:write`Lists`lists:read`

`lists:write`Metrics`metrics:read`

`metrics:write`Profiles`profiles:read`

`profiles:write`Push tokens`push-tokens:read`

`push-tokens:write`Reporting`campaigns:readflows:read`

`forms:read`

`segments:read`Reviews`reviews:read`

Segments`segments:read`

`segments:write`Subscriptions`subscriptions:read`

`subscriptions:write`Tags`tags:read`

`tags:write`Templates`templates:read`

`templates:write`Tracking Settings`tracking-settings:read`

`tracking-settings:write`Web Feeds`web-feeds:read`

`web-feeds:write`

## Additional resources

- \[Make API calls with OAuth](https://developers.klaviyo.com/en/docs/set_up_oauth)

- \[Use Klaviyo's Postman collections](https://developers.klaviyo.com/en/docs/use_klaviyos_postman_collections)

- \[Introduction to the Klaviyo object](https://developers.klaviyo.com/en/docs/introduction_to_the_klaviyo_object)

## Source

- https://developers.klaviyo.com/en/docs/authenticate_
