MyApp.ns('MyApp.pages');

MyApp.pages.OnboardingPageController = function ($scope) {
    'use strict';

    $scope.organizations = [];
    var ls;

    $scope.setItems = function(items){
        $scope.organizations = items;
        ls = fw7App.loginScreen();
        $scope.$apply();
    };

};