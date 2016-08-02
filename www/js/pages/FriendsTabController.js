/*jslint browser: true*/
/*global console, Dom7, $, angular, angularApp*/

MyApp.ns('MyApp.pages');

MyApp.pages.FriendsTabController = function ($scope) {
    'use strict';

    var cards_by_users = {},
        action_names = CONTRACT.ACTION_NAMES,
        friends_downloading = false,
        active_tab = 'feed',
        downloaded_friends_page = 0,
        all_downloaded = false;

    $scope.no_actions = false;

    $scope.tabs = {
        feed: {
            items: [],
            page: 0,
            scroll: 0,
            is_downloading: false,
            all_loaded: false,
            no_timeline_events: null
        },
        friends: {
            items: [],
            page: 0,
            scroll: 0,
            is_downloading: false,
            all_loaded: false,
            no_timeline_events: null
        }
    };

    var $$pull_to_refresh = $$('.friends-page-content');

    $$pull_to_refresh.on('refresh', function () {
        if (active_tab == 'feed') {
            $scope.showFeed(true, function () {
                fw7App.pullToRefreshDone();
            });
        } else {
            $scope.showFriends(true, function () {
                fw7App.pullToRefreshDone();
            });
        }
    });


    $$pull_to_refresh.on('infinite', function () {
        if (active_tab == 'feed') {
            $scope.showFeed(false);
        } else {
            $scope.showFriends(false);
        }
    });

    $scope.showFeed = function (first_page, cb) {
        if ($scope.tabs.feed.is_downloading) {
            if (cb) {
                cb();
            }
            return;
        }
        $scope.tabs.feed.is_downloading = true;
        $scope.tabs.feed.page++;

        $scope.$apply();

        __api.users.get([
                {feed: true},
                {fields: 'type_code,organization{fields:"img_small_url"},event{fields:"image_square_vertical_url"},created_at,user{fields:"gender"}'},
                {order_by: '-created_at'},
                {page: $scope.tabs.feed.page},
                {length: 20}
            ],
            function (data) {
                if (first_page) {
                    $scope.tabs.feed.no_timeline_events = data.length == 0;
                    $scope.tabs.feed.items = [];
                    $scope.tabs.feed.page = 0;
                }
                cards_by_users = {};
                data.forEach(function (stat) {
                    var date = moment.unix(stat.created_at),
                        ent = stat[stat.entity],
                        key = [stat.entity, stat.stat_type_id, stat.user.id, $scope.tabs.feed.page, date.format('DD.MM')].join('-');
                    if (cards_by_users.hasOwnProperty(key) == false) {
                        var action_gender = 'default';
                        if (stat.user.gender == 'male' || stat.user.gender == 'female'){
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
                        $scope.tabs.feed.items.push(cards_by_users[day]);
                    }
                }
                $scope.tabs.feed.is_downloading = false;

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

    $scope.startBinding = function(){
        $scope.showFeed(true, function(){
            $$('#friends-feed-btn').click();
        })
    };

    $scope.showFriends = function (first_page, cb) {
        if ($scope.tabs.friends.is_downloading == true) {
            if (cb) {
                cb();
            }
            return;
        }

        $scope.tabs.friends.is_downloading = true;
        if (first_page) {
            $scope.tabs.friends.page = 0;
        }

        if (!$scope.$$phase) {
            $scope.$apply();
        }

        __api.users.get([
            {friends: true},
            {fields: 'is_friend,type,'},
            {page: $scope.tabs.friends.page++},
            {length: 10}
        ], function (data) {
            if (first_page) {
                $scope.tabs.friends.items = data;
                if (data.length == 0){
                    $scope.tabs.friends.no_timeline_events = true;
                }
            } else {
                $scope.tabs.friends.items = $scope.tabs.friends.items.concat(data);
            }

            if (data.length == 0) {
                $scope.tabs.friends.all_loaded = true;
            }

            $scope.tabs.friends.is_downloading = false;

            if (!$scope.$$phase) {
                $scope.$apply();
            } else {
                setTimeout(function () {
                    if (!$scope.$$phase) {
                        $scope.$apply();
                    }
                }, 1000);
            }

            $scope.tabs.friends.is_downloading = false;

            if (cb) {
                cb();
            }
        });
    };

    $scope.moveActiveBackground = function ($event) {
        var $$this = $$($event.target),
            $$view = $$('#view-friends'),
            name = $$this.data('name');

        $scope.tabs[active_tab].scroll = $$view.scrollTop();

        active_tab = name;
        if (active_tab == 'friends' && $scope.tabs.friends.page == 0){
            $scope.showFriends(true);
        }
        $$view.find('.tab-runner').css({
            width: $$this.width() + 'px',
            left: $$this.offset().left + 'px'
        });
    };


    $$('#friends-feed').on('show', function () {
        $$('#friends').scrollTop($scope.tabs.feed.scroll, 0);
    });

    $$('#friends-list').on('show', function () {
        $$('#friends').scrollTop($scope.tabs.friends.scroll, 0);
    });

};