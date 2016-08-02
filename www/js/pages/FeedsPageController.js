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
            page: 0,
            scroll: 0,
            is_downloading: false,
            all_loaded: false,
            no_timeline_events: null
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


        var fields_string = 'is_favorite,organization_short_name,favored_users_count,favored{length:5, fields:"avatar_url"},organization_logo_small_url,nearest_event_date,dates{length:500,fields:"end_time,start_time",},image_horizontal_medium_url,is_free,dates,min_price',
            data = [
            {type: type},
            {fields: fields_string + (type == 'timeline' ? ',actuality' : '')},
            {order_by: (type == 'timeline' ? '-actuality' : 'nearest_event_date')},
            {future: 'true'},
            {page: $scope.tabs[type].page++},
            {length: 10}
        ];

        __api.events.get(data, function (data) {
            if (data.length == 0) {
                if (first_page){
                    $scope.tabs[type].no_timeline_events = true;
                }else{
                    $scope.tabs[type].all_loaded = true;
                }
            }

            if (first_page) {
                $scope.tabs[type].items = [];
            }

            data.forEach(function (item) {
                try{
                    item.display_date = item.moment_dates_object[item.moment_nearest_event_date.format(CONTRACT.DATE_FORMAT)][0];
                }catch(e){}

                $scope.tabs[type].items.push(item);
            });

            $scope.tabs[type].is_downloading = false;
            fw7App.pullToRefreshDone($$('#feeds'));
            if (cb) {
                cb();
            }
            if(!$scope.$$phase) {
                $scope.$apply();
            }else{
                setTimeout(function(){
                    if(!$scope.$$phase) {
                        $scope.$apply();
                    }
                }, 1000);
            }
        });


    };


    $scope.startBinding = function (cb) {
        $$('#timeline-tab-link').click();
        $scope.getTimeline('timeline', true, function(){
            if (cb) {
                cb();
            }
            $scope.getTimeline('favorites', true, function(){
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
            $scope.getTimeline(name, true, function(){
                $scope.tabs[name].is_downloading = false;
                fw7App.pullToRefreshDone($$('#feeds'));
            });
        });
    };

    $scope.moveActiveBackground = function($event){
        var $$this = $$($event.target),
            $$feeds = $$('#feeds'),
            name = $$this.data('name');

        $scope.tabs[active_tab].scroll = $$feeds.scrollTop();


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