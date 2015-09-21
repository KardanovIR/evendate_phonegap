/*jslint browser: true*/

/*jslint browser: true*/
/*global console, Dom7, $, angular, angularApp*/

MyApp.ns('MyApp.pages');

MyApp.pages.CalendarPageController = function ($scope, $http) {
	'use strict';

	var monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
		calendarInline = fw7App.calendar({
			monthNamesShort: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
			dayNames: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
			dayNamesShort: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
			monthNames: monthNames,
			container: '#calendar-inline-container',
			value: [new Date()],
			weekHeader: true,
			toolbarTemplate:
			'<div class="toolbar calendar-custom-toolbar">' +
			'<div class="toolbar-inner">' +
			'<div class="left">' +
			'<a href="#" class="link icon-only"><i class="icon icon-back"></i></a>' +
			'</div>' +
			'<div class="center"></div>' +
			'<div class="right">' +
			'<a href="#" class="link icon-only"><i class="icon icon-forward"></i></a>' +
			'</div>' +
			'</div>' +
			'</div>',
			onOpen: function (p) {
				$$('.calendar-custom-toolbar .center').text(monthNames[p.currentMonth] +', ' + p.currentYear);
				$$('.calendar-custom-toolbar .left .link').on('click', function () {
					calendarInline.prevMonth();
				});
				$$('.calendar-custom-toolbar .right .link').on('click', function () {
					calendarInline.nextMonth();
				});
			},
			onMonthYearChangeStart: function (p) {
				$$('.calendar-custom-toolbar .center').text(monthNames[p.currentMonth] +', ' + p.currentYear);
			},
			onDayClick: function(p, dayContainer, year, month, day){
				fw7App.alert(day);
			}
		});
};