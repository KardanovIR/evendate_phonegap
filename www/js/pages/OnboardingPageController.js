MyApp.ns('MyApp.pages');

MyApp.pages.OnboardingPageController = function ($scope) {
    'use strict';

    $scope.organizations = [];
    $scope.is_downloading = false;
    var ls,
        page = 1;

    $scope.setCount = function(items){
        $scope.organizations = items;
        ls = fw7App.loginScreen();
        fw7App.attachInfiniteScroll($$('.login-screen-content'));
        $$('.login-screen-content').on('infinite', function(){
            if ($scope.is_downloading == true) return;
            $scope.is_downloading = true;
            $scope.$apply();
            __api.organizations.get([
                {fields: 'img_medium_url,subscribed_count'},
                {recommendations: true},
                {length: 20},
                {page: page++}
            ], function (items) {
                $scope.organizations = $scope.organizations.concat(items);
                $scope.is_downloading = false;
                $scope.$apply();
            });
        });
        $scope.$apply();
    };

};