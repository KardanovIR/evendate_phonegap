MyApp.ns('MyApp.pages');

MyApp.pages.UsersPageController = function ($scope, $http) {
	'use strict';

	$scope.info= {};


	$scope.setInfo = function(info){
		info.friends.forEach(function(value, index){
			info.friends[index].type_name = CONTRACT.FRIEND_TYPE_NAMES[value.type];
		});
		$scope.info = info;
		$scope.$digest();
	};

};