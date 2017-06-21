function alertBot(){
  const store = {
    "sheetId" : "", // Enter your watchlist spreadhseet id between the ""
    "accessToken" : "", // Enter your Pushbullet access token Between the ""
    "limit" : -20 // % Drawdown from latest 52w high
  }
  if (dt.getDay()===6 || dt.getDay()===0) return
  else if (dt.getHours()>=9 && dt.getMinutes()>=30 && dt.getHours()<=15 && dt.getMinutes()<=30) {
    send_message(watchlist(store.sheetId), last52wHigh(), store.limit, store.accessToken, store.sheetId)
  } else return
}


function send_message(wl, lh, limit, accessToken, sheetId) {
  const data = Object.keys(wl).reduce(function(prev, curr) {
    const ltp = getNSEQuote(curr)
    const drawdown = ((ltp/lh[curr] - 1) * 100).toFixed(2)
    const dt = new Date
    const timestamp = (new Date(dt.getYear(), dt.getMonth(), dt.getDate())).getTime()/1000
    if (drawdown < limit && wl[curr] !== timestamp) {
      pushbullet(curr+" Stop Loss", "LTP: "+getNSEQuote(curr)+"\nDrawdown from 52w high: "+drawdown+"%", accessToken)
      prev.push([curr, timestamp])
    } else if (drawdown < limit && wl[curr] === timestamp) {
      prev.push([curr, timestamp])
    } else {
      prev.push([curr, ""])
    }
    return prev
  }, [])
  SpreadsheetApp.openById(sheetId).getSheets()[0].getRange("A2:B"+((Object.keys(wl).length+1).toFixed(0))).setValues(data)
}

function last52wHigh() {
  return Utilities.parseCsv(UrlFetchApp.fetch("https://www.nseindia.com/content/CM_52_wk_High_low.csv").getContentText()).slice(3)
  .reduce(function(prev, curr) {
    prev[curr[0]] = curr[2]
    return prev
  }, {})
}

function watchlist(id) {
  return SpreadsheetApp.openById(id).getSheets()[0].getRange("A2:B").getValues()
  .filter(function (x) { return x.filter(Boolean).length !==0 })
  .reduce(function(prev, curr) { 
    prev[curr[0]] = curr[1]
    return prev
  }, {})
}

function getNSEQuote(symbol) {
  return JSON.parse(UrlFetchApp.fetch("https://www.nseindia.com/live_market/dynaContent/live_watch/get_quote/ajaxGetQuoteJSON.jsp?symbol="+symbol+"&series=EQ",
                      { headers : { "Referer" : "https://www.nseindia.com", "User-Agent" : "Mozilla/5.0", "Accept" : "/"} })
    .getContentText())["data"][0].lastPrice.replace(/,/g, "")
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