// Initialize your app
var myApp = new Framework7();

// Export selectors engine
var $$ = Dom7;

// Add view
var mainView = myApp.addView('.view-main', {
    // Because we use fixed-through navbar we can enable dynamic navbar
    dynamicNavbar: true
});

// Callbacks to run specific code for specific pages, for example for About page:
myApp.onPageInit('about', function (page) {
    // run createContentPage func after link was clicked
});


$$(document).on('deviceready', function(){
    alert(typeof window['plugins']);
    alert(typeof window.plugins.hasOwnProperty('ChildBrowser'));
    for (var i in window.plugins){
        alert(window.plugins[i]);
    }
});