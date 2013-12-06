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

var analyzing = false;
function processHtml(s) {

  if (analyzing) return;

  analyzing = s;

  console.log("Got body length " + s.length);

  var e = $("#status");
  
  s = s.replace('&nbsp;', ' ');
  
  console.log("a");
  
  s = $("<div />").html(s);
  s.find("script,style,object,noscript,iframe").remove();
  s.appendTo("body");
  s.css({
    position: 'absolute',
    top: '-99999px',
    left: '-99999px',
    width: '1000px',
    overflow: 'visible'
  });
  
  console.log("b");
  
  var ul = $("<ul />");
  
  texts = new Array();
  
  var kws = getSetting("keywords").split("\n");
  
  console.log("c");
  
  $("*", s).each(function (a, b) {
  
    //console.log(a,b);
  
    //console.log("analyzing...");
  
    var el = $(this);
    if ( el.find("div,section,article,label,h1,h2,h3,li,ul,p,blockquote").length > 0 ) return;
  
    if ( el.parents("a").length ) return;
    if ( el.parent()[0].tagName.match(/^(a)$/i) ) return;
  
    var sentences = $(this).text();
    
    sentences = sentences.replace(/([\n\r\t])/g, ' ');
    sentences = sentences.replace(/ +/g, ' ').replace(/\u00A0/g, ' ');
  
    if (el.children().length == 1)
    {
      //if ( el.children()[0].tagName.match(/^(a)$/i) ) return;
    }
  
    if ( el[0].tagName.match(/^(a)$/i) )
      return;
    
    var links = new Array();
    
    var exp2 = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    
    sentences = sentences.replace(exp2, function(match, contents, offset, s)
        {
            links.push(contents);
            return "<%link"+(links.length-1)+"%>";
        }
    );
    
    sentences = sentences.replace('...', '<%>');
    
    if ( parseInt( getSetting("inc_ponc") ) && false )
    sentences = sentences.replace(/(«.*?»)/gi, function (match, contents, offset, s) {
      links.push(contents);
      return "<BREAK><%link"+(links.length-1)+"%><BREAK>";
    });
    
    sentences = sentences.replace(/([\.\!\?]+)/gi, function (match, contents, offset, s) {
      return contents+"<BREAK>";
    });
    
    sentences = sentences.split("<BREAK>");    
    
    //console.log(sentences);cloud
    
    for (var j in sentences)
    {
      var text = sentences[j];
      text = text.replace('<%>', '...');
      
      for (var t=0; t<links.length; t++)
        text = text.replace("<%link"+t+"%>", links[t]);
      
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
        var pre = '([^a-zaàáâäiìíîïeèéêëoòóôöuùúûü]{1}|^|$)';
        var re2 = new RegExp(pre+'('+kw+')'+pre, 'gi');
        var m;
        m = text.match(re2);
        if ( m )
        {
          text = text.replace(re2, '$1<b>$2</b>$3');
          found += m.length;
        }
      }
      
      if ( parseInt( getSetting("inc_numbers") ) )
      {
        //if ( !text.match(/[0-9]+/) ) found = false;
        var pre = '([^a-zaàáâäiìíîïeèéêëoòóôöuùúûü0-9\:\!\?\"><]{1}|^|$)';
        //pre = '(.)';
        var re2 = new RegExp(pre+'([0-9\.\,]+)'+pre, 'gi');
        var m;
        m = text.match(re2);
        console.log(m);
        if ( m )
        {
          text = text.replace(re2, '$1<b>$2</b>$3');
          text = text.replace(re2, '$1<b>$2</b>$3');
          //if (found)
          found += m.length;
        }
      }
      
      if ( parseInt( getSetting("inc_ponc") ) )
      {
        chs = getSetting("ponc_kws");
        chs = chs.replace(/ +/g, '');
        chs = chs.replace(/(.{1})/g, '\\$1');
        //alert(chs);
        var re3 = new RegExp('(['+chs+']{1})', 'g');
        //if ( !text.match(re3) ) found = false;
        m = text.match(re3);
        if ( m )
        {
          text = text.replace(re3, '<b>$1</b>');
          //if (found)
          found += m.length;
        }
      }
      
      for (var k in texts)
      {
        if (texts[k].text.indexOf(text) >= 0)
          found = false;
        if (texts[k].text == text)
          found = false;
      }
      
      //if ( text.match(/ +$/) ) found = false;
      
      //var mm = text.match(/( +)/);
      //console.log(mm);
      
      if ( text.match(/\<[a-z]+ [a-z]+/i) ) found = false;
      
      //if ( !text.match(/\.$/) ) text = text + ".";
      
      if ( !found ) continue;
      
      //texts.push({ text: text, score: found });
      texts.push({ text: text, score: el.offset().top });
    }
  });
  
  console.log(texts);
  
  texts = texts.sort(function (a, b){
    var aName = b.score;
    var bName = a.score; 
    var res = ( b.text.length < a.text.length ? -1 : ( b.text.length > a.text.length ? 1 : 0 ) );
    return ((aName > bName) ? -1 : ((aName < bName) ? 1 : res));
  });
  
  console.log(texts);
  
  //console.log(texts);
  
  s.remove();
  
  console.log("rendering...");
  
  var prevTexts = new Array();
  
  var len = 0;
  for (var i in texts)
  {
    if ( len > parseInt( getSetting("phrases_num") ) )
      break;
    if ( jQuery.inArray(texts[i].text, prevTexts) !== -1 ) continue;
    var matchesParts = false;
    for (var b=0; b<prevTexts.length; b++)
    {
      var middle = Math.ceil(prevTexts[b].length / 2);
      if ( texts[i].text.substring(0, middle) == prevTexts[b].substring(0, middle) )
        matchesParts = true;
      //console.log(texts[i].text.substring(middle, middle*2+1), prevTexts[b].substring(middle, middle*2+1));
      if ( texts[i].text.substring(texts[i].text.length - middle, texts[i].text.length) == prevTexts[b].substring(prevTexts[b].length - middle, prevTexts[b].length) )
        matchesParts = true;
    }
    if ( matchesParts ) continue;
    len++;
    //ul.append( $("<li />").html( texts[i].score + " -> " + texts[i].text ) );
    ul.append( $("<li />").html( texts[i].text ) );
    prevTexts.push(texts[i].text);
  }
  
  if (len == 0) e.html("No matches were found.");
  else e.html("").append(ul);
  
  clearInterval(tOut);
  
  _prevTexts = prevTexts;

}

