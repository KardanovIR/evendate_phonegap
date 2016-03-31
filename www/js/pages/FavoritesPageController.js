/*jslint browser: true*/

/*jslint browser: true*/
/*global console, Dom7, $, angular, angularApp*/

MyApp.ns('MyApp.pages');

MyApp.pages.FavoritesPageController = function ($scope) {
	'use strict';

	var events_by_days = {},
		is_refreshing,
		no_more_favorites = false;

	$scope.no_events = false;
	$scope.favorites_days = [];

	$scope.page_counter = 0;

	$scope.startBinding = function(){
		$scope.getMyFavorites(true);
	};

	var $$pull_to_refresh = $$('.favorites-page-content');

	$$pull_to_refresh.on('refresh', function(){
		if (is_refreshing) return true;
		$scope.getMyFavorites(true, function(){
			fw7App.pullToRefreshDone();
			is_refreshing = false;
		});
	});

	$scope.getMyFavorites = function(first_page, cb){
		if (first_page == true){
			$scope.page_counter = 0;
			$$('.favorites-page-content').on('infinite', function (){
				$scope.getMyFavorites(false);
			});
			no_more_favorites = false;
		}else{
			if (no_more_favorites) return;
		}
		__api.events.get([
			{favorites: true},
			{fields: 'dates{fields:"start_time,end_time"},organization_short_name,image_vertical_medium_url'},
			{type: 'future'},
			{offset: 10 * $scope.page_counter++},
			{length: 10}
		], function(data){
			if (data.length == 0 && first_page == false){
				no_more_favorites = true;
			}
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