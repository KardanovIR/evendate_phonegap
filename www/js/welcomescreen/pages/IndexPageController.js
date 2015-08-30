/*jslint browser: true*/
/*global console*/

var fn,
    permanentStorage = window.localStorage,
    myapp = myapp || {},
    URLs = {
      VK: 'https://oauth.vk.com/authorize?client_id=5029623&scope=friends,email,offline,nohttps&redirect_uri=http://evendate.ru/vkOauthDone.php?mobile=true&response_type=code',
      FACEBOOK: 'https://www.facebook.com/dialog/oauth?client_id=1692270867652630&response_type=code&scope=public_profile,email,user_friends&display=popup&redirect_uri=http://evendate.ru/fbOauthDone.php?mobile=true',
      GOOGLE: 'https://accounts.google.com/o/oauth2/auth?scope=email profile https://www.googleapis.com/auth/plus.login &redirect_uri=http://evendate.ru/googleOauthDone.php?mobile=true&response_type=token&client_id=403640417782-lfkpm73j5gqqnq4d3d97vkgfjcoebucv.apps.googleusercontent.com'
    };
myapp.pages = myapp.pages || {};

myapp.pages.IndexPageController = function (myapp, $$) {
  'use strict';

  function getSearchAsObject(search) {
    if (search == null) return null;
    return search.replace(/(^\?)/, '').split("&").map(function(n) {
      return n = n.split("="), this[n[0]] = n[1], this
    }.bind({}))[0];
  }

  function saveTokenInLocalStorage(url){
    var url_parts = url.split('?'),
        search_object = url_parts.length > 1 ? getSearchAsObject(url_parts[1]) : null;
    permanentStorage.setItem('token', search_object['token']);
    checkToken();
  }

  function openApplication(){
    $$('.main-tabbar').removeClass('hidden');
    var viewsElement = $$('.view-events')[0],
        viewInstance = viewsElement.f7View;
    viewInstance.showNavbar();
    viewInstance.showToolbar();
    $$('.view').removeClass('active');
    $$(viewsElement).addClass('active');
  }

  function showSlides(){
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
        picture: '<div class="tutorial-img"><img src="img/welcomeslides/0.png"></div>',
        text: ''
      },
      {
        id: 'slide1',
        picture: '<div class="tutorial-img"><img src="img/welcomeslides/1.png"></div>',
        text: ''
      },
      {
        id: 'slide2',
        picture: '<div class="tutorial-img"><img src="img/welcomeslides/2.png"></div>',
        text: ''
      },
      {
        id: 'slide3',
        picture: '<div class="tutorial-img"><img src="img//welcomeslides/3.png"></div>',
        text: ''
      },
      {
        id: 'slide3',
        picture: '<div class="tutorial-img"><img src="img//welcomeslides/4.png"></div>',
        text: '<div class="content-block"><p><a type="button" class="button button-big button-fill start-using-btn">Полетели </a></p></div>'
      }
    ];
    welcomescreen = myapp.welcomescreen(welcomescreen_slides, options);

    $$(document).on('click', '.start-using-btn', function() {
      welcomescreen.close();
    });

    $$('.tutorial-open-btn').click(function() {
      welcomescreen.open();
    });

    $$('.vk-btn').click(function() {
      window.plugins.ChildBrowser.showWebPage(URLs.VK, {
        showLocationBar: false,
        showAddress: true,
        showNavigationBar: true
      });
      window.plugins.ChildBrowser.onLocationChange = function(url) {
        if (/mobileAuthDone/.test(url)) {
          saveTokenInLocalStorage(url);
          window.plugins.ChildBrowser.close();
        }
      };
    });
  }

  function checkToken(){
    if (__os == 'win'){
      permanentStorage.setItem('token', '2f0ac947b7cb365ec24580a155e44abe98ad9813e6c0398257568f0405578f4bb7394c5ebb81a8686f0511ef0460781113765bb00lFk03hoBzMx08x8v0sX3pfXhH0kW5SSZ6UMg1GPo5JFI0lDp3WpjxUunxNdnDV');
    }
    var token = permanentStorage.getItem('token');
    if (token != null){
      $$.ajax({
        url: CONTRACT.URLS.API_FULL_PATH + CONTRACT.URLS.USERS_PATH + '/me',
        headers: {
          'Authorization': token
        },
        success: function(res){
          if (res.status == false){
            showSlides();
          }else{
            permanentStorage.setItem('user', res.data);
            __user = res.data;
            openApplication();
          }
        }
      });
    }else{
      showSlides();
    }
  }
  checkToken();
};