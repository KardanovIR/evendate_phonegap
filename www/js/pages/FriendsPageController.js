/*jslint browser: true*/
/*global console, Dom7, $, angular, angularApp*/

MyApp.ns('MyApp.pages');

MyApp.pages.FriendsPageController = function ($scope, $http) {
	'use strict';

	$scope.info= {};

	var type_names = {
		vk: 'ВКонтакте',
		google: 'Google +',
		fb: 'Facebook'
	};

	$scope.setInfo = function(info){
		info.friends.forEach(function(value, index){
			info.friends[index].type_name = type_names[value.type];
		});
		$scope.info = info;
		$scope.$digest();
	};

};