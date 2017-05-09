/*jslint browser: true*/
/*global console, Dom7, $, angular, angularApp*/

MyApp.ns('MyApp.pages');

MyApp.pages.AdminPageController = function ($scope) {
    'use strict';

    $scope.admin_events = {
        data_loaded: false,
        no_tickets: false,
        futures_count: 0,
        past_count: 0,
        items: []
    };

    $scope.getAdminEvents = function () {
        $scope.admin_events.data_loaded = false;
        $scope.admin_events.no_tickets = true;
        __api.events.get([
            {fields: 'dates,is_same_time,image_horizontal_medium_url,nearest_event_date,sold_tickets_count,tickets_count,tickets{"fields":"created_at,number,ticket_type,order"}'},
            {order_by: 'nearest_event_date'},
            {length: 1000},
            {registration_locally: true},
            {can_edit: true}
        ], function (data) {

            data.forEach(function (event) {
                if (event.nearest_event_date != null) {
                    event.is_future = true;
                    $scope.tickets.futures_count++;
                } else {
                    event.is_future = false;
                    $scope.tickets.past_count++;
                }
                event.scanQR = scanQR;
            });


            $scope.admin_events.items = data ? data : [];
            $scope.no_subscriptions = $scope.tickets.items.length !== 0;
            $scope.admin_events.data_loaded = true;

            $scope.$apply();
        });

    };

};