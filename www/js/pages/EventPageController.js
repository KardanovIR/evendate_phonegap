/*jslint browser: true*/
/*global console, Dom7, $, angular, angularApp*/

MyApp.ns('MyApp.pages');

MyApp.pages.EventPageController = function ($scope) {
	'use strict';

	$scope.event = {};
	$scope.setEvent = function(event){
		$scope.event = event;

		__api.events.get([
			{id: event.id},
			{fields: 'detail_info_url,is_favorite,nearest_event_date,location,favored_users_count,favored{length:5},organization_name,organization_logo_small_url,description,favored,is_same_time,tags,dates{fields:"end_time,start_time",order_by:"event_date"}'}
		], function(res){
			$scope.event = res[0];
			$scope.$digest();
		});
		$scope.$digest();
	}

};