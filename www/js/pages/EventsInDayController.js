/*jslint browser: true*/
/*global console, Dom7, $, angular, angularApp*/

MyApp.ns('MyApp.pages');

MyApp.pages.EventsInDayController = function ($scope, $element) {
	'use strict';

	var $$element = $$($element);

	$scope.day_events = [];
	$scope.date = null;
	$scope.no_events = false;

	function changeDate(direction){
		$scope.no_events = true;
		$scope.$apply();

		var $$loader = $$element.find('.calendar-loader').show();
		$scope.day_events = [];
		$scope.setDate($scope.date.add(direction, 'days'));
		__api.events.get([
			{'date': $scope.date.format(CONTRACT.DATE_FORMAT)},
			{my: true}
		], function(data){
			$$loader.hide();
			$scope.setEvents(data);
		});
	}

	$scope.setEvents = function(data){

		$scope.day_events = data;
		$scope.no_events = data.length != 0;
		$scope.$digest();
	};

	$scope.setDate = function(date){
		$scope.date = date;
		$scope.date_text = date.format('DD MMMM');

		var __today = moment();
		if (__today.format(CONTRACT.DATE_FORMAT) == date.format(CONTRACT.DATE_FORMAT)){
			$scope.date_text = 'Сегодня';
		}else if (__today.add('days', 1).format(CONTRACT.DATE_FORMAT) == date.format(CONTRACT.DATE_FORMAT)){
			$scope.date_text = 'Завтра';
		}
		$scope.$digest();
	};


	$$element.find('.left').on('click', function(){
		changeDate(-1);
	});


	$$element.find('.right').on('click', function(){
		changeDate(1);
	});
};