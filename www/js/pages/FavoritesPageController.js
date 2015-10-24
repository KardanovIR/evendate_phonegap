/*jslint browser: true*/

/*jslint browser: true*/
/*global console, Dom7, $, angular, angularApp*/

MyApp.ns('MyApp.pages');

MyApp.pages.FavoritesPageController = function ($scope, $http) {
	'use strict';

	var events_by_days = {};

	$scope.favorites_days = [];

	$scope.page_counter = 0;

	$scope.startBinding = function(){
		$scope.getMyFavorites(true);
	};

	$scope.getMyFavorites = function(first_page){


		if (first_page == true){
			$scope.page_counter = 0;
			$$('.favorites-page-content').on('infinite', function (){
				$scope.getMyFavorites(false);
			});
		}
		__api.events.get([
			{favorites: true},
			{type: 'future'},
			{page: $scope.page_counter++},
			{length: 10}
		], function(data){
			var today_timestamp = new Date(moment().format('YYYY-MM-DD 00:00:00')),
				moment_today = moment(today_timestamp);

			data.forEach(function(item){
				item.moment_dates_range = [];
				item.dates_range.forEach(function(date){
					var m_date = moment(date);
					if (m_date.unix() >= moment_today.unix()){
						item.moment_dates_range.push(m_date);
					}
				});
			});


			events_by_days = first_page ? {} : events_by_days;
			data.forEach(function(item){
				var first_date = item.moment_dates_range[0].format('DD MMMM');
				if (!events_by_days.hasOwnProperty(first_date)){
					events_by_days[first_date] = {};
				}
				if (!events_by_days[first_date].hasOwnProperty('_' + item.id)){
					events_by_days[first_date]['_' + item.id] = item;
				}
			});

			$scope.favorites_days = [];

			for(var day in events_by_days){
				if (events_by_days.hasOwnProperty(day)){
					var _events_array = [];
					for (var event_key in events_by_days[day]){
						if (events_by_days[day].hasOwnProperty(event_key)){
							_events_array.push(events_by_days[day][event_key]);
						}
					}
					$scope.favorites_days.push({
						name: day,
						events: _events_array
					});
				}
			}


			$scope.$apply();
		});
	};
};