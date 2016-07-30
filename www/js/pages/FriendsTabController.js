/*jslint browser: true*/
/*global console, Dom7, $, angular, angularApp*/

MyApp.ns('MyApp.pages');

MyApp.pages.FriendsTabController = function ($scope) {
	'use strict';

	var cards_by_users = {},
		action_names = CONTRACT.ACTION_NAMES,
		friends_downloading = false,
		active_tab = '',
		downloaded_friends_page = 0,
		all_downloaded = false;
	$scope.cards = [];
	$scope.page_counter = 0;
	$scope.no_actions = false;
	$scope.is_downloading = false;

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
		if (first_page == 'BUTTON') return;
		if ($scope.is_downloading){
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
		$scope.$apply(function(){
			__api.users.get([
				{feed: true},
				{fields: 'type_code,organization{fields:"img_small_url"},event{fields:"image_square_vertical_url"},created_at,user{fields:"sex"}'},
				{order_by: '-created_at'},
				{page: $scope.page_counter++},
				{length: 20}
			], function(data){
				if (first_page){
					$scope.no_actions = data.length == 0;
				}
				data.forEach(function(stat){
					var date = moment.unix(stat.created_at),
						ent = stat[stat.entity],
						key = [stat.entity, stat.stat_type_id, stat.user.id, $scope.page_counter, date.format('DD.MM')].join('-');
					if (cards_by_users.hasOwnProperty(key) == false){
						cards_by_users[key] = {
							user: stat.user,
							entity: stat.entity,
							type_code: stat.type_code,
							date: date.format('DD.MM'),
							action_name: action_names[stat.type_code][0],
							open: function(){
								fw7App.showIndicator();
								__api.users.get([
									{friend_id: this.user.id},
									{fields: 'blurred_img_url,uid,type'}
								], function(data){
									fw7App.hideIndicator();
									data[0].open();
								})
							},
							entities: []
						};
					}

					if (stat.entity == CONTRACT.ENTITIES.EVENT){
						ent.img_url = ent.image_square_vertical_url;
						ent.openEntity = function(){
							fw7App.showIndicator();
							storeStat(stat.user.id, CONTRACT.ENTITIES.FRIEND, CONTRACT.STATISTICS.FRIEND_VIEW_EVENT_FROM_USER);
							__api.events.get([
								{id: ent.id}
							], function(res){
								fw7App.hideIndicator();
								res[0].open();
							});
						};
					}else if (stat.entity == CONTRACT.ENTITIES.ORGANIZATION){
						ent.img_url = ent.img_small_url;
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

				if (cb){
					cb();
				}
			});
		});
	};

	$scope.showFriends = function(first_page, cb){
		feed_is_active = false;
		$scope.friends_downloading = true;
		if (friends_downloading == true){
			if (cb){
				cb();
			}
			return;
		}

		if (first_page){
			downloaded_friends_page = 0;
		}

		friends_downloading = true;
		__api.users.get([
			{friends: true},
			{fields: 'is_friend,type,'},
			{page: downloaded_friends_page++}	,
			{length: 10}
		], function(data){


			if (first_page){
				$scope.friends = data;
			}else{
				$scope.friends = $scope.friends.concat(data);
			}

			if (data.length == 0){
				all_downloaded = true;
			}

			$scope.$apply();
			friends_downloading = false;

			if (cb){
				cb();
			}
			$scope.friends_downloading = false;
		});
	}

	$scope.moveActiveBackground = function($event){
		var $$this = $$($event.target),
			$$feeds = $$('#feeds'),
			name = $$this.data('name');

		// $scope.tabs[active_tab].scroll = $$feeds.scrollTop();


		active_tab = name;
		$$('#view-friends .tab-runner').css({
			width: $$this.width() + 'px',
			left: $$this.offset().left + 'px'
		});
	};
};