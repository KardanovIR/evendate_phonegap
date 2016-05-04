/*jslint browser: true*/

/*jslint browser: true*/
/*global console, Dom7, $, angular, angularApp*/

MyApp.ns('MyApp.pages');

var IPHONE_4_HEIGHT = 480;

MyApp.pages.CalendarPageController = function ($scope) {
	'use strict';

	var events_by_days = {};


	$scope.year = 0;
	$scope.month = '';
	$scope.timeline_days = [];
	$scope.selected_day = null;

	$scope.loading_events = true;

	$scope.page_counter = 0;
	$scope.binded = false;

	$scope.events_text = '';
	$scope.date_text = '';
	$scope.is_downloading = false;
	$scope.first_page_downloaded = false;
	$scope.no_timeline_events = null;


	var $$my_timeline = $$('.my-timeline');

	$$my_timeline.on('refresh', function(){
		$scope.getMyTimeline(true, function(){
			fw7App.pullToRefreshDone($$my_timeline);
		});
	});

	$scope.getMyTimeline = function(first_page, cb){

		if (first_page == 'BUTTON') return;
		if ($scope.is_downloading) return;
		if (first_page == true){
			$scope.page_counter = 0;
			$scope.first_page_downloaded = false;
		}

		$scope.is_downloading = true;
		$scope.no_timeline_events = null;

		$scope.$apply();

		__api.events.get([
			{timeline: true},
			{fields: 'is_favorite,nearest_event_date,image_square_vertical_url,dates'},
			{order_by: "nearest_event_date,-is_favorite"},
			{future: 'true'},
			{offset: 10 * $scope.page_counter++},
			{length: 10}
		], function(data){
			if (data.length == 0 && first_page){
				$scope.no_timeline_events = true;
			}
			if (first_page){
				$scope.first_page_downloaded = true;
			}
			$scope.$apply();

			events_by_days = first_page ? {} : events_by_days;

			data.forEach(function(item){
				var first_date = moment.unix(item.nearest_event_date).format('DD MMMM');

				item.dates.forEach(function(date){
					if (date.event_date == item.nearest_event_date){
						item.display_time = {
							start:  moment(date.start_time, 'HH:mm:ss').format('HH:mm'),
							end: moment(date.end_time, 'HH:mm:ss').format('HH:mm')
						}
					}
				});


				if (!events_by_days.hasOwnProperty(first_date)){
					events_by_days[first_date] = {};
				}
				if (!events_by_days[first_date].hasOwnProperty('_' + item.id)){
					events_by_days[first_date]['_' + item.id] = item;
				}
			});

			$scope.timeline_days = [];

			for(var day in events_by_days){
				if (events_by_days.hasOwnProperty(day)){
					var _events_array = [];
					for (var event_key in events_by_days[day]){
						if (events_by_days[day].hasOwnProperty(event_key)){
							_events_array.push(events_by_days[day][event_key]);
						}
					}
					$scope.timeline_days.push({
						name: day,
						events: _events_array
					});
				}
			}

			$scope.is_downloading = false;
			$scope.$apply();
			if (cb){
				cb();
			}
		});
	};

	function addClassesToDatesWithEvents(dates){
		dates.forEach(function(date){
			var m_date = moment.unix(date.event_date),
				year = m_date.format('YYYY'),
				month = m_date.format('M') - 1,
				day = m_date.format('D'),
				$$day = $$('.d-' + [year, month,day].join('-'));

			if (date.favorites_count > 0){
				$$day
					.addClass('with-events with-favorites');
			}
			$$day
				.data('favorites-count', date.favorites_count)
				.data('events-count', date.events_count);
			if ($$day.parents('.picker-calendar-day').hasClass('picker-calendar-day-selected')){
				$scope.generateEventsText(date.events_count, date.favorites_count);
			}
		});

		$$('.statusbar-overlay').on('click', function(){
			L.log('STATUS');
		});
	}

	$scope.startBinding = function(){
		$$('.picker-calendar-month-current .picker-calendar-day-today').click();
		$scope.binded = true;
		__api.events.dates.get([{
			since: moment($scope.year + '-' + $scope.month, 'YYYY-MM').startOf('month').format(CONTRACT.DATE_FORMAT)},
			{till: moment($scope.year + '-' + $scope.month, 'YYYY-MM').endOf('month').format(CONTRACT.DATE_FORMAT)},
			{my: 'true'},
			{unique: 'true'},
			{fields: 'favored_count'},
			{length: 500}

		], addClassesToDatesWithEvents);
	};

	$scope.generateEventsText = function(events_count, favorites_count){
		if (events_count == undefined) return;
		var events_text = events_count + getUnitsText(events_count, CONTRACT.TEXTS.EVENTS);
		if (favorites_count){
			events_text += ', ' + favorites_count + getUnitsText(favorites_count, CONTRACT.TEXTS.FAVORITES);
		}
		$scope.events_text = events_text;
		$scope.$apply()
	};

	$scope.showEventsInSelectedDay = function(){
		if ($scope.selected_day == null) return;
		fw7App.showIndicator();
		__api.events.get([
			{date: $scope.selected_day.format(CONTRACT.DATE_FORMAT)},
			{fields: 'dates{length:500,fields:"start_time,end_time"},image_square_vertical_url,is_favorite,is_same_time'},
			{length: 10},
			{order_by: '-is_favorite'},
			{my: true}
		], function(data){

			if (callbackObjects['eventsInDayPageBeforeAnimation']){
				callbackObjects['eventsInDayPageBeforeAnimation'].remove();
			}
			callbackObjects['eventsInDayPageBeforeAnimation'] = fw7App.onPageBeforeAnimation('events_in_day', function(page){
				var $$container = $$(page.container);
				if ($$container.data('opened') == true){
					var $scope = angular.element($$container[0]).scope();
					$scope.setDate($scope.selected_day);
					$scope.setEvents(data);
				}else{
					var rootElement = angular.element(document);
					rootElement.ready(function(){
						rootElement.injector().invoke([ "$compile", function($compile) {
							var scope = angular.element(page.container).scope();
							$compile(page.container)(scope);
							var $scope = angular.element($$container[0]).scope();
							$scope.setDate($scope.selected_day);
							$scope.setEvents(data);
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

	function initTapHoldAndDblClick(){

		function openPage(){
			debugger;
			var _date = moment([year, parseInt(month) + 1, day].join('-'), 'YYYY-M-D')
		}

		$$('.picker-calendar-month-current .picker-calendar-day')
			.off('taphold')
			.off('dblclick')
			.on('dblclick', openPage)
			.on('taphold', openPage);
	}

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
			toolbarTemplate:
			'<div class="calendar-head-year"></div>' +
			'<div class="toolbar calendar-custom-toolbar">' +
				'<div class="toolbar-inner">' +
					'<div class="left">' +
						'<a href="#" class="link icon-only calendar"><i class="ion-ios-arrow-thin-left"></i></a>' +
					'</div>' +
					'<div class="center calendar-month-name"></div>' +
					'<div class="right">' +
						'<a href="#" class="link icon-only calendar"><i class="ion-ios-arrow-thin-right"></i></a>' +
					'</div>' +
				'</div>' +
			'</div>',
			onOpen: function(p){
				$scope.year = p.currentYear;
				$scope.month = p.currentMonth + 1;
				$$('.calendar-custom-toolbar .left .link').on('click', function () {
					calendarInline.prevMonth();
				});
				$$('.calendar-custom-toolbar .right .link').on('click', function () {
					calendarInline.nextMonth();
				});
				$$('.picker-calendar-day-selected').removeClass('picker-calendar-day-selected');
			},
			onMonthYearChangeEnd: function (p) {
				$scope.year = p.currentYear;
				$scope.month = p.currentMonth + 1;
				$scope.$digest();

				initTapHoldAndDblClick();
				if ($scope.binded){
					__api.events.dates.get([
						{since: moment($scope.year + '-' + ($scope.month), 'YYYY-MM').startOf('month').format(CONTRACT.DATE_FORMAT)},
						{till: moment($scope.year + '-' + ($scope.month), 'YYYY-MM').endOf('month').format(CONTRACT.DATE_FORMAT)},
						{my: true},
						{unique: true},
						{length: 500}
					], addClassesToDatesWithEvents);
				}
			},
			onDayClick: function (p, dayContainer, year, month, day){
				$scope.day_events = [];
				$scope.no_events = true;
				$scope.loading_events = true;
				$$('.calendar-loader').show();
				$scope.$apply();
				var _date = moment([year, parseInt(month) + 1, day].join('-'), 'YYYY-M-D'),
					$$day = $$(dayContainer).find('span.day-number'),
					events_count = $$day.data('events-count'),
					favorites_count =  $$day.data('favorites-count');
				$scope.selected_day = _date;

				__api.events.get([
					{date: _date.format(CONTRACT.DATE_FORMAT)},
					{my: true},
					{fields: 'dates{length:500,fields:"start_time,end_time"},image_square_vertical_url,is_favorite,is_same_time,tags'},
					{length: favorites_count > 10 ? favorites_count : 10},
					{order_by: "-is_favorite"}
				], function(data){

					$scope.generateEventsText(events_count, favorites_count);


					$scope.date_text = _date.format('D MMMM');
					var __today = moment();
					if (__today.format(CONTRACT.DATE_FORMAT) == _date.format(CONTRACT.DATE_FORMAT)){
						$scope.date_text = 'Сегодня';
					}else if (__today.add('days', 1).format(CONTRACT.DATE_FORMAT) == _date.format(CONTRACT.DATE_FORMAT)){
						$scope.date_text = 'Завтра';
					}
					
					data.forEach(function(item){
						item.moment_dates.forEach(function(m_date){
							if (m_date.start_date.format(CONTRACT.DATE_FORMAT) == _date.format(CONTRACT.DATE_FORMAT)){
								item.display_time = {
									start:  m_date.start_date.format('HH:ss'),
									end:  m_date.end_date.format('HH:ss') 
								}
							}
						})
					});

					$$('.calendar-loader').hide();


					$scope.loading_events = false;
					if (window.innerHeight == IPHONE_4_HEIGHT){
						$scope.day_events = [];
					}else{
						$scope.day_events = data;
					}

					$scope.no_events = events_count != 0;
					$scope.$apply();
				});


			}
		});

	initTapHoldAndDblClick();
	$scope.$watch('year', function(val){
		$$('.calendar-head-year').text(val);
	});

	$scope.$watch('month', function(val){
		$$('.calendar-custom-toolbar .center').text(monthNames[val]);
	});


	$$('.my-timeline').on('infinite', function (){
		if ($scope.is_downloading) return;
		$scope.getMyTimeline(false);
	});
};