chrome.extension.onRequest.addListener(function(request, sender, sendResponse) { if(request.method == "getText"){ sendResponse({data: document.body.innerHTML, method: "getText"}); } } );

