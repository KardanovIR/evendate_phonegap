/*jslint browser: true*/

/*jslint browser: true*/
/*global console, Dom7, $, angular, angularApp*/

MyApp.ns('MyApp.pages');

var IPHONE_4_HEIGHT = 480;

MyApp.pages.CalendarPageController = function ($scope, $http) {
	'use strict';

	var events_by_days = {},
		is_downloading = false;


	$scope.year = 0;
	$scope.month = '';
	$scope.timeline_days = [];
	$scope.selected_day = null;

	$scope.page_counter = 0;
	$scope.binded = false;

	$scope.events_text = '';
	$scope.date_text = '';

	$scope.getMyTimeline = function(first_page){
		if (is_downloading) return;
		if (first_page == true){
			$scope.page_counter = 0;
			$$('.profile-page-content').on('infinite', function (){
				$scope.getMyTimeline(false);
			});
		}

		is_downloading = true;

		__api.events.get([
			{timeline: true},
			{type: 'future'},
			{page: $scope.page_counter++},
			{length: 10}
		], function(data){
			var today_timestamp = new Date(moment().format('YYYY/MM/DD 00:00:00')).getTime();


			data.forEach(function(item, index){
				item.moment_dates_range = [];
				item.dates_range.forEach(function(date){
					date = date.replace(/-/igm, '/');
					var m_date = new Date(date);
					if (m_date.getTime() >= today_timestamp){
						item.moment_dates_range.push(moment(m_date));
					}
				});
				data[index] = item;
			});

			events_by_days = first_page ? {} : events_by_days;

			var data_length = data.length;

			for (var i = 0; i < data_length; i++){
				var item = data[i];
				if (item.moment_dates_range.length == 0){
					continue;
				}
				var first_date = item.moment_dates_range[0].format('DD MMMM');
				if (!events_by_days.hasOwnProperty(first_date)){
					events_by_days[first_date] = {};
				}
				if (!events_by_days[first_date].hasOwnProperty('_' + item.id)){
					events_by_days[first_date]['_' + item.id] = item;
				}
				data[i] = item;
			}

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
			$scope.$apply();
			is_downloading = false;
		});
	};

	function addClassesToDatesWithEvents(events){
		events.forEach(function(event){
			event.dates_range.forEach(function(date){
				var m_date = moment(date),
					year = m_date.format('YYYY'),
					month = m_date.format('M') - 1,
					day = m_date.format('D'),
					$$day = $$('.d-' + [year, month,day].join('-'));

				if (event.is_favorite){
					$$day.addClass('with-events with-favorites');
				}
			});
		});
	}

	$scope.startBinding = function(){
		$scope.binded = true;
		__api.events.get([{
			since_date: moment($scope.year + '-' +$scope.month, 'YYYY-MM').startOf('month').format(CONTRACT.DATE_FORMAT)},
			{till_date: moment($scope.year + '-' +$scope.month, 'YYYY-MM').endOf('month').format(CONTRACT.DATE_FORMAT)},
			{type: 'short'},
			{page: 0},
			{length: 500}

		], function(events){
			$scope.$digest();
			addClassesToDatesWithEvents(events);
		});
	};

	$scope.showEventsInSelectedDay = function(){
		if ($scope.selected_day == null) return;
		fw7App.showIndicator();
		__api.events.get([
			{'date': $scope.selected_day.format(CONTRACT.DATE_FORMAT)},
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

	var monthNames = ['', 'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
		calendarInline = fw7App.calendar({
			monthNamesShort: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
			dayNames: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
			dayNamesShort: ['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ'],
			monthNames: monthNames,
			container: '#calendar-inline-container',
			value: [new Date()],
			weekHeader: true,
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

				if ($scope.binded){
					__api.events.get([
						{since_date: moment($scope.year + '-' + ($scope.month), 'YYYY-MM').startOf('month').format(CONTRACT.DATE_FORMAT)},
						{till_date: moment($scope.year + '-' + ($scope.month), 'YYYY-MM').endOf('month').format(CONTRACT.DATE_FORMAT)},
						{type: 'favorites'},
						{page: 0},
						{length: 500}
					], addClassesToDatesWithEvents);
				}
			},
			onDayClick: function(p, dayContainer, year, month, day){
				var _date = moment([year, parseInt(month) + 1, day].join('-'), 'YYYY-M-D');
				$scope.selected_day = _date;
				if (window.innerHeight == IPHONE_4_HEIGHT){
					$$('.calendar-loader').show();

					__api.events.get([
							{date: _date.format(CONTRACT.DATE_FORMAT)},
							{type: 'short'},
							{my: true}
						], function(data){
						var events_count = 0,
							favorites_count = 0;

						data.forEach(function(event){
							events_count++;
							if (event.is_favorite){
								favorites_count++;
							}
						});

						$scope.events_text = events_count + getUnitsText(events_count, CONTRACT.TEXTS.EVENTS);
						if (favorites_count){
							$scope.events_text += ', ' + favorites_count + getUnitsText(favorites_count, CONTRACT.TEXTS.FAVORITES);
						}

						$scope.date_text = _date.format('DD MMMM');
						$scope.$apply();

						$$('.calendar-loader').hide();
					});
				}else{
					$$('.calendar-loader').show();
					$$('.calendar-list').hide();
					__api.events.get([
						{date: _date.format(CONTRACT.DATE_FORMAT)},
						{my: true}
					], function(events){
						$$('.calendar-loader').hide();
						$$('.calendar-list').show();
						$scope.day_events = events;
						$scope.$apply();
					});
				}
			}
		});


	$scope.$watch('year', function(val){
		$$('.calendar-head-year').text(val);
	});

	$scope.$watch('month', function(val){
		$$('.calendar-custom-toolbar .center').text(monthNames[val]);
	});
};