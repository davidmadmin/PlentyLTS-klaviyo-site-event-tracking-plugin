# API versioning and deprecation policy
Learn about how we version and support our APIs.



Klaviyo’s APIs evolve and change over time. Our versioning and deprecation policy details how we choose to version our APIs and offer developer support as we continually improve and expand our functionality. You’ll learn about how we safely introduce changes to our APIs and discover our API lifecycle so that you can most effectively manage your Klaviyo API usage. For more information, refer to our \[API Terms of Use](https://www.klaviyo.com/legal/api-terms).



To stay up-to-date on API changes, be sure to:



\- Subscribe to our \[developer newsletter](https://manage.kmail-lists.com/subscriptions/subscribe?a=9BX3wh\&g=SaqhYy).

\- Join our \[Klaviyo Community developer group](https://community.klaviyo.com/groups/developer-group-64).

\- Regularly check our \[changelog](https://developers.klaviyo.com/en/docs/changelog_).



## API versioning



We version our APIs with \*revisions\*, or snapshots of our API at a point in time. Revisions are formatted as ISO 8601 dates (representing release dates) and passed using the HTTP request header, `revision` (for example, `2023-12-15)`. This versioning scheme allows us to regularly release new functionality without negatively impacting developers using older revisions.



The following request includes a revision header that serves our `2023-12-15` revision:



Request



```bash
curl --request GET \\

        --url https://a.klaviyo.com/api/events/ \\

        --header 'Authorization: Klaviyo-API-Key your-private-api-key' \\

        --header 'accept: application/json' \\

        --header 'revision: 2023-12-15'
```



> **📘**

> 

> 

> Note that the revision passed in must be a valid revision. You can quickly check for valid revisions and view their supporting documentation in the revision drop down in the top left.

> 

> !\[](https://files.readme.io/27c9d70-api_doc_version.png)

> 



> **📘**

> 

> 

> If you are using a revision that was released before the 2023-07-15 revision, we recommend \[learning about the breaking changes released](https://developers.klaviyo.com/en/docs/migrate_to_2023_07_15_relationships) and upgrading to our latest revision.

> 



## Beta revisions



For testing and feedback purposes, we share our new APIs with developers in an early access state. After this phase, we may share the new APIs in a public beta. Klaviyo APIs in beta are accessible via beta revision headers with the suffix `.pre`, for example, `2024-02-15.pre`. We release supporting reference documentation alongside our beta APIs and \[encourage developer feedback](https://community.klaviyo.com/groups/developer-group-64).



> **🚧**

> 

> 

> Note that beta revisions are not considered stable and should not be used in production.

> 



## Breaking changes



Klaviyo defines a \[breaking change](https://developers.klaviyo.com/en/docs/glossary_index#breaking-change) as any modification to or deletion of functionality within an API that may cause integrations or applications to function abnormally or break.



Examples of breaking changes include, but are not limited to:



\- Renaming of a URL, request or response field, HTTP header, or query parameter.

\- Removal of a request or response field, HTTP header, or query parameter.

\- Addition of a required request field, HTTP header, or query parameter.

\- Removal of an endpoint.



Breaking changes are generally gated behind a new revision and clearly documented in our \[changelog](https://developers.klaviyo.com/en/docs/changelog_). If we plan on introducing a breaking change to an existing revision, we will provide **30 days notice** to our developers. Be sure to join our \[developer newsletter](https://manage.kmail-lists.com/subscriptions/subscribe?a=9BX3wh\&g=SaqhYy) to receive important updates.



> **📘**

> 

> 

> If you detect an undocumented change causing breakages in your app, please share it with us on our \[Klaviyo Community developer group](https://community.klaviyo.com/groups/developer-group-64). Any undocumented functionality is not supported and should not be relied upon.

> 



## Non-breaking changes



Klaviyo considers the following classes of changes to be \[non-breaking changes](https://developers.klaviyo.com/en/docs/glossary_index#non-breaking-change):



\- New optional fields in endpoint request payloads

\- New fields added to endpoint response payloads

\- Updating the `detail` string for an error

\- New values for an existing enum field for endpoint request or response payloads

\- New members for an existing complex union type field for endpoint request or response payloads, e.g. a new segment condition

\- New optional query parameters

\- New optional request headers

\- Additional response headers

\- New endpoints



Generally, new endpoints are only released in new revisions. Note that non-breaking changes to existing endpoints may be released within an existing revision.



> **📘**

> 

> 

> While non-breaking changes are not expected to be disruptive to existing functionality, it is still possible that they can cause breakages in your application. Be sure to build your application to adapt to non-breaking changes at your own discretion.

> 



## SDK versioning



When a new API revision is released, we release new versions of our \[SDKs](https://developers.klaviyo.com/en/docs/install_a_library). Our SDKs follow \[semantic versioning](https://semver.org/), or the major.minor.patch format, where each numeric value is incremented to reflect the following changes:



\- **major**

       

       The API revision contains at least one breaking change.

       

\- **minor**

       

       The API revision contains non-breaking changes, such as notable new functionality.

       

\- **patch**

       

       The SDK has been updated with bug fixes.

       



Note that SDK support relies on our API versioning and deprecation policy, as each SDK version is pinned to a specific API revision. Keep in mind that each SDK has a separate changelog for documenting changes between versions.



## API lifecycle



> **📘**

> 

> 

> Klaviyo provides developers **2 years** to update their apps and integrations before a revision is retired and access is removed. View our revision lifecycle example below to learn about how each of our revisions is supported from initial release to retirement.

> 



!\[](https://files.readme.io/bf1505f-example_revision_lifecycle.jpg)



As shown in the example above, a revision goes through the following phases:



\- **Stable**

       - The revision is subject to non-breaking changes, but remains largely unchanged.

       - Lasts for 1 year after release.

\- **Deprecated**

       - Use of the revision is discouraged over stable revisions

       - At this point, you should plan to migrate your apps to our latest stable revision before the revision is retired to avoid breakages.

       - Starts 1 year after release. Lasts for 1 year.

\- **Retired**

       - 2 years after release, the revision is no longer supported, and breakages are likely to occur in any apps/integrations that rely on it.

       - Calls to endpoints that have been removed since this revision will receive a 410 error.



> **📘**

> 

> 

> For any net-new integrations, we recommend starting with our latest stable revision.

> 



## Initial release



When new endpoints and/or breaking changes are added to our APIs, they are released in a new revision.



When a new revision is released:



\- It is the \[latest stable](https://developers.klaviyo.com/en/docs/glossary_index#latest-stable) revision until a newer revision is released.

\- There should not be any breaking changes made to the revision, but there may be some non-breaking changes over time.

\- The revision remains \[stable](https://developers.klaviyo.com/en/docs/glossary_index#stable) for **1 year**.



## Deprecation



After a revision’s stable period (1 year after its initial release), the revision is \[deprecated](https://developers.klaviyo.com/en/docs/glossary_index#deprecated) (set to retire). At this point, you should plan to upgrade your apps to our latest stable revision, which will include new and improved functionality over any deprecated revisions.



When a revision becomes deprecated:



\- You’ll have **1 year** to upgrade your apps before the revision is retired.

\- The revision will not receive any further updates or bug fixes.

\- The documentation is updated with the new revision or notifies users that the documented method is deprecated.



> **📘**

> 

> 

> Any new integrations and API usages should be built with our latest revision. You can view recent API requests by revision header, among other API activity data, with our \[API usage tools](https://developers.klaviyo.com/en/docs/monitor-api-usage).

> 



## Retirement



After a revision’s year-long deprecation phase, it is \[retired](https://developers.klaviyo.com/en/docs/glossary_index#retired), meaning it is unsupported and no longer available for use. We do our best to fall-forward to the oldest non-retired revision (see below); however, calls to retired endpoints that have been removed since that revision will receive a 410 error, and other breakages are likely to occur.



## Fall-forward behavior



If a retired revision date is passed to the request header, Klaviyo falls forward and responds to your request with the same behavior as the next oldest revision. For example, when revision`2023-06-15` retires, the next oldest revision is `2023-07-15`, and any API requests to `2023-06-15` will be served `2023-07-15`.



> **🚧**

> 

> 

> Relying on fall-forward behavior is likely to introduce unwanted, breaking changes in your app. It’s much safer to pin a static revision and connect your apps to our latest revision every 12-18 months. This will give you enough time to revisit your implementation to take advantage of improved functionality and address any potential breaking changes.

> 



If you would like to opt out of this behavior, you can use the following request header:



`X-Klaviyo-Revision-Fall-Forward-Opt-Out:1`



> **🚧**

> 

> 

> Note that if you choose to opt out of fall-forward behavior, when a revision is retired, all requests to it will result in a 410 error and cause breakages in your app.

> 



Our fall-forward behavior is a best-effort attempt to honor your request and not fully break your integration; however, we strongly recommend that you audit and update your API usage prior to a revision’s retirement, as it is likely that functionality will break or work differently in newer revisions.



## Additional resources



\- \[API overview](https://developers.klaviyo.com/en/reference/api_overview)

\- \[Monitor API usage](https://developers.klaviyo.com/en/docs/monitor-api-usage)

\- \[Migrate from v1/v2 to new Klaviyo APIs](https://developers.klaviyo.com/en/docs/migrating_from_v1v2_to_the_new_klaviyo_apis)

## Source

- https://developers.klaviyo.com/en/docs/api_versioning_and_deprecation_policy
