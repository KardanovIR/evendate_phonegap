/*jslint browser: true*/
/*global console, Dom7, $, angular, angularApp*/

MyApp.ns('MyApp.pages');

MyApp.pages.EventsInDayController = function ($scope, $element) {
    'use strict';

    var $$element = $$($element);

    $scope.day_events = [];
    $scope.date = null;
    $scope.no_events = false;
    $scope.is_downloading = false;
    $scope.all_downloaded = false;
    $scope.page_counter = 0;

    function getEventsPortion(date, cb) {
        if ($scope.all_downloaded || $scope.is_downloading) return;
        var is_first_page = $scope.page_counter == 0,
            date_formatted = date.format(CONTRACT.DATE_FORMAT),
            send_data = [
                {date: date_formatted},
                {fields: 'is_favorite,organization_short_name,favored_users_count,favored{length:5, fields:"avatar_url"},organization_logo_small_url,nearest_event_date,dates{length:1000,fields:"end_time,start_time"},image_horizontal_medium_url,is_free,dates,min_price'},
                {length: 10},
                {page: $scope.page_counter++},
                {order_by: '-is_favorite'},
                {my: true}
            ];
        $scope.is_downloading = true;
        __api.events.get(send_data, function (data) {
            if (data.length < 10) {
                $scope.all_downloaded = true;
            }
            data.forEach(function (item, index) {
                item.display_date = item.moment_dates_object[date_formatted][0];
                data[index] = item;
            });
            $scope.is_downloading = false;
            cb(data, is_first_page);
        });
    }

    function changeDate(direction) {
        $scope.no_events = false;
        $scope.all_downloaded = false;
        $scope.page_counter = 0;
        $scope.$apply();

        $scope.day_events = [];
        $scope.setDate($scope.date.add(direction, 'days'));

        getEventsPortion($scope.date, updateView);
    }

    function updateView(data, is_first_page) {
        if (is_first_page) {
            $scope.day_events = data;
            $scope.no_events = data.length == 0;
        } else {
            $scope.day_events = $scope.day_events.concat(data);
        }
        $scope.$digest();
    }

    $scope.showPage = function () {
        getEventsPortion($scope.date, updateView);
    };

    $scope.setDate = function (date) {
        $scope.date = date;
        $scope.date_text = date.format('DD MMMM');

        var __today = moment();
        if (__today.format(CONTRACT.DATE_FORMAT) == date.format(CONTRACT.DATE_FORMAT)) {
            $scope.date_text = 'Сегодня';
        } else if (__today.add('days', 1).format(CONTRACT.DATE_FORMAT) == date.format(CONTRACT.DATE_FORMAT)) {
            $scope.date_text = 'Завтра';
        }
        $scope.$digest();
    };


    $$element.find('.left').on('click', function () {
        changeDate(-1);
    });


    $$element.find('.right').on('click', function () {
        changeDate(1);
    });


    $$('.events_in_day.page-content').on('infinite', function () {
        getEventsPortion($scope.date, updateView);
    });
};