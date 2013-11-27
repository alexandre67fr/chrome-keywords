function collectTextNodes(element, texts) {
    for (var child= element.firstChild; child!==null; child= child.nextSibling) {
        if (child.nodeType===3)
            texts.push(child);
        else if (child.nodeType===1)
            collectTextNodes(child, texts);
    }
}
function getTextWithSpaces(element) {
    var texts= [];
    collectTextNodes(element, texts);
    for (var i= texts.length; i-->0;)
        texts[i]= texts[i].data;
    return texts.join(' ');
}

function processHtml(s) {

  var e = $("#status");
  
  s = $(s);
  s.find("script,style").remove();
  
  var ul = $("<ul />");
  
  texts = new Array();
  
  var kws = getSetting("keywords").split("\n");
  
  $("*", s).each(function () {
  
    var el = $(this);
    if ( el.find("div,section,article,label").length > 0 ) return;
  
    var sentences = $(this).text();
    
    sentences = sentences.split(/[\.|\!|\?]+/gi);
    
    for (var j in sentences)
    {
      var text = sentences[j];
      var re = new RegExp('(^ +| +$)', 'gi');
      text = text.replace(re, '');
      if ( !text.length ) continue;
      if ( text.length < parseInt( getSetting("min_chars") ) ) continue;
      var found = 0;
      for (var i in kws)
      {
        var kw = kws[i];
        kw = kw.replace(re, '');
        kw = kw.replace(/[aàáâä]/, '[aàáâä]');
        kw = kw.replace(/[iìíîï]/, '[iìíîï]');
        kw = kw.replace(/[eèéêë]/, '[eèéêë]');
        kw = kw.replace(/[oòóôö]/, '[oòóôö]');
        kw = kw.replace(/[uùúûü]/, '[uùúûü]');
        if ( !kw.length ) continue;
        var pre = '([ \.\,\'\"]{1}|^|$)';
        var re2 = new RegExp(pre+'('+kw+')'+pre, 'gi');
        var m;
        m = text.match(re2);
        if ( m )
        {
          text = text.replace(re2, '$1<b>$2</b>$3');
          found += m.length;
        }
      }
      
      for (var k in texts)
      {
        if (texts[k].text.indexOf(text) >= 0)
          found = false;
      }
      
      if ( parseInt( getSetting("inc_ponc") ) )
      {
        if ( !text.match(/[\,\!\?\"]/) )
          found = false;
      }
      
      if ( parseInt( getSetting("inc_numbers") ) )
      {
        if ( !text.match(/[0-9]+/) )
          found = false;
      }
      
      if ( !text.match(/\.$/) ) text = text + ".";
      
      if ( !found ) continue;
      
      texts.push({ text: text, score: found });
    }
  });
  
  texts = texts.sort(function (a, b){
    var aName = b.score;
    var bName = a.score; 
    var res = ( b.text.length < a.text.length ? -1 : ( b.text.length > a.text.length ? 1 : 0 ) );
    return ((aName < bName) ? -1 : ((aName > bName) ? 1 : res));
  });
  
  var len = 0;
  for (var i in texts)
  {
    if ( len > parseInt( getSetting("phrases_num") ) )
      break;
    len++;
    //ul.append( $("<li />").html( texts[i].score + " -> " + texts[i].text ) );
    ul.append( $("<li />").html( texts[i].text ) );
  }
  
  if (len == 0) e.html("No matches were found.");
  else e.html("").append(ul);
  
  clearTimeout(tOut);

}

var tOut = setTimeout(function () {
  alert("Current tab needs to be reloaded to apply the changes.");
  chrome.tabs.getSelected(null, function(tab) {
    var code = 'window.location.reload();';
    chrome.tabs.executeScript(tab.id, {code: code});
    window.close();
  });
}, 3000);

function make_call() {
  chrome.tabs.getSelected(null, function(tab) {
      if ( tab.url.match(/^http/) )
      chrome.tabs.sendRequest(tab.id, {method: "getText"}, function(response) {
          if(response.method=="getText"){
              alltext = response.data;
              processHtml(alltext);
          }
      });
      else window.close();
  });
}

make_call();
