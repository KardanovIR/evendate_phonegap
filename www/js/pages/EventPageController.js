/*jslint browser: true*/
/*global console, Dom7, $, angular, angularApp*/

MyApp.ns('MyApp.pages');

MyApp.pages.EventPageController = function ($scope) {
    'use strict';

    $scope.event = {};
    $scope.details_shown = false;

    function toggleNotificationState() {
        $scope.event.toggleNotification(this.type);
        $$('.bg-' + this.bg).toggleClass('active');
    }

    var notifications = [
        {
            text: 'За 15 минут',
            close: false,
            type: 'notification-before-quarter-of-hour',
            timediff: 900,
            bg: 'notification-before-quarter-of-hour',
            onClick: toggleNotificationState
        },
        {
            text: 'За 3 часа',
            close: false,
            timediff: 10800,
            type: 'notification-before-three-hours',
            bg: 'notification-before-three-hours',
            onClick: toggleNotificationState
        },
        {
            text: 'За день',
            close: false,
            timediff: 86400,
            type: 'notification-before-day',
            bg: 'notification-before-day',
            onClick: toggleNotificationState
        },
        {
            text: 'За 3 дня',
            close: false,
            timediff: 259200,
            type: 'notification-before-three-days',
            bg: 'notification-before-three-days',
            onClick: toggleNotificationState
        },
        {
            text: 'За неделю',
            close: false,
            timediff: 604800,
            type: 'notification-before-week',
            bg: 'notification-before-week',
            onClick: toggleNotificationState
        }
    ];

    $scope.toggleDetails = function () {
        $scope.details_shown = !$scope.details_shown;
        if (!$scope.details_shown) {
            $scope.details_text = 'Подробнее';
        } else {
            $scope.details_text = 'Скрыть';
        }
    };

    function getNotificationButtons(){
        var notification_buttons = [],
            m_now = moment().unix(),
            first_event_date = $scope.event.first_event_date;
        notifications.forEach(function (notification) {
            if (first_event_date - notification.timediff <= m_now) return true;
            if ($scope.event.notifications_by_types.hasOwnProperty(notification.type)) {
                notification.bg += ' active';
            }
            notification_buttons.push(notification);
        });
        return notification_buttons;
    }

    $scope.showNotificationsList = function () {
        var buttons = getNotificationButtons();
        if (buttons.length == 0){
            buttons = [
                {
                    text: 'Событие уже началось, добавить дополнительные уведомления нельзя.',
                    label: true
                },
                {
                    text: 'Закрыть',
                    color: 'red'
                }
            ];
        }
        fw7App.actions(buttons);
    };

    $scope.setEvent = function (event) {
        $scope.event = event;

        __api.events.get([
            {id: event.id},
            {fields: 'detail_info_url,first_event_date,notifications{fields:"notification_type,done,status"},is_favorite,nearest_event_date,min_price,registration_required,registration_till,location,favored_users_count,favored{length:5,fields:"is_friend",order_by:"-is_friend"},organization_name,organization_logo_small_url,description,is_same_time,tags,dates{fields:"end_time,start_time",order_by:"event_date"}'}
        ], function (res) {
            $scope.event = res[0];
            $scope.$digest();
        });
    }

};