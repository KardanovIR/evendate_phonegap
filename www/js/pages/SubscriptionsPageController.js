/*jslint browser: true*/
/*global console, Dom7, $, angular, angularApp*/

MyApp.ns('MyApp.pages');

MyApp.pages.SubscriptionsPageController = function ($scope, $http) {
  'use strict';

  $scope.subscriptions = null;
  $scope.selected_organization = null;
  $scope.organization_categories = [];
  $scope.no_subscriptions = true;
  $scope.data_loaded = false;
  var dont_show_intro = false;

  $scope.setUser = function(){
    $scope.info = __api.users.normalize([__user])[0];
    $scope.getSubscriptionsList();
    L.log('Running __run_after_init');
    __run_after_init();
    L.log('__run_after_init DONE');
  };

  function showIntroMessage(message_number){
    var $$current = $$('[data-step="' + message_number + '"]'),
        $$message_el = $$('.introjs-tooltipReferenceLayer'),
        $$message_text = $$message_el.find('.introjs-tooltiptext');

    if (message_number == null){
      $$message_el.hide();
      $$('.modal-overlay-navbar').removeClass('modal-overlay-visible');
      $$('.modal-overlay-tabbar').removeClass('modal-overlay-visible');
    }else{
      var _text = $$current.data('intro'),
          _step = $$current.data('step'),
          _position = $$current.data('position');
      $$message_text.text(_text);
      var _height = 70;//$$message_el.height();
      if (_position == 'bottom'){
        $$message_el.css({
          'top': $$current.height() + 30 + 'px',
          left: window.innerWidth / 2 + $$current.width() / 2 - $$message_el.find('.introjs-tooltip').width()/2 + 'px'
        });
      }else{
        $$message_el.css({
          'top': $$current.offset().top - _height + 'px',
          left: $$current.offset().left + $$current.width() / 2 - 35 + 'px'
        });
      }

      //different logic for different steps
      var $$overlay;
      if (_step == 1 || _step == 3){
        $$('.modal-overlay-navbar').removeClass('modal-overlay-visible');
        $$overlay = $$('.modal-overlay-tabbar');
        $$('.main-tabbar').addClass('introjs-fixParent');
        $$('.profile-navbar').removeClass('introjs-fixParent');
        $$message_el.find('.introjs-arrow').removeClass('top').addClass('bottom');
      }else{
        $$('.modal-overlay-tabbar').removeClass('modal-overlay-visible');
        $$overlay = $$('.modal-overlay-navbar');
        $$('.main-tabbar').removeClass('introjs-fixParent');
        $$('.profile-navbar').addClass('introjs-fixParent');
        $$message_el.find('.introjs-arrow').removeClass('bottom').addClass('top');
      }

      $$overlay.off('click').addClass('modal-overlay-visible').on('click', function(){
        $$(this).off('click').removeClass('modal-overlay-visible');
        showIntroMessage(null);
        dont_show_intro = true;
      });

      $$message_el.show();
    }


  }

  $scope.getSubscriptionsList = function(){
    $scope.data_loaded = false;
    $scope.no_subscriptions = true;
    __api.subscriptions.get(null, function(data){
      $scope.subscriptions = data;
      $scope.no_subscriptions = $scope.subscriptions.length != 0;
      $scope.data_loaded = true;

      // INTRO
      if (data.length == 0 && !tempStorage.getItem('intro_done')){
        var show_back_to_calendar = false,
            $$page = $$('.profile-page-content');
        showIntroMessage(1);

        $$page.on('infinite', function (){
          if ($$('#organizations').hasClass('active') && !dont_show_intro && show_back_to_calendar == false && $$page.find('.button-filled-blue').length > 0){
            show_back_to_calendar = true;
            $$page.off('infinite');
            setTimeout(function(){
              showIntroMessage(3);
              $$('#view-events-tab-link').on('click', function(){
                showIntroMessage(null);
              });
            }, 2000);
          }
        });

        $$('.view-profile.tab-link').on('click', function(){
          if (tempStorage.getItem('intro_done') || dont_show_intro) return;
          tempStorage.setItem('intro_done', true);
          $$(this).off('click');
          showIntroMessage(2);
          $$('.tab-link.organizations').on('click', function(){
            showIntroMessage(null);
            $$(this).off('click');
          });
        });
      }
      $scope.$apply();
    });
  };

  $scope.getOrganizationsCatalog = function(){

    fw7App.showPreloader();

    __api.organizations.get(null, function(data){

      var categories_array = [],
          orgs_by_categories = {};

      data.forEach(function(org){
        var key = '_' + org.type_id;
        if (!orgs_by_categories.hasOwnProperty(key)){
          orgs_by_categories[key] = {
            name: org.type_name,
            organizations: []
          };
        }
        orgs_by_categories[key].organizations.push(org);
      });

      for(var key in orgs_by_categories){
        if (orgs_by_categories.hasOwnProperty(key)){
          categories_array.push(orgs_by_categories[key]);
        }
      }

      $scope.organization_categories = categories_array;
      $scope.$apply();


      $$('.organizations-list button')
          .on('touchend', function(){
            $$(this).parents('.item-link').removeClass('disable-active-state');
          })
          .on('click', function(){
            var $item_link = $$(this).parents('.item-link');
            $item_link.addClass('disable-active-state');
          });
      $$('.organizations-list .item-link').on('touchstart', function(e){
        if ($$(e.target).is('button')){
          $$(this).addClass('disable-active-state');
        }else{
          $$(this).removeClass('disable-active-state');
        }
      });
      fw7App.hidePreloader();
    });
  };

  $$('.logout-btn').on('click', resetAccount);

};