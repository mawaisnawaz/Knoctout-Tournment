"use strict";

// function to generate request for fetching data from server
//request method : get/post
export var generateRequest = (requestUrl, requestMethod, requestData = null) => {
    let reqInit = {
        headers: new Headers({
            'Content-Type': 'application/x-www-form-urlencoded'
        }),
        mode: 'no-cors',
        method: requestMethod
    };

    //add parameters
    if (requestData != null) {
        if (requestMethod == "GET") {
            requestUrl = `${requestUrl}?${requestData}`;
        }
        else { 
            //for post request add body parameter in request
            reqInit.body = requestData;
        }
    }

    return new Request(requestUrl, reqInit);
}