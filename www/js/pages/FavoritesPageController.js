/*jslint browser: true*/

/*jslint browser: true*/
/*global console, Dom7, $, angular, angularApp*/

MyApp.ns('MyApp.pages');

MyApp.pages.FavoritesPageController = function ($scope) {
	'use strict';

	var events_by_days = {},
		is_refreshing,
		favorites = [];

	$scope.no_events = false;
	$scope.is_downloading = false;
	$scope.no_timeline_events = null;

	$scope.infinite_attached = false;
	$scope.favorites_days = [];

	$scope.page_counter = 0;

	$scope.startBinding = function(){
		if ($scope.loading) return;
		$scope.loading = true;
		$scope.getMyFavorites(true);
	};

	var $$pull_to_refresh = $$('.favorites-page-content');

	$$pull_to_refresh.on('refresh', function(){
		if (is_refreshing) return true;
		$scope.loading = true;
		$scope.getMyFavorites(true, function(){
			fw7App.pullToRefreshDone();
			is_refreshing = false;
		});
	});

	$scope.getMyFavorites = function(first_page, cb){
		if ($scope.is_downloading) return;
		if (first_page == true){
			$scope.page_counter = 0;
		}
		$scope.is_downloading = true;
		$scope.$apply();

		__api.events.get([
			{favorites: true},
			{fields: 'nearest_event_date,organization_logo_small_url,dates{fields:"start_time,end_time",length:500},organization_short_name,image_vertical_medium_url,is_favorite'},
			{future: true},
			{order_by: 'nearest_event_date'},
			{offset: 10 * $scope.page_counter++},
			{length: 10}
		], function(data){
			if (data.length == 0 && first_page){
				$scope.no_timeline_events = true;
			}
			if (first_page){
				$scope.first_page_downloaded = true;
			}
			$scope.$apply();

			events_by_days = first_page ? {} : events_by_days;

			data.forEach(function(item){
				var first_date = moment.unix(item.nearest_event_date).format('DD MMMM');

				item.dates.forEach(function(date){
					if (date.event_date == item.nearest_event_date){
						item.display_time = {
							start:  moment(date.start_time, 'HH:mm:ss').format('HH:mm'),
							end: moment(date.end_time, 'HH:mm:ss').format('HH:mm')
						}
					}
				});


				if (!events_by_days.hasOwnProperty(first_date)){
					events_by_days[first_date] = {};
				}
				if (!events_by_days[first_date].hasOwnProperty('_' + item.id)){
					events_by_days[first_date]['_' + item.id] = item;
				}
			});

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

			$scope.is_downloading = false;
			$scope.$apply();
			if (cb){
				cb();
			}
		});
	};

	$$('.favorites-page-content').on('infinite', function (){
		if ($scope.is_downloading) return;
		$scope.getMyFavorites(false);
	});
};