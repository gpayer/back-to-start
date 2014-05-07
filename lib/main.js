var self = require('sdk/self');
var tabs = require('sdk/tabs');
var sdk_url = require('sdk/url');

var name = 'extensions.' +  self.id + '.sdk.console.logLevel';
require('sdk/preferences/service').set(name, 'info');

var { Cc, Ci } = require('chrome');

var backToStartButton = require('sdk/ui').ActionButton({
    id: 'back-to-start-btn',
    label: 'Back to Start',
    icon: {
        '16': './icon-16.png'
    },
    onClick: function(state){
        var wm = Cc["@mozilla.org/appshell/window-mediator;1"]
                   .getService(Ci.nsIWindowMediator);
        var mainWindow = wm.getMostRecentWindow("navigator:browser");
        var gBrowser = mainWindow.gBrowser;
        var currentUrl = sdk_url.URL(tabs.activeTab.url);

        var history = gBrowser.webNavigation.sessionHistory;

        var last_found = -1;

        for(var i=history.index; i>=0; i--){
            var entry = history.getEntryAtIndex(i, false);

            var entryUrl = sdk_url.URL(entry.URI.spec);
            console.log(entry.URI.spec);
            console.log('Testing: '+currentUrl.host+' == '+entryUrl.host);
            if(currentUrl.host != entryUrl.host){
                break;
            }
            last_found = i;
        }

        if(last_found > -1 && last_found != history.index){
            console.log('Going to: '+history.getEntryAtIndex(last_found, false).URI.spec);
            gBrowser.webNavigation.gotoIndex(last_found);
        }else{
            console.log('Nothing to to');
        }
    }

});
