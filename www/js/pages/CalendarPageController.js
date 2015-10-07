/*jslint browser: true*/

/*jslint browser: true*/
/*global console, Dom7, $, angular, angularApp*/

MyApp.ns('MyApp.pages');

MyApp.pages.CalendarPageController = function ($scope, $http) {
	'use strict';

	$scope.year = 0;
	$scope.month = '';

	$scope.binded = false;

	function addClassesToDatesWithEvents(events){
		events.forEach(function(event){
			event.dates_range.forEach(function(date){
				var m_date = moment(date),
					year = m_date.format('YYYY'),
					month = m_date.format('M') - 1,
					day = m_date.format('D');
				$$('.picker-calendar-day[data-date="' + [year, month,day].join('-') + '"] .day-number')
					.addClass('with-events');;
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
			},
			onMonthYearChangeStart: function (p) {
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

				var $row = $$(dayContainer).parents('.picker-calendar-row'),
					already_selected_row = $row.hasClass('row-with-selected'),
					$month = $row.parents('.picker-calendar-month'),
					$all_rows = $month.find('.picker-calendar-row').removeClass('row-with-selected'),
					$events_wrapper = $$('#calendar-date-events-list'),
					$calendar_days_wrapper = $$('.picker-calendar-week-days'),
					lastY;
				$row.addClass('row-with-selected');

				__api.events.get([
					{date: moment([year, parseInt(month) + 1, day].join('-'), 'YYYY-M-D').format(CONTRACT.DATE_FORMAT)}
				], function(events){

					function updateEventsPosition(top){
						$events_wrapper.css('top', top + $month.offset().top + 'px');
					}

					$scope.day_events = events;
					$scope.$apply();

					$$('.picker-modal-inline, #calendar-date-events-list')
						.off('touchmove')
						.on('touchmove', function(e){
							//if ($$(e.target).is('#calendar-date-events-list')){
							//	if (window.screenY != 40) return false;
							//}
							var currentY = e.touches[0].clientY,
								rows_count = $all_rows.length;
							if(currentY > lastY){
								if (!already_selected_row){
									$all_rows.each(function(index, el){
										var $$row = $$(el),
											_top = $$row.height() * index,
											is_selected_row = $$row.hasClass('row-with-selected');
										$$row.addClass('collapsed').css({
											'background-color': '#fff',
											'z-index': index * (is_selected_row) ? 100 : 10,
											'position': 'absolute',
											'top': _top + 'px'
										}).data('max-top', $$row.height() * index).data('top', _top);
										$$row.css('top', 0);
									});
									$events_wrapper.css('top', $calendar_days_wrapper.offset().top + $calendar_days_wrapper.height() + $row.height() + 'px');
								}
								$all_rows.each(function(index, el){
									var $$row = $$(el),
										max_top = $$row.data('max-top'),
										new_top = $$row.data('top') + index * 15;
									if (new_top > max_top){
										new_top = max_top;
										$$row.removeClass('collapsed row-with-selected');
									}

									$$row
										.css('top', new_top + 'px')
										.data('top', new_top);

									if(rows_count - 1 == index){
										updateEventsPosition(new_top + $$row.height());
									}
								});
							}else if(currentY < lastY){
								console.log('SECOND');
								$all_rows.each(function(index, el){
									var $$row = $$(el),
										new_top = $$row.data('top') - index * 15;
									if (new_top < 0){
										new_top = 0;
										$$row.removeClass('collapsed');
									}
									$$row.css('top', new_top + 'px').data('top', new_top);
									if(rows_count - 1 == index){
										updateEventsPosition(new_top + $$row.height());
									}
								});
							}
							lastY = currentY;
							//e.preventDefault();
						});
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