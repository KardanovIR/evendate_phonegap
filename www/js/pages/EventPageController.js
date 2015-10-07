/*jslint browser: true*/
/*global console, Dom7, $, angular, angularApp*/

MyApp.ns('MyApp.pages');

MyApp.pages.EventPageController = function ($scope, $http) {
	'use strict';

	$scope.event = {};
	$scope.setEvent = function(event){
		$scope.event = event;
		$scope.$digest();
	}

};