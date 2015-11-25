MyApp.ns('MyApp.pages');

MyApp.pages.UsersPageController = function ($scope) {
	'use strict';

	$scope.info= {};


	$scope.setInfo = function(info){
		info.friends = __api.users.normalize(info.friends);
		info.friends.forEach(function(value, index){
			info.friends[index].type_name = CONTRACT.FRIEND_TYPE_NAMES[value.type];
		});
		$scope.info = info;
		$scope.$digest();
	};

};