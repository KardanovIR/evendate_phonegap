/*jslint browser: true*/
/*global console*/

var myapp = myapp || {};
myapp.pages = myapp.pages || {};


myapp.pages.ProfilePageController = function (myapp, $$) {
	'use strict';

	var monthNames = ['������', '�������', '����', '������', '���', '����', '����', '������', '��������', '�������', '������', '�������'],
		calendarInline = myapp.calendar({
			monthNamesShort: ['���', '���', '���', '���', '���', '���', '���', '���', '���', '���', '���', '���'],
			dayNames: ['�����������', '�����������', '�������', '�����', '�������', '�������', '�������'],
			dayNamesShort: ['��', '��', '��', '��', '��', '��', '��'],
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
				myapp.alert(day);
			}
		});
};