# alertsGS
Setup push alerts using Google Scripts and Pushbullet

## bseNoticeAlerts.gs
Use this as a Google Script to setup BSE announcement alerts for your stock watchlist.

1. Create a new spreadsheet in your Google Drive. Label the headers for columns A to C as `nse, bse & last_updated`. Note the speadsheet ID. Here's how to find it - https://developers.google.com/sheets/api/guides/concepts.

2. Populate the `nse & bse` columns with the NSE Symbols and BSE Codes of stocks you want to track (you can use this mapping dataset to speed up the process - https://github.com/uptickr/datasets/blob/master/datasets/nse_bse_codeMap.csv).

3. Create a Pushbullet account. Install the app on your phone. Go to the pushbullet website, head to "My Account" and then create an access token. Note this token.

4. Create a new script file in your Google Drive. Clear any existing code. Copy and paste the contents of bseNoticeAlerts.gs in it. Enter your spreadsheet ID and access token in the `store` object in the `alertBot` function.

5. Finally, setup triggers for the `alertBot` function by going to "Edit" > "Current project's triggers" to have Google run the function automatically at regular intervals (preferably every minute).