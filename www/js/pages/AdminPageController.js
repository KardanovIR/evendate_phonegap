/*jslint browser: true*/
/*global console, Dom7, $, angular, angularApp*/

MyApp.ns('MyApp.pages');

MyApp.pages.AdminPageController = function ($scope) {
    'use strict';

    $scope.admin_events = {
        is_downloading: false,
        all_loaded: false,
        no_events: false,
        futures_count: 0,
        past_count: 0,
        page: 0,
        items: []
    };

    var getAdminEvents = function (first_page, cb) {
        if ($scope.admin_events.is_downloading) return;

        $scope.admin_events.data_loaded = false;
        $scope.admin_events.is_downloading = true;

        if (first_page === true) {
            $scope.admin_events.page = 0;
            $scope.admin_events.all_loaded = false;
            $scope.admin_events.items = [];
        }
        $scope.$apply();

        __api.events.get([
            {fields: 'dates,is_same_time,image_horizontal_medium_url,nearest_event_date,last_event_date,sold_tickets_count,tickets_count,tickets{"fields":"created_at,number,ticket_type,order"}'},
            {order_by: 'nearest_event_date,-last_event_date'},
            {length: 10},
            {page: $scope.admin_events.page},
            {registration_locally: true},
            {can_edit: true}
        ], function (data) {
            if ($scope.admin_events.page === 0 && data.length === 0) {
                $scope.admin_events.no_events = true;
            } else {
                if (data.length === 0) {
                    $scope.admin_events.all_loaded = true;
                }
                data.forEach(function (event) {
                    if (event.nearest_event_date !== null) {
                        event.is_future = true;
                        $scope.admin_events.futures_count++;
                    } else {
                        event.is_future = false;
                        $scope.admin_events.past_count++;
                    }
                    event.scanQR = scanQR;

                    event.openCheckInPage = function () {

                        var _event = event;
                        if (callbackObjects['checkInPageBeforeAnimation']) {
                            callbackObjects['checkInPageBeforeAnimation'].remove();
                        }
                        callbackObjects['checkInPageBeforeAnimation'] = fw7App.onPageBeforeAnimation('checkn-page', function (page) {


                            if ($$(page.container).hasClass('page-on-left')) return;
                            var $$container = $$(page.container);
                            if ($$container.data('opened') == true) {
                                var $scope = angular.element($$container[0]).scope();
                                //console.log(_event);
                                $scope.setEvent(_event);
                            } else {
                                var rootElement = angular.element(document);
                                rootElement.ready(function () {
                                    rootElement.injector().invoke(["$compile", function ($compile) {
                                        var scope = angular.element(page.container).scope();
                                        $compile(page.container)(scope);
                                        var $scope = angular.element($$container[0]).scope();
                                        //console.log(_event);
                                        $scope.setEvent(_event);
                                        $$container.data('opened', true);
                                    }]);
                                });
                            }
                        });
                        fw7App.getCurrentView().router.loadPage({
                            url: 'pages/checkin.html',
                            query: {id: _event.id},
                            pushState: true,
                            animatePages: true
                        });
                    };

                    //adding to array
                    $scope.admin_events.items.push(event);
                });
            }

            $scope.admin_events.page++;
            $scope.admin_events.is_downloading = false;

            if (cb) {
                cb();
            }
            if (!$scope.$$phase) {
                $scope.$apply();
            } else {
                setTimeout(function () {
                    if (!$scope.$$phase) {
                        $scope.$apply();
                    }
                }, 1000);
            }
        });
    };

    $scope.getAdminEvents = function (cb) {
        getAdminEvents(true, cb);
        $$('#admin-events-content').on('infinite', function () {
            if ($scope.admin_events.all_loaded) return;
            getAdminEvents(false, cb);
        });

        $$('#admin-events-content').on('refresh', function () {
            getAdminEvents(true, function () {
                fw7App.pullToRefreshDone($$('#admin-events-content'));
            });
        });

    };

};