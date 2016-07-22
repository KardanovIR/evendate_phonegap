MyApp.ns('MyApp.pages');

MyApp.pages.FeedsPageController = function ($scope) {
    'use strict';


    var $$my_timeline = $$('.my-timeline');
    var tab_names = ['timeline', 'recommendations', 'favorites'];
    var active_tab = tab_names[0];
    var callback;


    $scope.tabs = {
        timeline: {
            items: [],
            events_by_days: {},
            page: 0,
            is_downloading: false,
            no_timeline_events: null
        },
        recommendations: {
            items: [],
            events_by_days: {},
            page: 0,
            is_downloading: false,
            no_timeline_events: null
        },
        favorites: {
            items: [],
            events_by_days: {},
            page: 0,
            is_downloading: false,
            no_timeline_events: null
        }
    };

    $$('.my-timeline').on('infinite', function () {
        if ($scope.tabs[active_tab].is_downloading) return;
        $scope.getTimeline(active_tab, false);
    });

    $scope.changeTab = function (type) {
        active_tab = type;
        $scope.getTimeline(type);
    };

    $scope.getTimeline = function (type, first_page, cb) {
        if ($scope.tabs[type].is_downloading) return;
        if (first_page == true) {
            $scope.tabs[type].page = 0;
        }

        $scope.tabs[type].is_downloading = true;
        $scope.tabs[type].no_timeline_events = null;


        var data = [
            {type: type},
            {fields: 'is_favorite,nearest_event_date,image_square_vertical_url,dates'},
            {order_by: "nearest_event_date,-is_favorite"},
            {future: 'true'},
            {offset: 10 * $scope.tabs[type].page++},
            {length: 10}
        ];

        __api.events.get(data, function (data) {
            if (callback){
                callback();
            }
            if (data.length == 0 && first_page) {
                $scope.tabs[type].no_timeline_events = true;
            }
            if (first_page) {
                $scope.tabs[type].first_page_downloaded = true;
                $scope.tabs[type].items = [];
            }

            $scope.tabs[type].events_by_days = first_page ? {} : $scope.tabs[type].events_by_days;

            data.forEach(function (item) {
                var first_date = moment.unix(item.nearest_event_date).format('DD MMMM');

                item.dates.forEach(function (date) {
                    if (date.event_date == item.nearest_event_date) {
                        item.display_time = {
                            start: moment(date.start_time, 'HH:mm:ss').format('HH:mm'),
                            end: moment(date.end_time, 'HH:mm:ss').format('HH:mm')
                        }
                    }
                });


                if (!$scope.tabs[type].events_by_days.hasOwnProperty(first_date)) {
                    $scope.tabs[type].events_by_days[first_date] = {};
                }
                if (!$scope.tabs[type].events_by_days[first_date].hasOwnProperty('_' + item.id)) {
                    $scope.tabs[type].events_by_days[first_date]['_' + item.id] = item;
                }
            });


            for (var day in $scope.tabs[type].events_by_days) {
                if ($scope.tabs[type].events_by_days.hasOwnProperty(day)) {
                    var _events_array = [];
                    for (var event_key in $scope.tabs[type].events_by_days[day]) {
                        if ($scope.tabs[type].events_by_days[day].hasOwnProperty(event_key)) {
                            _events_array.push($scope.tabs[type].events_by_days[day][event_key]);
                        }
                    }
                    $scope.tabs[type].items.push({
                        name: day,
                        events: _events_array
                    });
                }
            }

            $scope.tabs[type].is_downloading = false;
            $scope.$apply(function(){
                if (cb) {
                    cb();
                }
            });

        });


    };

    $$my_timeline.on('refresh', function () {
        debugger;
        $scope.getTimeline(active_tab, true, function () {
            fw7App.pullToRefreshDone($$my_timeline);
        });
    });

    $scope.startBinding = function (callback) {
        $scope.changeTab('timeline');
    }

};