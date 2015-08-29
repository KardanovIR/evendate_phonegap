/*jslint browser: true*/
/*global console, Framework7, angular, Dom7*/

var CONTRACT = {
      URLS:{
        BASE_NAME: 'http://evendate.ru',
        API_FULL_PATH: 'http://evendate.ru/api',
        USERS_PATH: '/users'
      }
  },
    myapp = myapp || {};

myapp.init = (function () {
  'use strict';
  
  var exports = {};
  
  (function () {
    // Initialize app
    var fw7App = new Framework7(),
      fw7ViewOptions = {
        dynamicNavbar: true,
        domCache: true
      },
      mainView = fw7App.addView('.view-main', fw7ViewOptions),
      ipc,
      $$ = Dom7;
    
    ipc = new myapp.pages.IndexPageController(fw7App, $$);
  }());
  
  return exports;

}());

document.addEventListener("deviceready", onDeviceReady, false);
// PhoneGap is ready
function onDeviceReady() {
  alert(window.plugins.hasOwnProperty('ChildBrowser'));
  for (var i in window.plugins){
    alert(window.plugins[i]);
  }
}
