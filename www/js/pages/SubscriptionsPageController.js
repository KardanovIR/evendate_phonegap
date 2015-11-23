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

  $scope.setUser = function(){
    $scope.info = __user;
    $scope.getSubscriptionsList();
    __run_after_init();
  };


  $scope.getSubscriptionsList = function(){
    $scope.data_loaded = false;
    $scope.no_subscriptions = true;
    __api.subscriptions.get(null, function(data){
      $scope.subscriptions = data;
      $scope.no_subscriptions = $scope.subscriptions.length != 0;
      $scope.data_loaded = true;
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

  $$('.logout-btn').on('click', function(){
    resetDemoAccount();
  });

};