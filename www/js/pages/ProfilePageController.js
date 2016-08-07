/*jslint browser: true*/
/*global console, Dom7, $, angular, angularApp*/

MyApp.ns('MyApp.pages');

MyApp.pages.ProfilePageController = function ($scope) {
    'use strict';

    $scope.subscriptions = null;
    $scope.selected_organization = null;
    $scope.organization_categories = [];
    $scope.no_subscriptions = true;
    $scope.data_loaded = false;

    $scope.setUser = function () {
        $scope.info = __api.users.normalize([__user])[0];
        __api.users.get([
            {me: true},
            {fields: 'blurred_image_url'}
        ], function (data) {
            $scope.info.blurred_img_url = data[0].blurred_img_url;
        });
        $scope.getSubscriptionsList();
    };

    function getSettings() {
        __api.users.getSettings(function (data) {
            $$('#show-to-friends')
                .prop('checked', data.show_to_friends)
                .on('change', function () {
                    __api.users.setSettings({'show-to-friends': $$(this).prop('checked')}, function(){});
                });
            $$('#add-to-calendar')
                .prop('checked', data['add-to-calendar'] == 'true')
                .on('change', function () {
                    __api.users.setSettings({'add-to-calendar': $$(this).prop('checked')}, function(){});
                });
        });
    }

    $scope.getSubscriptionsList = function () {
        $scope.data_loaded = false;
        $scope.no_subscriptions = true;
        __api.organizations.get([
            {subscriptions: true},
            {fields: 'description,new_events_count,is_subscribed,background_medium_img_url,img_medium_url,subscribed_count'}], function (data) {
            $scope.subscriptions = data;
            $scope.no_subscriptions = $scope.subscriptions.length != 0;
            $scope.data_loaded = true;

            // INTRO
            if (data.length == 0) {
                __api.organizations.get([
                    {fields: 'img_medium_url,subscribed_count'},
                    {recommendations: true},
                    {length: 20}
                ], function (items) {
                    angular.element($$('#onboarding')).scope().setItems(items);
                });
            }
            $scope.$apply();
        });
        getSettings()
    };

    $$('.logout-icon').on('click', resetAccount);

};