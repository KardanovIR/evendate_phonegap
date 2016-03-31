/*jslint browser: true*/

/*jslint browser: true*/
/*global console, Dom7, $, angular, angularApp*/

MyApp.ns('MyApp.pages');

MyApp.pages.FavoritesPageController = function ($scope) {
	'use strict';

	var events_by_days = {};

	$scope.no_events = false;
	$scope.favorites_days = [];

	$scope.page_counter = 0;

	$scope.startBinding = function(){
		$scope.getMyFavorites(true);
	};

	var $$pull_to_refresh = $$('.favorites-page-content');

	$$pull_to_refresh.on('refresh', function(){
		$scope.getMyFavorites(true, function(){
			fw7App.pullToRefreshDone();
		});
	});

	$scope.getMyFavorites = function(first_page, cb){
		if (first_page == true){
			$scope.page_counter = 0;
			$$('.favorites-page-content').on('infinite', function (){
				$scope.getMyFavorites(false);
			});
		}
		__api.events.get([
			{favorites: true},
			{fields: 'dates{fields:"start_time,end_time"},organization_short_name,image_vertical_medium_url'},
			{type: 'future'},
			{offset: 10 * $scope.page_counter++},
			{length: 10}
		], function(data){

			events_by_days = first_page ? {} : events_by_days;
			var data_length = data.length;

			for (var i = 0; i < data_length; i++){
				var item = data[i];
				if (item.future_moment_dates.length == 0){
					continue;
				}
				var first_date = item.future_moment_dates[0].start_date.format('DD MMMM');
				if (!events_by_days.hasOwnProperty(first_date)){
					events_by_days[first_date] = {};
				}
				if (!events_by_days[first_date].hasOwnProperty('_' + item.id)){
					events_by_days[first_date]['_' + item.id] = item;
				}
				data[i] = item;
			}

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

			$scope.no_events = $scope.favorites_days.length != 0;

			$scope.$apply();

			if (cb){
				cb();
			}
		});
	};
};