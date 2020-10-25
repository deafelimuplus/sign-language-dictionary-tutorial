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

exports.signLanguageDictionary = (page_access_token, sender_psid,text) => {

    // Writing your code how to search a word and then send a video url to Facebook Messenger.

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
