/*jslint browser: true*/
/*global console*/



var myapp = myapp || {},
	URLs = {
		VK: 'https://oauth.vk.com/authorize?client_id=5029623&scope=friends,email,offline,nohttps&redirect_uri=http://evendate.ru/vkOauthDone.php?mobile=true&response_type=code',
		FACEBOOK: 'https://www.facebook.com/dialog/oauth?client_id=1692270867652630&response_type=code&scope=public_profile,email,user_friends&display=popup&redirect_uri=http://evendate.ru/fbOauthDone.php?mobile=true',
		GOOGLE: 'https://accounts.google.com/o/oauth2/auth?scope=email profile https://www.googleapis.com/auth/plus.login &redirect_uri=http://evendate.ru/googleOauthDone.php?mobile=true&response_type=token&client_id=403640417782-lfkpm73j5gqqnq4d3d97vkgfjcoebucv.apps.googleusercontent.com'
	};
myapp.pages = myapp.pages || {};

myapp.pages.IndexPageController = function (myapp, $$) {
  'use strict';
  
  // Init method
  (function () {

    var options = {
      'bgcolor': '#fff',
      'fontcolor': '#fff',
      'onOpened': function () {
      },
      'onClosed': function () {
      },
          'closeButtonText': 'Пропустить'
    },
      welcomescreen_slides,
      welcomescreen;
    
    welcomescreen_slides = [
      {
        id: 'slide0',
        picture: '<div class="tutorial-img"><img src="res/screen/welcomeslides/0.png"></div>',
        text: ''
      },
      {
        id: 'slide1',
        picture: '<div class="tutorial-img"><img src="res/screen/welcomeslides/1.png"></div>',
        text: ''
      },
      {
        id: 'slide2',
        picture: '<div class="tutorial-img"><img src="res/screen/welcomeslides/2.png"></div>',
        text: ''
      },
      {
        id: 'slide3',
        picture: '<div class="tutorial-img"><img src="res/screen/welcomeslides/3.png"></div>',
        text: ''
      },
      {
        id: 'slide3',
        picture: '<div class="tutorial-img"><img src="res/screen/welcomeslides/4.png"></div>',
        text: '<div class="content-block"><p><a type="button" class="button button-big button-fill start-using-btn">Полетели </a></p></div>'
      }
    ];

    welcomescreen = myapp.welcomescreen(welcomescreen_slides, options);
    
    $$(document).on('click', '.start-using-btn', function () {
      welcomescreen.close();
    });

    $$('.tutorial-open-btn').click(function () {
      welcomescreen.open();  
    });

	$$('.vk-btn').click(function () {
		// open win and turn off location
		var ref = window.open(URLs.VK, '_blank', 'location=no');
		// attach listener to loadstart
		ref.addEventListener('loadstart', function(event) {
          myapp.alert(event.url);
			if (/mobileAuthDone/.test(event.url)) {
              myapp.alert('DONE: ' + event.url);
			}
		});
    });

	$$('.vk-btn2').click(function () {
		// open win and turn off location
      window.plugins.ChildBrowser.showWebPage(URLs.VK, { showLocationBar: false, showAddress:false, showNavigationBar:false });
		// attach listener to loadstart
      window.plugins.ChildBrowser.onLocationChange = function (url) {
        if (/mobileAuthDone/.test(url)) {
          document.body.innerText = url;
          window.plugins.ChildBrowser.close();
        }
      };
    });
  
  }());

};