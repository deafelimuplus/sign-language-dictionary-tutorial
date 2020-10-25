# Build Sign Language Dictionary for Facebook Messenger using Messenger API in Node.js

## Overview
In this tutorial, it shows you steps how to build Sign Language Dictionary using Messenger API in Node.js. It enables users to ask a word for sign language or definition of the word. You maybe check and try it out [Sign Language Dictionary Bot](https://www.messenger.com/t/SLDictionaryBot) on Facebook Messenger. See the below demo

![Sign Language Dictionary Demo](https://github.com/deafelimuplus/sign-language-dictionary/blob/main/images/demoSignLanguageDictionary.gif)

## Prerequisties
* Basic knowledge of Node.js
* Have or Create Firebase project
* Create a [Facebook page](https://www.facebook.com/pages/create)
* Create [Facebook Developer Account](https://developers.facebook.com)
* Download and install [Visual Studio Code](https://code.visualstudio.com/)
* Download [Node.js and npm](https://nodejs.org/en/)
* Install [yarn](https://yarnpkg.com/getting-started/install)
* Install [the Firebase CLI](https://firebase.google.com/docs/cli) via npm

## Getting Started

### Step 1: Download and install Node.js and npm
1. Go to [https://nodejs.org/en/](https://nodejs.org/en/) and click on Download that says *Recommended For Most Users*.
2. To Check if you have **Node.js** installed, run this command in your terminal:
```
node -v
```
3. To confirm that you have **npm** installed, run this command in your terminal:
```
npm -v
```
4. To install yarn, run this command in your terminal:
```
npm install -g yarn
```
5. To use Functions, you need to install Firebase command line tools using yarn

    Install Firebase tools: `$ yarn global add firebase-tools`

### Step 2: Create and Deploy your first Firebase Cloud Function

1. Open a terminal window and navigate to the directory for your code:

        Initiate your project `$ firebase init`
        
2. Select **Functions**
3. Select **Create a new project**
4. Select **JavaScript** language
5. Enter **y** to *Do you want to use ESLint to catch probably bugs and enfore style?*
6. Enter **y** to *Do you want to install dependencies with npm now?*
7. Using Visual Studio Code, open index.js in functions folder and then uncomment the following lines
```node.js
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
```

### Step 3: Deploy functions
1. Run this command in your terminal or Visual Studio Code
```
$ firebase deploy --only functions
```
2. In your **Terminal** or **Visual Studio Code**, you should see a line like the following:
```
Function URL (helloWorld): https://us-central1-MY_PROJECT_NAME.cloudfunctions.net/helloWorld
```
   Make sure you replace **MY_PROJECT_NAME** with your project name.

3. Open it in a browser: `https://us-central1-MY_PROJECT_NAME.cloudfunctions.net/helloWorld`

      You see the message *Hello from Firebase!*

### Step 4: Add the webhook_messenger() function
   This function is to set up a webhook that supports the Messenger Platform's required webhook verification step, and is able to accept webhook events. For more information on **setting up your webhook**, follow [this link](https://developers.facebook.com/docs/messenger-platform/getting-started/webhook-setup)

1. For adding your webhook endpoint, add these lines to index.js

```node.js
exports.webhook_messenger = functions.https.onRequest((req,res) => {
    const body = req.body;
    const method = req.method;
    
    switch(method){
        case 'POST':
            //Checks this is an event from a page subscription
            if(body.object === 'page'){
                // Iterates over each entry - there may be multiple if batched
                return body.entry.map( entry => {
                    const webhook_events = entry;
                    // Gets the message. entry.messaging is an array
                    if(webhook_events.messaging){
                        return webhook_events.messaging.map(messaging => {
                            console.log('webhook_messenger:messaging',JSON.stringify(messaging));
                            // Return a '200 OK' response to all requests
                            return res.status(200).send('EVENT_RECEIVED');
                        });
                    } 

                    console.log('webhook_messenger:messaging', 'Unknown error');
                    // Return a '200 OK' response to all requests
                    return res.status(200).send('EVENT_RECEIVED');
                });
            } else {
                // Return a '404 Not Found' if event is not from a page subscription
                return res.sendStatus(404);
            }
         default:
            return res.status(405).send('Error: Not Allowed');
    }
    
});
```
This code creates a **webhook_messenger** endpoint that accepts **POST** requests.

2. For adding a webhook verification, add these lines to index.js

```node.js
exports.webhook_messenger = functions.https.onRequest((req,res) => {
    .
    .
    .
    
    // Your verify token. Should be a random string.
    const VERIFY_TOKEN = '<YOUR_VERIFY_TOKEN>';
    const PAGE_ACCESS_TOKEN = '<ACCESS_TOKEN>';
    
    
    // Parse the query params
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    
    switch(method){
        case 'GET':
            // Checks if a token and mode is in the query string of the request
            if (mode && token) {
                //Checks the mode and token sent is correct
                if (mode === 'subscribe' && token === VERIFY_TOKEN) {
                    // Responds with the challenge token from the request
                    console.log('webhook_messenger:verified','WEBHOOK_VERIFIED');
                    return res.status(200).send(challenge);
                } else {
                    // Responds with '403 Forbidden' if verify tokens do not match
                    return res.sendStatus(403);
                }
            }
            return res.status(405).send('Not Allowed');
        .
	.
	.
    }
    
});
```

This code creates a **webhook_messenger** endpoint that accepts **GET** requests.

The verification process looks like this:
1. You create a verify token. This is a random sting of your choosing, hardcoded into your webhook.
2. You copy and paste your verify token to the Messenger Platform when you subscribe your webhook to receive webhook events for a cloud function.
3. The Messenger Platform sends a **GET** request to your webhook with the token in the **hub.verify** parameter of the query string.
4. You verify the token sent matches your verify token, and respond with **hub.challenge** parameter from the request.
5. The Messenger Platform subscribes your webhook to the cloud function.

### Step 5: Deploy functions
1. Run this command in your terminal or Visual Studio Code
```
$ firebase deploy --only functions
```
2. In your terminal or Visual Studio Code, you should see a line like the following:
```
Function URL (webhook_messenger): https://us-central1-MY_PROJECT_NAME.cloudfunctions.net/webhook_messenger
```
### Step 6: Test your webhook

1. Run this command in your terminal or Visual Studio Code to test your webhook verification into this cURL request:
```
$ curl -X GET "https://us-central1-MY_PROJECT_NAME.cloudfunctions.net/webhook_messenger?hub.verify_token=<YOUR_VERIFY_TOKEN>&hub.challenge=CHALLENGE_ACCEPTED&hub.mode=subscribe"
```
If your webhook verification is working as expected, you should see the following:
* **WEBHOOK_VERIFIED** logged to the firebase function console.
* **CHALLENGE_ACCEPTED** logged to the command line

2. Run this command by sending this cURL request:
```
$ curl -H "Content-Type: application/json" -X POST "https://us-central1-MY_PROJECT_NAME.cloudfunctions.net/webhook_messenger" -d '{"object": "page", "entry": [{"messaging": [{"message": "TEST_MESSAGE"}]}]}'
```
If your webhook is working as expected, you should see the following:
* **TEST_MESSAGE** logged to the firebase function console.
* **EVENT RECEIVED** logged to the command line

### Step 7: Seting Up your Facebook App

Follow the steps [set up your Facebook App](https://developers.facebook.com/docs/messenger-platform/getting-started/app-setup)

### Step 8: Subscribe your app to a Facebook Page

1. Go to your [Facebook Developer Account](https://developers.facebook.com/) and click **My Apps**
2. Click **Create App** and select **Manage Business Integrations**
![Create App](https://github.com/deafelimuplus/sign-language-dictionary/blob/main/images/createAnApp.png)
3. Click **Continue**
4. Enter **App Display Name, and App Contact Email**. See the below image
![App Display Name](https://github.com/deafelimuplus/sign-language-dictionary/blob/main/images/CreateAnApp2.png)
5. Click **Create App**
6. It takes you to Sign Language Dictionary app. Click **Set Up** button on Messenger
![Set up Messenger](https://github.com/deafelimuplus/sign-language-dictionary/blob/main/images/SetUpMessenger.png)
7. In the **Webhooks** section, click **Add Callback URL**
8. Enter the url `https://us-central1-MY_PROJECT_NAME.cloudfunctions.net/webhook_messenger` in the **Callback URL** field.
9. Enter your verify token in the **Verify Token** field and then click **Verify and Save**.
![Callback URL](https://github.com/deafelimuplus/sign-language-dictionary/blob/main/images/editCallbackURL.png)
10. In the **Access Tokens** section, click **Add or Remove Pages** button and select a page you want to subscribe your app to. 
![Add or Remove Pages](https://github.com/deafelimuplus/sign-language-dictionary/blob/main/images/AddOrRemovePages.png)
11. Click **Generate Token**. *Make sure to copy and save the access token, it is needed to send messages using the [Send API](https://developers.facebook.com/docs/messenger-platform/reference/send-api/).
12. Add the copied access token to index.js
```node.js
exports.webhook_messenger = functions.https.onRequest((req,res) => {
    const body = req.body;
    const method = req.method;

    const PAGE_ACCESS_TOKEN = '<PAGE_ACCESS_TOKEN_HERE>';
    .
    .
    .
})
```
13. In the **Webhooks** section, click **Add Subscriptions** to select **messages** and **messaging_postbacks**.
14. Click **Save**

![Add Subscription fields](https://github.com/deafelimuplus/sign-language-dictionary/blob/main/images/subscriptionFields.png)

### Step 9: Test your app subscription

To test that your app set up was successful, go to **Messenger** and send a message to your Page. If the callback URL receives a webhook event, you should see the message on [Firebase Console](https://console.firebase.google.com/).

### Step 10: Build Sign Language Dictionary Bot

1. To receive a text from Messenger, we update the code in **index.js** to receive and pass a text message only to **messenger.callSendAPI()** function. 

```node.js
.
.
.
// Gets the message. entry.messaging is an array
    if(webhook_events.messaging){
	return webhook_events.messaging.map(messaging => {
	    console.log('webhook_messenger:messaging',JSON.stringify(messaging));
	    const sender_psid = messaging.sender.id;
	    console.log('webhook_messenger:sender_psid', sender_psid);
	    // Return a '200 OK' response to all requests
	    //return res.status(200).send('EVENT_RECEIVED');

	    let response={
		text:`Received message: ${messaging.message.text}`
	    };

	    if(messaging.message.text){
		return messenger.callSendAPI(PAGE_ACCESS_TOKEN,sender_psid,response).then(() => {
		    return res.end();
		});
	    }

	    response={
		text:`Please send me text only`
	    };

	    return messenger.callSendAPI(PAGE_ACCESS_TOKEN,sender_psid,response).then(() => {
		return res.end();
	    });

	});
    }
.
.
.
```
2. Create a new file called **messenger.js**.
3. Add the following lines to **messenger.js**. In this below code, we use [**Send API**](https://developers.facebook.com/docs/messenger-platform/reference/send-api/) to send a message to the Messenger Platform. 
```node.js
const fetch = require('node-fetch');
const GRAPH_URL = "https://graph.facebook.com/v8.0";

exports.callSendAPI = (page_access_token, sender_psid, response) => {
	return new Promise((resolve, reject) => {
        const request_body = {
            recipient:{
                id:sender_psid
            },
            message:response
        };

        return fetch (`${GRAPH_URL}/me/messages?access_token=${page_access_token}`,{
            method:'POST',
            headers:{
                Accept:'application/json',
                'Content-Type':'application/json'
            },
            body: JSON.stringify(request_body)
        }).then(res => res.json())
        .then( json => {
            console.log("callSendAPI:SendAPI "+sender_psid,"message sent!");
            return resolve(json);
        }).catch(error => {
            console.error("callSendAPI:error",error);
		    return reject(error);
        });
	});
};
```

4. Deploy functions `$ firebase deploy --only functions`
5. Test to send a first message and to get a response.

![Test to send a message on Messenger](https://github.com/deafelimuplus/sign-language-dictionary/blob/main/images/testSendMessenger.gif)

6. Now you have seen how communications with Messenger work, write a code for looking up a word for sign language and then send a video to the [**Messenger app**](https://www.messenger.com/).
	* Writing a code that sends a video if the word is found in the dictionary. If the word is not found, send a text.
	* In **messenger.js** file, you will write your own code **how to search and send a video url to Facebook Messenger**. In the below code, it sends a video url.
	
	```node.js
	.
	.
	.
	exports.signLanguageDictionary = (page_access_token, sender_psid,text) => {

	    // Writing your code how to search a word and then send a video url to Facebook Messenger.
	    .
	    .
	    .
	    let response;
    
	    // if text(word) is not found in your dictionary, send the message to user via messenger.
	    response={
		text:`${text} is not found in the dictionary`
	    };

	    // if text is found in your dictionary, send a video url to a user via messenger.
	    response={
		attachment:{
		    type:"video",
		    payload:{
			url:`${dictionary.media.video_link}`
		    }
		}
	    };
	    
	    return this.callSendAPI(page_access_token, sender_psid, response);
	};
	```
	* In **index.js** file, replace the following code:
	
	```node.js
	    let response={
		text:`Received your message: ${messaging.message.text}`
	    };

	    if(messaging.message.text){
		return messenger.callSendAPI(PAGE_ACCESS_TOKEN,sender_psid,response).then(() => {
		    return res.end();
		});
	    }
	```
	
	with this new code:
	
	```node.js
	    if(messaging.message.text){

		return messenger.signLanguageDictionary(PAGE_ACCESS_TOKEN, sender_psid, messaging.message.text).then(json => {
		    console.log('webhook_messenger:signLanguageDictionary', JSON.stringify(json));
		    return res.end();
		}).catch(error => {
		    console.error('webhook_messenger:signLanguageDictionary', error);
		    return res.end();
		});

	    }
	```
	
	* Test your dictionary bot if it is successful! If it works, you can connect your own **Facebook Page and Go live**!
	
### Congratulations!! You have just finished building your first Sign Language Dictionary on Facebook Messenger!
