chrome.action.onClicked.addListener(function(tab) {
    chrome.windows.create({
      url: chrome.runtime.getURL("index.html"),
      type: "popup"
    });
});