/*jslint browser: true*/
/*global console, Dom7, $, angular, angularApp*/

MyApp.ns('MyApp.pages');

MyApp.pages.FriendPageController = function ($scope) {
    'use strict';
    var
        action_names = CONTRACT.ACTION_NAMES,
        tabs = [];

    $scope.user = {};
    $scope.subscriptions = [];
    $scope.cards = [];
    $scope.page = 0;
    $scope.all_actions_downloaded = false;
    $scope.no_subscriptions = null;
    $scope.no_actions = null;
    $scope.is_downloading = false;

    var active_tab = 'activity',
        cards_by_users = {};

    $scope.setUser = function (user) {
        user.html_id = user.id + '-' + moment().unix();
        $scope.user = user;

        $scope.getSubscriptions();
        $scope.showFeed(true);

        var $$friend_page = $$('#friend-page-' + user.html_id);


        $$friend_page.find('.page-content').on('infinite', function () {
            if (active_tab == 'activity') {
                $scope.showFeed(false);
            }
        });

        $scope.$apply();
    };

    $scope.getSubscriptions = function () {
        __api.users.get([
            {friend_id: $scope.user.id},
            {length: 500},
            {fields: 'subscriptions{fields:"img_medium_url,short_name,"},type,uid'}
        ], function (data) {
            $scope.subscriptions = data[0].subscriptions;
            $scope.no_subscriptions = data[0].subscriptions.length == 0;

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

    $scope.showFeed = function (first_page, cb) {

        if ($scope.is_downloading) return;

        $scope.is_downloading = true;
        $scope.page++;

        if (first_page){
            $scope.page = 0;
            $scope.all_actions_downloaded = false;
        }

        if ($scope.all_actions_downloaded) return;

        $scope.$apply();

        __api.users.get([
                {actions: true},
                {fields: 'type_code,organization{fields:"img_small_url"},event{fields:"image_square_vertical_url"},created_at,user{fields:"gender"}'},
                {order_by: '-created_at'},
                {friend_id: $scope.user.id},
                {page: $scope.page},
                {length: 20}
            ],
            function (data) {
            if (data.length < 20){
                $scope.all_actions_downloaded = true;
            }
                cards_by_users = {};
                data.forEach(function (stat) {
                    var date = moment.unix(stat.created_at),
                        ent = stat[stat.entity],
                        key = [stat.entity, stat.stat_type_id, stat.user.id, $scope.page, date.format('DD.MM')].join('-');
                    if (cards_by_users.hasOwnProperty(key) == false) {
                        var action_gender = 'default';
                        if (stat.user.gender == 'male' || stat.user.gender == 'female') {
                            action_gender = stat.user.gender;
                        }
                        cards_by_users[key] = {
                            user: stat.user,
                            entity: stat.entity,
                            type_code: stat.type_code,
                            date: date.format('DD.MM'),
                            action_name: action_names[stat.type_code][action_gender],
                            open: function () {
                                fw7App.showIndicator();
                                __api.users.get([
                                    {friend_id: this.user.id},
                                    {fields: 'blurred_img_url,uid,type'}
                                ], function (data) {
                                    fw7App.hideIndicator();
                                    data[0].open();
                                })
                            },
                            entities: []
                        };
                    }

                    if (stat.entity == CONTRACT.ENTITIES.EVENT) {
                        ent.img_url = ent.image_square_vertical_url;
                        ent.openEntity = function () {
                            fw7App.showIndicator();
                            storeStat(stat.user.id, CONTRACT.ENTITIES.FRIEND, CONTRACT.STATISTICS.FRIEND_VIEW_EVENT_FROM_USER);
                            __api.events.get([
                                {id: ent.id}
                            ], function (res) {
                                fw7App.hideIndicator();
                                res[0].open();
                            });
                        };
                    } else if (stat.entity == CONTRACT.ENTITIES.ORGANIZATION) {
                        ent.img_url = ent.img_small_url;
                        ent.title = ent.short_name;
                        ent.openEntity = function () {
                            __api.organizations.get([
                                {id: ent.id}
                            ], function (res) {
                                res[0].open();
                            });
                        };
                    }

                    cards_by_users[key].entities.push(ent);
                });

                for (var day in cards_by_users) {
                    if (cards_by_users.hasOwnProperty(day)) {
                        $scope.cards.push(cards_by_users[day]);
                    }
                }
                $scope.is_downloading = false;

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
};





function toggleActiveTabs(el, id) {
    var $$el = $$(el),
        $$siblings = $$el.parent().find('.button'),
        $$container = $$(fw7App.getCurrentView().activePage.container);
    $$siblings.removeClass('active');
    $$el.addClass('active');
    if (id) {
        $$siblings.data('friend-id', id);
    }
    $$container.find('.friend-tabs .tab').removeClass('active');
    $$container.find('.tab.' + $$el.data('page')).addClass('active');
}