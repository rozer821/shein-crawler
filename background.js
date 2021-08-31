
chrome.runtime.onInstalled.addListener(() => {
   // Replace all rules ...
   chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    // With a new rule ...
    chrome.declarativeContent.onPageChanged.addRules([
      {
        // When a page's URL indicates this page belongs to SHEIN ...
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { urlContains: 'https://us.shein.com' },
          })
        ],
        // And shows the extension's page action.
        actions: [ new chrome.declarativeContent.ShowPageAction() ]
      }
    ]);
  });
});

// A function to use as callback
function doStuffWithDom(domContent) {
  console.log('I received the following DOM content:\n' + domContent);
}

// When the browser-action button is clicked...
chrome.pageAction.onClicked.addListener(function (tab) {
  // ...if it matches, send a message specifying a callback too
  chrome.tabs.sendMessage(tab.id, {text: 'report_back'}, doStuffWithDom);
});
