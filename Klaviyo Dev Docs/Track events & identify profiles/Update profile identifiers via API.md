### **Update profile identifiers via API**Learn how to update profile identifier fields using Klaviyo's RESTful APIs.



Profile identifiers are fields such as `email` and `phone_number` that can be used to uniquely identify a profile in your account. The following fields are all considered to be identifier fields:



\- Email (`email`)

\- Phone number (`phone_number`)

\- External ID (`external_id`)



If you are building a workflow that requires updates to profile identifiers via API, we recommend you follow the examples below to update profile identifiers securely.



You can update profile identifiers via a POST request to \[Create or Update Profile](https://developers.klaviyo.com/en/reference/create_or_update_profile). This endpoint can be used to create and/or update a profile depending on whether or not a profile exists. You can use any of the identifiers above to do this. For example:



\- If you provide an email address that does not currently match any existing profiles, a new profile will be created.

\- If you provide an existing profile's email address and a new phone number in your request payload, the matching profile's phone number will be updated.



> **📘**

> 

> 

> Check out our video on how to \[create a Klaviyo profile via API](https://www.youtube.com/watch?v=Lir9g0pQfCM\&list=PLHkNfHgtxcUanrkMnKPdkRzuWU7MGv_xM\&index=1).

> 



## **Update a profile identifier without a profile ID**



You can update a profile identifier without providing its profile ID as long as another profile identifier is provided. For example, we want to update the profile below which was created on July 17, 2023 (`"created": "2023-07-17T15:22:59+00:00"`) and has email `"jason.curtis_180@klaviyo-demo.com"` and phone number `"+19103913500"`:



Example



`{

       "type": "profile",

       "id": "01H5J755QGM2XPH7WW8K2EYZX3",

       "attributes": {

           "email": "jason.curtis_180@klaviyo-demo.com",

           "phone_number": "+19103913500",

           "created": "2023-07-17T15:22:59+00:00",

           "updated": "2023-07-17T15:23:14+00:00",

           "last_event_date": "2023-07-17T15:22:59+00:00",

           ...

       },

       "relationships": {

           "lists": {

               "links": {

                   "self": "https://a.klaviyo.com/api/profiles/01H5J755QGM2XPH7WW8K2EYZX3/relationships/lists/",

                   "related": "https://a.klaviyo.com/api/profiles/01H5J755QGM2XPH7WW8K2EYZX3/lists/"

               }

           },

           "segments": {

               "links": {

                   "self": "https://a.klaviyo.com/api/profiles/01H5J755QGM2XPH7WW8K2EYZX3/relationships/segments/",

                   "related": "https://a.klaviyo.com/api/profiles/01H5J755QGM2XPH7WW8K2EYZX3/segments/"

               }

           },

           "conversation": {

               "links": {

                   "self": "https://a.klaviyo.com/api/profiles/01H5J755QGM2XPH7WW8K2EYZX3/relationships/conversation/",

                   "related": "https://a.klaviyo.com/api/profiles/01H5J755QGM2XPH7WW8K2EYZX3/conversation/"

               }

           }

       },

       "links": {

           "self": "https://a.klaviyo.com/api/profiles/01H5J755QGM2XPH7WW8K2EYZX3/"

       }

},`



In the example below, a Create or Update Profile request is made, using the profile's phone number as the identifier, to change the email address to `jason_curtis@klaviyo-demo.com`:



RequestResponse



```bash
curl --request POST \\

        --url https://a.klaviyo.com/api/profile-import/ \\

        --header 'Authorization: Klaviyo-API-Key your-private-api-key' \\

        --header 'accept: application/json' \\

        --header 'content-type: application/json' \\

        --header 'revision: 2024-02-15' \\

        --data '

{

    	"data": {

    		"type": "profile",

    		"attributes": {

    			"email": "jason_curtis@klaviyo-demo.com",

    			"phone_number": "+19103913500"

    		}

    	}

}

'
```



As shown in the 200 response, the returned profile has the same profile ID as the original profile, an updated email address, and a new `updated` datetime that reflects that the profile has been recently updated.



## **Update profile identifiers with a profile ID**



The example request below uses the profile ID (`"id": "01H5J755QGM2XPH7WW8K2EYZX3"`) from the previous example to update both the email and phone number using Create or Update Profile:



RequestResponse



```bash
curl --request POST \\

        --url https://a.klaviyo.com/api/profile-import/ \\

        --header 'Authorization: Klaviyo-API-Key your-private-api-key' \\

        --header 'accept: application/json' \\

        --header 'content-type: application/json' \\

        --header 'revision: 2024-02-15' \\

        --data '

{

    	"data": {

    		"type": "profile",

       "id": "01H5J755QGM2XPH7WW8K2EYZX3",

    		"attributes": {

    			"email": "jill_curtis@klaviyo-demo.com",

    			"phone_number": "+15555555555"

    		}

    	}

}

'
```



If the request is successful, the profile will be returned with an updated email address and phone number.

