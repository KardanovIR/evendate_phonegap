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
		is_downloading = false;
	$scope.cards = [];
	$scope.page_counter = 0;

	$scope.showFeed = function(first_page){
		if (is_downloading == true) return;
		is_downloading = true;


		if (first_page == true){
			$scope.cards = [];
			cards_by_users = {};
			$scope.page_counter = 0;
			$$('.friends-page-content').on('infinite', function (){
				$scope.showFeed(false);
			});
		}

		__api.users.get([
			{feed: true},
			{page: $scope.page_counter++},
			{length: 10}
		], function(data){
			data.forEach(function(stat){
				var date = moment(stat.created_at),
					ent = stat[stat.entity],
					key = [stat.entity, stat.stat_type_id, stat.user.id, date.format('DD.MM')].join('-');
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
						__api.events.get([
							{id: ent.id}
						], function(res){
							debugger;
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
							debugger;
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
		});
	};

};