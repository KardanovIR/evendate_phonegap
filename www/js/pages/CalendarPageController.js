MyApp.ns('MyApp.pages');

var IPHONE_4_HEIGHT = 480;

MyApp.pages.CalendarPageController = function ($scope) {
    'use strict';

    $scope.year = 0;
    $scope.month = '';
    $scope.timeline_days = [];
    $scope.selected_day = null;

    var loaded_months = {};

    $scope.loading_events = true;

    $scope.page_counter = 0;
    $scope.binded = false;

    $scope.events_text = '';
    $scope.date_text = '';
    $scope.is_downloading = false;
    $scope.first_page_downloaded = false;
    $scope.no_timeline_events = null;


    function addClassesToDatesWithEvents(dates) {
        dates.forEach(function (date) {
            var m_date = moment.unix(date.event_date),
                year = m_date.format('YYYY'),
                month = m_date.format('M') - 1,
                day = m_date.format('D'),
                $$day = $$('.d-' + [year, month, day].join('-'));

            $$day.each(function(){
                var $el = $$(this);
                if ($el.parents('.picker-calendar-day-prev,.picker-calendar-day-next').length > 0) return true;
                if (date.favorites_count > 0) {
                    $el.addClass('with-events with-favorites');
                    var add_class = '';
                    if (date.favorites_count > 2 && date.favorites_count <= 13) {
                        add_class = 'with-favorites-' + date.favorites_count;
                    }else if (date.favorites_count > 13){
                        add_class = 'with-favorites-16';
                    }
                    $el.addClass(add_class);
                }
            });

            $$day
                .data('favorites-count', date.favorites_count)
                .data('events-count', date.events_count);
            if ($$day.parents('.picker-calendar-day').hasClass('picker-calendar-day-selected')) {
                generateEventsText(date.events_count, date.favorites_count);
            }
        });
    }

    $scope.startBinding = function (callback) {
        $scope.binded = true;
        $$('.picker-calendar-month-current .picker-calendar-day-today').click();
        var since = $scope.year + '-' + ($scope.month - 1),
            till = $scope.year + '-' + ($scope.month + 1);
        getDates(since, till, function (dates) {
            if (callback) {
                callback(dates);
            }
        });
    };

    var generateEventsText = function (events_count, favorites_count) {
            if (events_count == undefined) return;
            var events_text = events_count + getUnitsText(events_count, CONTRACT.TEXTS.EVENTS);
            if (favorites_count) {
                events_text += ', ' + favorites_count + getUnitsText(favorites_count, CONTRACT.TEXTS.FAVORITES);
            }
            $scope.events_text = events_text;
        },
        getDates = function (since, till, callback) {
            __api.events.dates.get([
                {since: moment(since, 'YYYY-MM').startOf('month').format(CONTRACT.DATE_FORMAT)},
                {till: moment(till, 'YYYY-MM').endOf('month').format(CONTRACT.DATE_FORMAT)},
                {my: 'true'},
                {unique: 'true'},
                {fields: 'favored_count'},
                {length: 500}
            ], function (dates) {
                addClassesToDatesWithEvents(dates);
                if (callback) {
                    callback(dates);
                }
            });
        };

    $scope.showEventsInSelectedDay = function () {
        if ($scope.selected_day == null) return;
        fw7App.showIndicator();
        __api.events.get([
            {date: $scope.selected_day.format(CONTRACT.DATE_FORMAT)},
            {fields: 'dates{length:500,fields:"start_time,end_time"},image_square_vertical_url,is_favorite,is_same_time'},
            {length: 10},
            {order_by: '-is_favorite'},
            {my: true}
        ], function (data) {

            if (callbackObjects['eventsInDayPageBeforeAnimation']) {
                callbackObjects['eventsInDayPageBeforeAnimation'].remove();
            }
            callbackObjects['eventsInDayPageBeforeAnimation'] = fw7App.onPageBeforeAnimation('events_in_day', function (page) {
                var $$container = $$(page.container);
                if ($$container.data('opened') == true) {
                    var $scope = angular.element($$container[0]).scope();
                    $scope.setDate($scope.selected_day);
                    $scope.showPage();
                } else {
                    var rootElement = angular.element(document);
                    rootElement.ready(function () {
                        rootElement.injector().invoke(["$compile", function ($compile) {
                            var scope = angular.element(page.container).scope();
                            $compile(page.container)(scope);
                            var $scope = angular.element($$container[0]).scope();
                            $scope.setDate($scope.selected_day);
                            $scope.showPage();
                            $$container.data('opened', true);
                        }]);
                    });
                }
                fw7App.hideIndicator();
            });

            fw7App.getCurrentView().router.loadPage({
                url: 'pages/events_in_day.html',
                query: {id: event.id},
                pushState: true,
                animatePages: true
            });
        });

    };

    var monthNames = ['', 'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
        calendarInline = fw7App.calendar({
            monthNamesShort: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
            dayNames: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
            dayNamesShort: ['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ'],
            monthNames: monthNames,
            container: '#calendar-inline-container',
            weekHeader: true,
            monthPicker: false,
            yearPicker: false,
            toolbarTemplate: '',
            onOpen: function (p) {
                $scope.year = p.currentYear;
                $scope.month = p.currentMonth + 1;
                $$('#view-calendar .left .link').on('click', function () {
                    calendarInline.prevMonth();
                });
                $$('#view-calendar .right .link').on('click', function () {
                    calendarInline.nextMonth();
                });
                $$('.picker-calendar-day-selected').removeClass('picker-calendar-day-selected');
            },
            onMonthYearChangeEnd: function (calendar, year, month, dir) {
                $scope.year = calendar.currentYear;
                $scope.month = calendar.currentMonth + 1;
                var _month = calendar.currentMonth + (dir == 'next' ? 2 : 0);
                _month = _month == 0 ? 12 : _month;
                $scope.$digest();
                if ($scope.binded) {
                    __api.events.dates.get([
                        {since: moment($scope.year + '-' + _month, 'YYYY-MM').startOf('month').format(CONTRACT.DATE_FORMAT)},
                        {till: moment($scope.year + '-' + _month, 'YYYY-MM').endOf('month').format(CONTRACT.DATE_FORMAT)},
                        {my: true},
                        {unique: true},
                        {length: 500}
                    ], addClassesToDatesWithEvents);
                }
            },
            onDayClick: function (p, dayContainer, year, month, day) {
                $scope.day_events = [];
                $scope.no_events = true;
                $scope.loading_events = true;
                $$('.calendar-loader').show();
                $scope.$apply(function () {

                    var _date = moment([year, parseInt(month) + 1, day].join('-'), 'YYYY-M-D'),
                        $$day = $$(dayContainer).find('span.day-number'),
                        events_count = $$day.data('events-count'),
                        favorites_count = $$day.data('favorites-count');
                    $scope.selected_day = _date;

                    __api.events.get([
                        {date: _date.format(CONTRACT.DATE_FORMAT)},
                        {my: true},
                        {fields: 'organization_logo_small_url,organization_short_name,dates{length:500,fields:"start_time,end_time"},image_horizontal_large_url,image_square_vertical_url,is_favorite,is_same_time,tags'},
                        {length: favorites_count > 10 ? favorites_count : 10},
                        {order_by: "-is_favorite"}
                    ], function (data) {
                        generateEventsText(events_count, favorites_count);

                        $scope.date_text = _date.format('D MMMM');
                        var __today = moment();
                        if (__today.format(CONTRACT.DATE_FORMAT) == _date.format(CONTRACT.DATE_FORMAT)) {
                            $scope.date_text = 'Сегодня';
                        } else if (__today.add('days', 1).format(CONTRACT.DATE_FORMAT) == _date.format(CONTRACT.DATE_FORMAT)) {
                            $scope.date_text = 'Завтра';
                        }

                        var formatted_date = _date.format(CONTRACT.DATE_FORMAT);
                        data.forEach(function (item) {
                            item.moment_dates.forEach(function (m_date) {
                                if (m_date.start_date.format(CONTRACT.DATE_FORMAT) == formatted_date) {
                                    item.display_time = {
                                        start: m_date.start_date.format('HH:ss'),
                                        end: m_date.end_date.format('HH:ss')
                                    }
                                }
                            })
                        });

                        $$('.calendar-loader').hide();

                        $scope.loading_events = false;
                        if (window.innerHeight == IPHONE_4_HEIGHT) {
                            $scope.day_events = [];
                        } else {
                            $scope.day_events = data;
                        }

                        $scope.no_events = events_count != 0;
                        $scope.$apply();
                    });
                });
            }
        });

    $scope.$watch('year', function (val) {
        $$('.calendar-head-year').text(val);
    });

    $scope.$watch('month', function (val) {
        $scope.month_name = monthNames[val];
    });


};