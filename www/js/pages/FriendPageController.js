/*jslint browser: true*/
/*global console, Dom7, $, angular, angularApp*/

MyApp.ns('MyApp.pages');

MyApp.pages.FriendPageController = function ($scope) {
	'use strict';

	$scope.user = {};
	$scope.subscriptions = [];
	$scope.actions = [];
	$scope.no_subscriptions = false;

	$scope.setUser = function(user){
		$scope.user = user;
		$scope.$apply();
	};

	$scope.setSubscriptions = function(data){
		$scope.subscriptions = data;
		$scope.no_subscriptions = data.length != 0;
	};

	$scope.setActions = function(data){

	};

	$$(fw7App.getCurrentView().container).find('.friend-subscriptions').click();
};


function toggleActiveTabs(el, id){
	var $$el = $$(el),
		$$siblings = $$el.parent().find('.button'),
		$$container = $$(fw7App.getCurrentView().activePage.container);
	$$siblings.removeClass('active');
	$$el.addClass('active');
	if (id){
		$$siblings.data('friend-id', id);
	}
	$$container.find('.friend-tabs .tab').removeClass('active');
	$$container.find('.tab.' + $$el.data('page')).addClass('active');

}

function showFriendEvents(el){

	toggleActiveTabs(el, fw7App.getCurrentView().activePage.query.id);

	var friend_id = fw7App.getCurrentView().activePage.query.id || $$(el).data('friend-id');

	toggleActiveTabs(el);
	__api.users.get([
		{friend_id: friend_id},
		{actions: true}
	], function(data){
		var scope = angular.element(fw7App.getCurrentView().activePage.container).scope();
		scope.$apply(function(){
			scope.setActions(data);
		});
	});
}

function showFriendSubscriptions(el){
	toggleActiveTabs(el, fw7App.getCurrentView().activePage.query.id);

	var friend_id = fw7App.getCurrentView().activePage.query.id || $$(el).data('friend-id');

	__api.users.get([
		{friend_id: friend_id},
		{subscriptions: true}
	], function(data){
		var scope = angular.element(fw7App.getCurrentView().activePage.container).scope();
		scope.$apply(function(){
			scope.setSubscriptions(__api.organizations.normalize(data));
		});
	});
}