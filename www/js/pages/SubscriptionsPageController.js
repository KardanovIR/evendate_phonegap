/*jslint browser: true*/
/*global console, Dom7, $, angular, angularApp*/

MyApp.ns('MyApp.pages');

MyApp.pages.SubscriptionsPageController = function ($scope, $http) {
  'use strict';

  $scope.subscriptions = null;
  $scope.selected_organization = null;

  $scope.setUser = function(){
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
    });
  };

  $scope.openOrganization = function(subscription){
    $scope.selected_organization = subscription;
    $scope.$apply();
    debugger;
    fw7App.getCurrentView().router.load({
      pageName: 'organizationPage',
      animatePages: true
    });
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