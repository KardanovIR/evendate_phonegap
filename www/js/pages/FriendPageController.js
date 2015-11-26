/*jslint browser: true*/
/*global console, Dom7, $, angular, angularApp*/

MyApp.ns('MyApp.pages');

MyApp.pages.FriendPageController = function ($scope) {
	'use strict';

	$scope.user = {};
	$scope.subscriptions = [];
	$scope.cards = [];
	$scope.page_counter = 0;
	$scope.friend_id = null;
	$scope.no_subscriptions = true;
	$scope.no_actions = true;
	$scope.is_downloading = false;


	var feed_is_active = false,

		cards_by_users = {};

	$scope.setUser = function(user){
		$scope.user = user;
		$scope.$apply();
	};

	$scope.setFriendId = function(friend_id){
		$scope.friend_id = friend_id;
	};

	$scope.setSubscriptions = function(data){
		$scope.subscriptions = data;
		$scope.no_subscriptions = data.length != 0;
	};

	$$(fw7App.getCurrentView().activePage.container).find('.friend .page-content').on('infinite', function (){
		if (feed_is_active){
			$scope.showFeed(false);
		}
	});

	$scope.showFeed = function(first_page, cb){
		feed_is_active = true;
		if ($scope.is_downloading == true){
			if (cb){
				cb();
			}
			return;
		}
		$scope.is_downloading = true;

		if (first_page == true){
			$scope.cards = [];
			cards_by_users = {};
			$scope.page_counter = 0;
		}

		__api.users.get([
			{friends: true},
			{actions: true},
			{friend_id: $scope.friend_id},
			{page: $scope.page_counter++},
			{length: 10}
		], function(data){
			if (first_page && data.length == 0){
				$scope.no_actions = false;
			}
			data.forEach(function(stat){
				var date = moment(stat.created_at),
					ent = stat[stat.entity],
					key = [stat.entity, stat.stat_type_id, stat.user.id, $scope.page_counter, date.format('DD.MM')].join('-');
				if (cards_by_users.hasOwnProperty(key) == false){
					var _user_id = stat.user.id;
					cards_by_users[key] = {
						user: stat.user,
						entity: stat.entity,
						type_code: stat.type_code,
						date: date.format('DD.MM'),
						action_name: CONTRACT.ACTION_NAMES[stat.type_code][0],
						open: function(){
							fw7App.showIndicator();
							__api.users.get([
								{friend_id: _user_id},
								{friends: true}
							], function(data){
								data[0].open();
							})
						},
						entities: []
					};
				}

				if (stat.entity == CONTRACT.ENTITIES.EVENT){
					ent.img_url = ent.image_square_url;
					ent.openEntity = function(){
						fw7App.showIndicator();
						__api.events.get([
							{id: ent.id}
						], function(res){
							fw7App.hideIndicator();
							res[0].open();
						});
					};

				}else if (stat.entity == CONTRACT.ENTITIES.ORGANIZATION){
					ent.img_url = ent.img_medium_url;
					ent.title = ent.short_name;
					ent.openEntity = function(){
						__api.organizations.get([
							{id: ent.id}
						], function(res){
							res[0].open();
						});
					};
				}

				cards_by_users[key].entities.push(ent);
			});

			$scope.cards = [];

			for(var day in cards_by_users){
				if (cards_by_users.hasOwnProperty(day)){
					$scope.cards.push(cards_by_users[day]);
				}
			}
			$scope.is_downloading = false;
			$scope.$apply();
			if (cb){
				cb();
			}
		});
	};
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
	var scope = angular.element(fw7App.getCurrentView().activePage.container).scope();
	scope.$apply(function() {
		scope.setFriendId(friend_id);
		scope.showFeed(true, function(){})
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