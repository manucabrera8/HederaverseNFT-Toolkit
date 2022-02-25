chrome.action.onClicked.addListener(function() {
    openExtension();
});

function openExtension() {
  var url = chrome.runtime.getURL('index.html');
  chrome.tabs.query({
      url: chrome.runtime.getURL('*'),
  }, function (tabs) {
      if (tabs.length == 0) {
          chrome.tabs.create({
              url: url,
              active: false
          }, function (tab) {
              chrome.windows.create({
                  tabId: tab.id,
                  type: 'popup',
                  focused: true,
              });
          });
      } else {
          for (var i = 1; i < tabs.length; i++)
              chrome.tabs.remove(tabs[i].id!);
          chrome.tabs.update(tabs[0].id!, { active: true });
          chrome.windows.update(tabs[0].windowId, { focused: true })
      }
  });
}