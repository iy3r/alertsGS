function alertBot(){
  const store = {
    "sheetId" : "", // Enter your watchlist spreadhseet id between the ""
    "accessToken" : "" // Enter your Pushbullet access token between the ""
  }
  send_message(watchlist(store.sheetId), announcements(), store.sheetId, store.accessToken)
}

function send_message(wl, ann, sheetId, accessToken) {
  const data = Object.keys(wl).reduce(function(prev, curr){
    if(Object.keys(ann).indexOf(curr) > -1 && wl[curr].last_update !== ann[curr].timestamp) {
      pushbullet(wl[curr].symbol+" "+ann[curr].category, ann[curr].notice+" "+ann[curr].pdf, accessToken)
      prev.push([wl[curr].symbol, curr, ann[curr].timestamp])
    } else {
      prev.push([wl[curr].symbol ,curr, wl[curr].last_update])
    }
    return prev
  }, [])
  SpreadsheetApp.openById(sheetId).getSheets()[0].getRange("A2:C"+((Object.keys(wl).length+1).toFixed(0))).setValues(data)
}

function watchlist(id) {
  return SpreadsheetApp.openById(id).getSheets()[0].getRange("A2:C").getValues()
  .filter(function (x) { return x.filter(Boolean).length !==0 })
  .reduce(function(prev, curr) { 
    prev[curr[1]] = { "symbol" : curr[0], "last_update" : curr[2] }
    return prev
  }, {})
}

function announcements() {
  return UrlFetchApp.fetch("http://www.bseindia.com/corporates/ann.aspx").getContentText()
  .match(/<td class='TTHeadergrey'.*?<\/td><\/tr><tr><td class='TTRow_leftnotices' colspan ='4'>.*?<\/td><\/tr>/g)
  .map(function(x) { return x.match(/<td.*?>(.*?)<\/td>/g) })
  .map(function(x) {
    return x.map(function (y, i) {
      switch (i) {
        case 0: return y.replace(/<.+?>/g, "").split(" - ")[1]                      // BSE Code
        case 1: return y.replace(/<.+?>/g, "")                                      // Notice Category
        case 2: return /http.*?pdf/g.exec(y) + ""                                   // Notice PDF URL
        case 3: return date(y.match(/(\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2})/g)[0]) // Timestamp
        case 4: return y.replace(/<.+?>/g, "")                                      // Notice Text
        default: return ""}
    })
  })
  .reduce(function (prev, curr) {
    prev[curr[0]] = { "category" : curr[1], "pdf" : curr[2], "timestamp" : curr[3], "notice" : curr[4] }
    return prev
  }, {})
}

function pushbullet(title, body, accessToken) {
  UrlFetchApp.fetch("https://api.pushbullet.com/v2/pushes", {
    "method" : "POST",
    "contentType": "application/json",
    "headers" : { "Access-Token" : accessToken },
    "payload" : JSON.stringify({
      "type" : "note",
      "title": title,
      "body": body
    })
  })
}

function date(string){
  const d = string.split(/[\/\s:]/g).map(Number)
  return (new Date(d[2], d[1]-1, d[0], d[3], d[4], d[5])).getTime()/1000
}