var _prevTexts;

var reloading = false;

var tOut = setInterval(function () {
  if ( analyzing ) { clearInterval(tOut); return; }
  make_call();
}, 1000);

function make_call() {
  console.log("Making call...");
  chrome.tabs.getSelected(null, function(tab) {
      console.log(tab);
      if ( tab.status != "complete" )
      {
        $("#status span").html('This page is not completely loaded. Please wait...');
      }
      else
      {
        if ( tab.url.match(/^http/) )
        {
           $("#status span").html(analyzing ? 'Analyzing page...' : 'Please wait...');
           if ( analyzing ) return;
           console.log("Sending request");
            chrome.tabs.sendRequest(tab.id, {method: "getText"}, function(response) {
              console.log("Received response", response);
                if (!response)
                {
                  //console.log("Error when receiving response");
                  $("#status span").html('This page needs to be reloaded. Please wait...');
                  chrome.tabs.getSelected(null, function(tab) {
                    var code = 'window.location.reload();';
                    chrome.tabs.executeScript(tab.id, {code: code});
                    //window.close();
                  });
                }
                if(response.method=="getText"){
                    alltext = response.data;
                    processHtml(alltext);
                }
            });
        }
        else 
        {
          $("#status").html('Only web pages (<b>http</b> and <b>https</b>) are supported by this extension.');
        }
      }
  });
}

make_call();
