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
    __run_after_init();
  };



  function toggleModalOverlay(cb){
    $$('.modal-overlay').off('click').addClass('modal-overlay-visible').on('click', function(){
      $$(this).off('click').removeClass('modal-overlay-visible');
      dont_show_intro = true;
      if (cb){
        cb();
      }
    })
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
        var intro = introJs().start(),
            show_back_to_calendar = false,
            $$page = $$('.profile-page-content');
        toggleModalOverlay(function(){
          intro.exit();
        });

        $$page.on('infinite', function (){
          if ($$('#organizations').hasClass('active') && !dont_show_intro && show_back_to_calendar == false && $$page.find('.button-filled-blue').length > 0){
            show_back_to_calendar = true;
            $$page.off('infinite');
            setTimeout(function(){
              if (intro){
                intro.nextStep();
              }else{
                intro = introJs().start().goToStep(3);
              }
              toggleModalOverlay(function(){
                intro.exit();
              });
              $$('#view-events-tab-link').on('click', function(){
                if (intro){
                  intro.exit();
                  intro = null;
                  toggleModalOverlay(function(){
                    intro.exit();
                  });
                }
              });
            }, 2000);
          }
        });

        $$('.view-profile.tab-link').on('click', function(){
          tempStorage.setItem('intro_done', true);
          $$(this).off('click');
          setTimeout(function(){
            $$('.organizations.tab-link').on('click', function(){
              intro.exit();
              intro = null;
            });
            if (intro && !dont_show_intro){
              intro.nextStep();
              toggleModalOverlay(function(){
                intro.exit();
              });
            }
          }, 500)
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