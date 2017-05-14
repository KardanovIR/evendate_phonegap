/*jslint browser: true*/
/*global console, Dom7, $, angular, angularApp*/

MyApp.ns('MyApp.pages');

MyApp.pages.ProfilePageController = function ($scope) {
    'use strict';

    var tab_names = ['profile', 'settings'];
    var active_tab = tab_names[0];


    $scope.subscriptions = null;
    $scope.selected_organization = null;
    $scope.organization_categories = [];
    $scope.no_subscriptions = true;
    $scope.data_loaded = false;
    $scope.tickets = {
        data_loaded: false,
        no_tickets: false,
        futures_count: 0,
        past_count: 0,
        items: []
    };

    $scope.tabs = {
        profile: {},
        settings: {},
        admin: {}
    };


    $scope.setUser = function () {
        if (!__user) {
            __user = [{}];
        }
        $scope.info = __user[0];
        if ($scope.info.is_editor) {
            $$('#admin-tabbar-link').addClass('shown');

            angular.element($$('#admin-events-content')).scope().getAdminEvents(function () {})
        }
        __api.users.get([
            {me: true},
            {fields: 'blurred_image_url'}
        ], function (data) {
            if (data && data.length > 0) {
                $scope.info.blurred_img_url = data[0].blurred_img_url;
                $scope.$digest();
            }
        });
        $scope.getSubscriptionsList();
    };

    function getTickets() {
        $scope.tickets.data_loaded = false;
        $scope.tickets.no_tickets = true;
        __api.events.get([
            {fields: 'dates,is_same_time,image_horizontal_medium_url,nearest_event_date,location,tickets{"fields":"created_at,number,ticket_type,order"}'},
            {order_by: 'nearest_event_date,-first_event_date'},
            {length: 1000},
            {is_registered: true}
        ], function (data) {

            data.forEach(function (event) {
                if (event.nearest_event_date != null) {
                    event.is_future = true;
                    $scope.tickets.futures_count++;
                } else {
                    event.is_future = false;
                    $scope.tickets.past_count++;
                }
            });

            $scope.tickets.items = data ? data : [];
            $scope.no_subscriptions = $scope.tickets.items.length !== 0;
            $scope.tickets.data_loaded = true;

            $scope.$apply();
        });
    }

    $scope.updateNewEventsIndicator = function () {
        var sum = 0;
        $scope.subscriptions.forEach(function (subscription) {
            sum += subscription.new_events_count;
        });
        __events_indicator.setCount(sum);
    };

    $scope.getSubscriptionsList = function () {
        $scope.data_loaded = false;
        $scope.no_subscriptions = true;
        __api.organizations.get([
            {subscriptions: true},
            {fields: 'description,new_events_count,is_subscribed,background_medium_img_url,img_medium_url,subscribed_count'}], function (data) {

            $scope.subscriptions = data ? data : [];
            $scope.no_subscriptions = $scope.subscriptions.length != 0;
            $scope.data_loaded = true;
            $scope.updateNewEventsIndicator();
            // INTRO
            if (data && data.length == 0 && __authorized) {
                __api.organizations.get([
                    {fields: 'img_medium_url,subscribed_count'},
                    {recommendations: true},
                    {length: 20}
                ], function (items) {
                    angular.element($$('#onboarding')).scope().setCount(items);
                });
            }
            $scope.$apply();
        });
        getTickets();
    };


    $scope.moveActiveBackground = function ($event) {
        var $$this = $$($event.target),
            $$feeds = $$('#user-profile'),
            name = $$this.data('name');

        $scope.tabs[active_tab].scroll = $$feeds.scrollTop();


        active_tab = name;
        $$('#view-profile .tab-runner').css({
            width: $$this.width() + 'px',
            left: $$this.offset().left + 'px'
        });
    };

    $$('.logout-icon').on('click', resetAccount);

};