/*jslint browser: true*/
/*global console, Dom7, $, angular, angularApp*/

MyApp.ns('MyApp.pages');

MyApp.pages.OrganizationPageController = function ($scope, $element) {
    'use strict';

    $scope.organization = {};
    $scope.details_shown = false;
    $scope.details_text = 'Подробнее';
    $scope.is_downloading = true;
    $scope.events_page_counter = 1;


    $scope.toggleDetails = function () {
        $scope.details_shown = !$scope.details_shown;
        if (!$scope.details_shown) {
            $scope.details_text = 'Подробнее';
        } else {
            $scope.details_text = 'Скрыть';
            $scope.details_class = 'Подробнее';
        }
    };

    function loadNextEvents() {
        if ($scope.is_downloading) return;
        $scope.is_downloading = true;
        __api.events.get([
            {organization_id: $scope.organization.id},
            {fields: 'image_square_horizontal_url,nearest_event_date,favored,is_favorite'},
            {page: $scope.events_page_counter++},
            {length: 10},
            {future: true},
            {order_by: 'nearest_event_date'}
        ], function (res) {
            $scope.is_downloading = false;
            $scope.organization.events = $scope.organization.events.concat(res);
            $scope.$apply();
        });
    }

    $scope.setOrganization = function (organization) {
        $scope.is_downloading = true;
        $scope.organization = organization;
        __api.organizations.get([{
            id: organization.id,
            fields: 'is_subscribed,default_address,background_medium_img_url,img_medium_url,subscribed_count,description,events{length:10,filters:"future=true",fields:"image_square_horizontal_url,nearest_event_date,favored,is_favorite",order_by:"nearest_event_date"},site_url,subscribed{length:5, fields:"is_friend,random",order_by:"-is_friend,random"}',
        }], function (res) {
            $scope.organization = res[0];
            $scope.organization.events = __api.events.normalizeAll($scope.organization.events);
            $scope.is_downloading = false;
            $scope.$apply();

            fw7App.attachInfiniteScroll($element);
            $element.on('infinite', loadNextEvents);

        });
    }


};