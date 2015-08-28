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
      'bgcolor': '#394D63',
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
        picture: '<div class="tutorialicon">♥</div>',
        text: 'Welcome to this tutorial. In the <a class="tutorial-next-link" href="#">next steps</a> we will guide you through a manual that will teach you how to use this app.'
      },
      {
        id: 'slide1',
        picture: '<div class="tutorialicon">✲</div>',
        text: 'This is slide 2'
      },
      {
        id: 'slide2',
        picture: '<div class="tutorialicon">♫</div>',
        text: 'This is slide 3'
      },
      {
        id: 'slide3',
        picture: '<div class="tutorialicon">☆</div>',
        text: 'Thanks for reading! Enjoy this app or go to <a class="tutorial-previous-slide" href="#">previous slide</a>.<br><br><a class="tutorial-close-btn" href="#">End Tutorial</a>'
      }

    ];

    welcomescreen = myapp.welcomescreen(welcomescreen_slides, options);
    
    $$(document).on('click', '.tutorial-close-btn', function () {
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
			if (/mobileAuthDone/.test(event.url)) {
				ref.close();
				document.body.innerText = event.url;
			}
		});
    });

	$$('.vk-btn2').click(function () {
		// open win and turn off location
		var ref = window.plugins.ChildBrowser.showWebPage(URLs.VK,
            { showLocationBar: false, showAddress:false, showNavigationBar:false });
		// attach listener to loadstart
      window.plugins.ChildBrowser.onLocationChange = function (url) {
        if (/mobileAuthDone/.test(url)) {
          console.log(url);
          window.plugins.ChildBrowser.close();
        }
      };
    });

    $$(document).on('click', '.tutorial-next-link', function (e) {
      welcomescreen.next(); 
    });
    
    $$(document).on('click', '.tutorial-previous-slide', function (e) {
      welcomescreen.previous(); 
    });
  
  }());

};