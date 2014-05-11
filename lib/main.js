var self = require('sdk/self');
var tabs = require('sdk/tabs');
var sdk_url = require('sdk/url');
var prefs = require('sdk/preferences/service');
var simple_prefs = require('sdk/simple-prefs');

simple_prefs.on("debug", prefChange);

function prefChange(prefName){
    if(prefName == 'debug'){
        var name = 'extensions.' +  self.id + '.sdk.console.logLevel';
        if(simple_prefs.prefs['debug']){
            prefs.set(name, 'info');
        }else{
            prefs.set(name, 'error');
        }
    }
}

prefChange('debug');

function getGBrowser(){
    var window = require('sdk/window/utils').getMostRecentBrowserWindow();
    var tabbrowser = require('sdk/tabs/utils').getTabBrowser(window);
    return tabbrowser;
}

var backToStartButton = require('sdk/ui').ActionButton({
    id: 'back-to-start-btn',
    label: 'Back to Start',
    icon: {
        '16': './icon-16.png',
        '32': './icon-32.png'
    },
    onClick: function(state){
        backToStartButton.disabled = true;
        var currentUrl = sdk_url.URL(tabs.activeTab.url);
        var gBrowser = getGBrowser();
        var history = gBrowser.webNavigation.sessionHistory;

        var last_found = -1;
        var back_count = 0;

        for(var i=history.index; i>=0; i--){
            var entry = history.getEntryAtIndex(i, false);

            var entryUrl = sdk_url.URL(entry.URI.spec);
            console.log(entry.URI.spec);
            console.log('Testing: '+currentUrl.host+' == '+entryUrl.host);
            if(currentUrl.host != entryUrl.host){
                break;
            }
            last_found = i;
            back_count++;
        }

        if(back_count == 1){
            console.log('Classic behaviour');
            gBrowser.webNavigation.goBack();
        }else if(last_found > -1 && last_found != history.index){
            console.log('Going to: '+history.getEntryAtIndex(last_found, false).URI.spec);
            gBrowser.webNavigation.gotoIndex(last_found);
        }else{
            console.log('Nothing to to');
            backToStartButton.disabled = false;
        }
    }

});

function checkButtonState(){
    var gBrowser = getGBrowser();
    var history = gBrowser.webNavigation.sessionHistory;

    if(history.index > 0){
        backToStartButton.disabled = false;
    }else{
        backToStartButton.disabled = true;
    }
}

function setTabEventListeners(tab){
    tab.on('pageshow', checkButtonState);
    tab.on('activate', checkButtonState);
}

for each (var tab in tabs){
    setTabEventListeners(tab);
}

tabs.on('open', function(tab){
    setTabEventListeners(tab);
});
