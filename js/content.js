$.noConflict();

jQuery( document ).ready(function($) {
  
  chrome.extension.onRequest.addListener(
    function(request, sender, sendResponse) {
        if(request.method == "getText"){
            sendResponse({data: document.body.outerHTML, method: "getText"}); 
        }
    }
  );
  
});
