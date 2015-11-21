/*jslint browser: true*/
/*global console, Dom7, $, angular, angularApp*/

MyApp.ns('MyApp.pages');

MyApp.pages.EventsInDayController = function ($scope, $element) {
	'use strict';

	var $$element = $$($element);

	$scope.day_events = [];
	$scope.date = null;

	function changeDate(direction){

		var $$loader = $$element.find('.calendar-loader').show();
		$scope.setEvents([]);
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
		$scope.$digest();
	};

	$scope.setDate = function(date){
		$scope.date = date;
		$scope.date_text = date.format('DD MMMM');
		$scope.$digest();
	};


	$$element.find('.left').on('click', function(){
		changeDate(-1);
	});


	$$element.find('.right').on('click', function(){
		changeDate(1);
	});
};