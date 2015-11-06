/*jslint browser: true*/
/*global console, Dom7, $, angular, angularApp*/

MyApp.ns('MyApp.pages');

MyApp.pages.FriendsTabController = function ($scope, $http) {
	'use strict';

	var cards_by_users = {},
		action_names = {
			fave:           ['Добавила в избранное', 'Добавил в избранное'],
			unfave:         ['Удалила из избранного', 'Удалил из избранного'],
			subscribe:      ['Подписалась на организаторов', 'Подписался на организаторов'],
			unsubscribe:    ['Отписалась от организаторов', 'Отписался от организаторов'],
		},
		is_downloading = false,
		friends_downloading = false,
		downloaded_friends_page = 0;
	$scope.cards = [];
	$scope.page_counter = 0;

	$scope.friends = [];
	var $$pull_to_refresh = $$('.friends-page-content'),
		feed_is_active = false;

	$$pull_to_refresh.on('refresh', function(){
		if (feed_is_active){
			$scope.showFeed(true, function(){
				fw7App.pullToRefreshDone();
			});
		}else{
			$scope.showFriends(true, function(){
				fw7App.pullToRefreshDone();
			});
		}
	});


	$$('.friends-page-content').on('infinite', function (){
		if (feed_is_active){
			$scope.showFeed(false);
		}else{
			$scope.showFriends(false);
		}
	});

	$scope.showFeed = function(first_page, cb){
		feed_is_active = true;
		if (is_downloading == true){
			if (cb){
				cb();
			}
			return;
		}
		$$pull_to_refresh.find('.infinite-scroll-preloader').show();
		is_downloading = true;

		if (first_page == true){
			$scope.cards = [];
			cards_by_users = {};
			$scope.page_counter = 0;
		}

		__api.users.get([
			{feed: true},
			{page: $scope.page_counter++},
			{length: 10}
		], function(data){
			data.forEach(function(stat){
				var date = moment(stat.created_at),
					ent = stat[stat.entity],
					key = [stat.entity, stat.stat_type_id, stat.user.id, $scope.page_counter, date.format('DD.MM')].join('-');
				if (cards_by_users.hasOwnProperty(key) == false){
					cards_by_users[key] = {
						user: stat.user,
						type_code: stat.type_code,
						date: date.format('DD.MM'),
						action_name: action_names[stat.type_code][1],
						entities: []
					};
				}

				if (stat.entity == CONTRACT.ENTITIES.EVENT){
					ent.img_url = ent.image_vertical_url;

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
					ent.title = ent.name;
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
			$scope.$apply();
			is_downloading = false;
			$$pull_to_refresh.find('.infinite-scroll-preloader').hide();
			if (cb){
				cb();
			}
		});
	};


	$scope.showFriends = function(first_page, cb){
		feed_is_active = false;

		if (friends_downloading == true){
			if (cb){
				cb();
			}
			return;
		}

		if (first_page){
			downloaded_friends_page = 0;
		}

		$$pull_to_refresh.find('.infinite-scroll-preloader').show();
		friends_downloading = true;
		__api.users.get([
			{friends: true},
			{page: downloaded_friends_page++},
			{length: 10}
		], function(data){

			if (first_page){
				$scope.friends = data;
			}else{
				$scope.friends = $scope.friends.concat(data);
			}

			$scope.$apply();
			friends_downloading = false;
			$$pull_to_refresh.find('.infinite-scroll-preloader').hide();

			if (cb){
				cb();
			}
		});
	}
};