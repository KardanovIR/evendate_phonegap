/*jslint browser: true*/

/*jslint browser: true*/
/*global console, Dom7, $, angular, angularApp*/

MyApp.ns('MyApp.pages');

MyApp.pages.CalendarPageController = function ($scope, $http) {
	'use strict';

	var events_by_days = {},
		is_downloading = false;

	$scope.year = 0;
	$scope.month = '';
	$scope.timeline_days = [];

	$scope.page_counter = 0;
	$scope.binded = false;

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
				if (event.is_favorite){
					var m_date = moment(date),
						year = m_date.format('YYYY'),
						month = m_date.format('M') - 1,
						day = m_date.format('D'),
						$$day = $$('.d-' + [year, month,day].join('-'));
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
			{type: 'favorites'},
			{page: 0},
			{length: 500}

		], function(events){
			$scope.$digest();
			addClassesToDatesWithEvents(events);
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
					__api.events.get([{
						since_date: moment($scope.year + '-' + ($scope.month), 'YYYY-MM').startOf('month').format(CONTRACT.DATE_FORMAT)},
						{till_date: moment($scope.year + '-' + ($scope.month), 'YYYY-MM').endOf('month').format(CONTRACT.DATE_FORMAT)},
						{type: 'short'},
						{page: 0},
						{length: 500}
					], addClassesToDatesWithEvents);
				}
			},
			onDayClick: function(p, dayContainer, year, month, day){
				$$('.calendar-loader').show();
				$$('.calendar-list').hide();
				__api.events.get([
					{date: moment([year, parseInt(month) + 1, day].join('-'), 'YYYY-M-D').format(CONTRACT.DATE_FORMAT)},
					{my: true}
				], function(events){
					$$('.calendar-loader').hide();
					$$('.calendar-list').show();
					$scope.day_events = events;
					$scope.$apply();
				});
			}
		});


	$scope.$watch('year', function(val){
		$$('.calendar-head-year').text(val);
	});

	$scope.$watch('month', function(val){
		$$('.calendar-custom-toolbar .center').text(monthNames[val]);
	});
};