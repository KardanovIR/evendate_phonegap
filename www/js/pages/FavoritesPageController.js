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
		L.log('FAVORITES_START_BINDING');
		$scope.getMyFavorites(true);
	};

	var $$pull_to_refresh = $$('.favorites-page-content');

	$$pull_to_refresh.on('refresh', function(){
		$scope.getMyFavorites(true, function(){
			fw7App.pullToRefreshDone();
		});
	});

	$scope.getMyFavorites = function(first_page, cb){
		L.log('FAVORITES_START');
		if (first_page == true){
			L.log('FAVORITES_FIRST_PAGE');
			$scope.page_counter = 0;
			$$('.favorites-page-content').on('infinite', function (){
				$scope.getMyFavorites(false);
			});
			L.log('FAVORITES_FIRST_DONE');
		}
		L.log('FAVORITES_GETTING');
		__api.events.get([
			{favorites: true},
			{type: 'future'},
			{page: $scope.page_counter++},
			{length: 10}
		], function(data){
			L.log('FAVORITES_GOT');
			var today_timestamp = new Date(moment().format('YYYY-MM-DD 00:00:00')),
				moment_today = moment(today_timestamp);
			L.log('FAVORITES_VARS_ENABLED');

			data.forEach(function(item){
				item.moment_dates_range = [];
				L.log('FAVORITES_dates_range');
				item.dates_range.forEach(function(date){
					var m_date = moment(date);
					L.log('FAVORITES_m_date');
					if (m_date.unix() >= moment_today.unix()){
						item.moment_dates_range.push(m_date);
						L.log('FAVORITES_push');
					}
				});
			});
			L.log('FAVORITES_DATES_DONE');

			events_by_days = first_page ? {} : events_by_days;
			L.log('FAVORITES_SECOND_LOOP');

			var data_length = data.length;

			L.log(data_length);
			L.log('FAVORITES_SECOND_70');
			for (var i = 0; i < data_length; i++){
				L.log('FAVORITES_SECOND_71');
				var item = data[i];
				L.log('FAVORITES_SECOND_72');
				L.log(item.moment_dates_range.length);
				L.log(item.moment_dates_range);
				L.log(item.moment_dates_range[0]);
				L.log(item.moment_dates_range[0].format('DD MMMM'));
				var first_date = item.moment_dates_range[0].format('DD MMMM');
				L.log('FAVORITES_FORMATED');
				if (!events_by_days.hasOwnProperty(first_date)){
					L.log('FAVORITES_SECOND_73');
					events_by_days[first_date] = {};
					L.log('FAVORITES_SECOND_74');
				}
				L.log('FAVORITES_HAS_CHECKED');
				if (!events_by_days[first_date].hasOwnProperty('_' + item.id)){
					events_by_days[first_date]['_' + item.id] = item;
				}
				L.log('FAVORITES_HAS_SECOND_LOOP_DONE');
			}

			$scope.favorites_days = [];
			L.log('FAVORITES_PRINT');
			for(var day in events_by_days){
				L.log('FAVORITES_76');
				if (events_by_days.hasOwnProperty(day)){
					L.log('FAVORITES_78');
					var _events_array = [];
					L.log('FAVORITES_80');
					for (var event_key in events_by_days[day]){
						L.log('FAVORITES_82');
						if (events_by_days[day].hasOwnProperty(event_key)){
							L.log('FAVORITES_84');
							_events_array.push(events_by_days[day][event_key]);
							L.log('FAVORITES_86');
						}
					}
					L.log('FAVORITES_89');
					$scope.favorites_days.push({
						name: day,
						events: _events_array
					});
				}
				L.log('FAVORITES_95');
			}

			L.log('FAVORITES_98');
			$scope.$apply();

			if (cb){
				cb();
			}
		});
	};
};