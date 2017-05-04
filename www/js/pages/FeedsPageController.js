MyApp.ns('MyApp.pages');

MyApp.pages.FeedsPageController = function ($scope, $timeout) {
    'use strict';


    var tab_names = ['timeline', 'recommendations', 'favorites'];
    var active_tab = tab_names[0];


    $scope.tabs = {
        timeline: {
            items: [],
            page: 0,
            scroll: 0,
            is_downloading: false,
            all_loaded: false,
            no_timeline_events: null
        },
        recommendations: {
            items: [],
            card_items: [],
            page: 0,
            scroll: 0,
            is_downloading: false,
            all_loaded: false,
            no_timeline_events: null,
            removed_items: []
        },
        favorites: {
            items: [],
            page: 0,
            scroll: 0,
            is_downloading: false,
            all_loaded: false,
            no_timeline_events: null
        }
    };

    $scope.options = {
        minThrowOutDistance: 600,
        throwOutConfidence: function (offset, element) {
            var $$indicator = $$(element).find('.recommendation-indicator'),
                $$overlay = $$(element).find('.recommendation-card-overlay'),
                opacity = Math.abs(offset / (element.offsetWidth / 2)),
                border_color = '248, 41, 105,';
            if (offset > 5) {
                $$indicator.removeClass('dislike').addClass('like');
                border_color = '0, 220, 136,'
            } else if (offset < 5) {
                $$indicator.removeClass('like').addClass('dislike');
                border_color = '248, 41, 105,';
            } else {
                $$indicator.removeClass('dislike').removeClass('like');
            }
            $$indicator.css('border-color', 'rgba(' + border_color + ' ' + opacity.toFixed(2) + ')');
            $$indicator.find('.icon').css('opacity', opacity.toFixed(2));
            if (opacity > 0.6) opacity = 0.6;
            $$overlay.css('background-color', 'rgba(255,255,255, ' + opacity.toFixed(2) + ')');
            return Math.min(Math.abs(offset) / 100, 1);
        },
        isThrowOut: function (offset, element, throwOutConfidence) {
            console.log('isThrowOut', offset, element.offsetWidth, throwOutConfidence);
            return throwOutConfidence === 1;
        }
    };

    $scope.remove = function (index, eventObject, event) {
        $scope.tabs.recommendations.card_items.splice(0, 1);
        $scope.tabs.recommendations.card_items.push($scope.tabs.recommendations.items[0]);
        $scope.tabs.recommendations.items.splice(0, 1);
        $$(eventObject.target).remove();
        if (!$scope.$$phase) {
            $scope.$apply();
        } else {
            setTimeout(function () {
                if (!$scope.$$phase) {
                    $scope.$apply();
                }
            }, 500);
        }

        if ($scope.tabs.recommendations.items.length <= 5 && !$scope.tabs.recommendations.is_downloading) {
            $scope.getTimeline('recommendations', false);
        }
    };

    $scope.throwoutleft = function (eventName, eventObject, event) {
        event.toggleHidden();
    };

    $scope.throwoutright = function (eventName, eventObject, event) {
        event.toggleFavorite();
    };



    $scope.throwOutLeftBtn = function(){
        var $$el = $$('.stack .event-card:nth-child(1)');
        $$el.css('transform', '');
        $$el.addClass('throwout-left').addClass('dislike').addClass('dragging').addClass('hard-dislike');
        var event = angular.element($$el).scope().event;
        $scope.throwoutleft('', {}, event);
        setTimeout(function(){
            $scope.remove(0, $$el);
        }, 400);
    };

    $scope.throwOutRightBtn = function(){
        var $$el = $$('.stack .event-card:nth-child(1)');
        $$el.css('transform', '');
        $$el.addClass('throwout-right').addClass('like').addClass('dragging').addClass('hard-like');
        var event = angular.element($$el).scope().event;
        $scope.throwoutright('', {}, event);
        setTimeout(function(){
            $scope.remove(0, $$el);
        }, 400);
    };

    $scope.dragstart = function (eventName, eventObject) {
        $$(eventObject.target).addClass('dragging');
    };

    $scope.dragend = function (eventName, eventObject) {
        $$(eventObject.target).removeClass('dragging');
        $$(eventObject.target).find('.recommendation-indicator').removeClass('like').removeClass('dislike');
    };

    $scope.getTimeline = function (type, first_page, cb) {
        if ($scope.tabs[type].is_downloading) return;
        if ($scope.tabs[type].all_loaded && !first_page) return;
        if (first_page == true) {
            $scope.tabs[type].page = 0;
            $scope.tabs[type].all_loaded = false;
        }

        $scope.tabs[type].is_downloading = true;
        $scope.tabs[type].no_timeline_events = null;
        $scope.$apply();


        var fields_string = 'is_favorite,organization_short_name,favored_users_count,favored{length:5, fields:"is_friend,avatar_url", order_by:"-is_friend"},organization_logo_small_url,nearest_event_date,dates{length:500,fields:"end_time,start_time",},image_horizontal_medium_url,is_free,dates,min_price',
            data = [
                {type: type},
                {fields: fields_string + (type == 'timeline' ? ',actuality' : '')},
                {future: 'true'},
                {page: $scope.tabs[type].page++},
                {length: 10}
            ];

        if (type == 'timeline') {
            data.push({order_by: '-actuality'});
        } else if (type == 'recommendations') {
            data.push({order_by: '-rating'});
        } else {
            data.push({order_by: 'nearest_event_date'});
        }

        __api.events.get(data, function (data) {
            if (data.length == 0) {
                if (first_page) {
                    $scope.tabs[type].no_timeline_events = true;
                } else {
                    $scope.tabs[type].all_loaded = true;
                }
            }

            if (first_page) {
                $scope.tabs[type].items = [];
            }

            data.forEach(function (item) {
                try {
                    item.display_date = item.moment_dates_object[item.moment_nearest_event_date.format(CONTRACT.DATE_FORMAT)][0];
                } catch (e) {
                }

                if (type == 'recommendations') {
                    $scope.tabs[type].items.unshift(item);
                } else {
                    $scope.tabs[type].items.push(item);
                }
            });

            if (type == 'recommendations' && first_page) {
                $scope.tabs[type].card_items = $scope.tabs[type].items.slice(0, 4);
                $scope.tabs.recommendations.items.splice(0, 4);
            }


            $scope.tabs[type].is_downloading = false;
            fw7App.pullToRefreshDone($$('#feeds'));
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


    $scope.startBinding = function (cb) {
        $scope.getTimeline('timeline', true, function () {
            if (cb) {
                cb();
            }
            $scope.getTimeline('favorites', true, function () {
                $scope.getTimeline('recommendations', true);
            });
        });

        $$('#feeds').on('infinite', function () {
            var $$this = $$(this),
                $$tab = $$this.find('.tab.active');

            var name = $$tab.data('name');
            $scope.getTimeline(name, false)
        });

        $$('#feeds').on('refresh', function () {
            var $$this = $$(this),
                $$tab = $$this.find('.tab.active');
            var name = $$tab.data('name');
            if (name == 'recommendations'){
                fw7App.pullToRefreshDone($$('#feeds'));
                return;
            }
            $scope.getTimeline(name, true, function () {
                $scope.tabs[name].is_downloading = false;
                fw7App.pullToRefreshDone($$('#feeds'));
            });
        });
    };

    $scope.moveActiveBackground = function ($event) {
        var $$this = $$($event.target),
            $$feeds = $$('#feeds'),
            name = $$this.data('name');

        $scope.tabs[active_tab].scroll = $$feeds.scrollTop();

        if (active_tab == 'recommendations') {
            fw7App.destroyPullToRefresh($$('#feeds'));
        } else {
            fw7App.initPullToRefresh($$('#feeds'));
        }

        active_tab = name;
        $$('#view-events .tab-runner').css({
            width: $$this.width() + 'px',
            left: $$this.offset().left + 'px'
        });
    };


    $$('#timeline').on('show', function () {
        $$('#feeds').scrollTop($scope.tabs['timeline'].scroll, 0);
    });

    $$('#recommendations').on('show', function () {
        $$('#feeds').scrollTop($scope.tabs['recommendations'].scroll, 0);
    });

    $$('#favorites').on('show', function () {
        $$('#feeds').scrollTop($scope.tabs['favorites'].scroll, 0);
    });
};