/*jslint browser: true*/
/*global console, Dom7, $, angular, angularApp*/

MyApp.ns('MyApp.pages');

MyApp.pages.SubscriptionsPageController = function ($scope, $http) {
  'use strict';

  $scope.subscriptions = null;
  $scope.selected_organization = null;

  $scope.setUser = function(){
    console.log(__user);
    debugger;
    $scope.info = __user;
    $scope.getSubscriptionsList();
  };


  $scope.getSubscriptionsList = function(){
    __api.subscriptions.get(null, function(data){
      $scope.subscriptions = data;
      $scope.$apply();
    });
  };

  $scope.getOrganizationsCatalog = function(){
    __api.organizations.get(null, function(data){
      $scope.organizations = data;
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
    });
  };

  $scope.subscribe = function(organization, $event){

    $event.stopPropagation();
  };

  $scope.openOrganization = function(subscription){
    __api.organizations.get([{
      id: subscription.id
    }], function(res){
      $scope.selected_organization = res;
      $scope.$apply();

      fw7App.getCurrentView().router.load({
        pageName: 'organizationPage',
        animatePages: true
      });
    });

    debugger;
    __api.events.get([{
      organization_id: subscription.id,
      type: 'future'
    }], function(res){
      $scope.selected_organization.events = res;
      $scope.$apply();
    });
  };

  $scope.toggleSubscription = function(){
    if ($scope.selected_organization.subscription_id == null){

    }else{

    }
  };

  $$('#profile').on('refresh', function(){
    $scope.getSubscriptionsList();
    fw7App.pullToRefreshDone();
  });

  $$('#organizations').on('refresh', function(){
    $scope.getOrganizationsCatalog();
    fw7App.pullToRefreshDone();
  });

};