const functions = require('firebase-functions');
const messenger = require('./messenger');
const VERIFY_TOKEN = functions.config().deptutorial.verify_token;
const PAGE_ACCESS_TOKEN = functions.config().deptutorial.page_access_token;

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
 exports.helloWorld = functions.https.onRequest((request, response) => {
   functions.logger.info("Hello logs!", {structuredData: true});
   response.send("Hello from Firebase!");
 });

 exports.webhook_messenger = functions.https.onRequest((req,res) => {
    const body = req.body;
    const method = req.method;

    // Your verify token. Should be a random string.
    //const VERIFY_TOKEN = '<YOUR_VERIFY_TOKEN>';
    //const PAGE_ACCESS_TOKEN = '<ACCESS_TOKEN>';
    
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
                            const sender_psid = messaging.sender.id;
                            console.log('webhook_messenger:sender_psid', sender_psid);
                            // Return a '200 OK' response to all requests
                            //return res.status(200).send('EVENT_RECEIVED');

                            let response={
                                text:`Received your message: ${messaging.message.text}`
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