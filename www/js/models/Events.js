function Events() {

	var is_opening = false;

	function normalize(items) {
		if (!items) return items;
		var _items = [],
			dates = [],
			_today = moment().format(CONTRACT.DATE_FORMAT),
			_today_unix = moment(_today + ' 00:00:00').unix();
		items.forEach(function(event) {
			event.tags_array = [];
			event.future_moment_dates = [];
			dates = [];

			if (event.tags){
				event.tags.forEach(function(tag) {
					event.tags_array.push(tag.name);
				});
			}

			if (event.dates){
				event.dates.forEach(function(event_day){
					var _date = moment.unix(event_day.event_date),
						day = _date.format(CONTRACT.DATE_FORMAT),
						current = {
							start_date: moment(day + ' ' + event_day.start_time),
							end_date: moment(day + ' ' + event_day.end_time)
						};
					dates.push(current);
					if (event_day.event_date >=_today_unix){
						event.future_moment_dates.push(current);
					}
					if (day == _today){
						event.today = {
							moment: current,
							start_time: event_day.start_time,
							end_time: event_day.end_time
						};
					}
				});
				event.moment_dates = dates;
				event.liked_users_count = event.favored_users_count;

				event.begin_time = dates[0].start_date.format('HH:mm');

				event.one_day = event.dates.length == 1;
				event.short_dates = [];
				event.dates = [];
				var date_format = event.dates.length == 1 ? 'DD MMMM' : 'DD/MM';
				event.moment_dates.forEach(function(val){
					event.dates.push(val.start_date.format(date_format) + ' ' + val.start_date.format('HH:mm') + ' - ' + val.end_date.format('HH:mm'));
					event.short_dates.push(val.start_date.format('DD/MM'));
				});
				if (event.is_dates_range){
					if (event.dates.length > 1){
						event.dates = '' + event.moment_dates[0].start_date.format('DD/MM') + ' - ' + event.moment_dates[event.moment_dates.length - 1].start_date.format('DD/MM');
						event.dates += "\n" + ' c ' + event.moment_dates[0].start_date.format('HH:mm') + ' по ' + event.moment_dates[0].end_date.format('HH:mm');
						event.short_dates = event.dates;
					}else{
						event.dates = event.moment_dates[0].start_date.format('DD/MM');
						event.dates += "\n" + ' c ' + event.moment_dates[0].start_date.format('HH:mm') + ' по ' + event.moment_dates[0].end_date.format('HH:mm');
						event.short_dates = event.dates;
					}
				}else{
					event.dates = event.dates.join(', ') ;
					event.short_dates = event.short_dates.join(', ') ;
				}
				event.day_name = dates[0].start_date.format('dddd');
			}





			var _a = document.createElement('a'),
				_url = event.detail_info_url,
				params_array = ['utm_source=Evendate', 'utm_campaign=' + encodeURIComponent(event.title), 'utm_medium=affiliated'];

			_a.href = event.detail_info_url;

			if (_a.search != '') {
				_url += '&' + params_array.join('&')
			} else {
				_url += '?' + params_array.join('&')
			}

			event.detail_info_url = _url;

			event.tags_text = event.tags_array.join(', ');

			event.hide_text = 'Не показывать';

			event.toggleHidden = function() {
				$$.ajax({
					url: CONTRACT.URLS.API_FULL_PATH + CONTRACT.URLS.EVENTS_PATH + '/' + event.id + '/status',
					data: {
						hidden: 1
					},
					type: 'PUT'
				})
			};

			event.open = function() {
				if (is_opening) return;
				is_opening = true;
				fw7App.showIndicator();
				var _event = this;
				if (callbackObjects['eventPageBeforeAnimation']) {
					callbackObjects['eventPageBeforeAnimation'].remove();
				}
				if (callbackObjects['eventPageAfterAnimation']) {
					callbackObjects['eventPageAfterAnimation'].remove();
				}
				callbackObjects['eventPageBeforeAnimation'] = fw7App.onPageBeforeAnimation('event', function(page) {
					var $$container = $$(page.container),
						$$event_wrapper = $$container.find('.event-wrapper'),
						$bcg_img_wrapper = $$container.find('.background-img-wrapper'),
						$$page = $$container.parents('.page.event');
					if ($$container.data('opened') == true) {
						var $scope = angular.element($$container[0]).scope();
						$scope.setEvent(_event);
						$$page.find('.heading-name').text(_event.title);
					} else {
						var rootElement = angular.element(document);
						rootElement.ready(function() {
							rootElement.injector().invoke(["$compile", function($compile) {
								var scope = angular.element(page.container).scope();
								$compile(page.container)(scope);
								var $scope = angular.element($$container[0]).scope();
								$scope.setEvent(_event);
								$$page.find('.heading-name').text(_event.title);
								$$container.data('opened', true);
							}]);
						});
					}
					fw7App.hideIndicator();
				});

				callbackObjects['eventPageAfterAnimation'] = fw7App.onPageAfterAnimation('event', function(page) {
					is_opening = false;
				});

				fw7App.getCurrentView().router.loadPage({
					url: 'pages/event.html',
					query: {id: event.id},
					pushState: true,
					animatePages: true
				});
			};

			event.openDetailInfoUrl = function() {
				window.open(event.detail_info_url, '_system', 'location=yes');
			};

			event.openMap = function() {
				var url;
				if (event.latitude == 0 || event.longitude) {
					url = 'maps://?q=' + event.location;
				} else {
					url = 'maps://?q=' + event.latitude + ' , ' + event.longitude;
				}
				window.open(url, '_system', 'location=yes');
			};

			event.toggleFavorite = function($event) {
				var opts = {
					type: 'POST',
					url: CONTRACT.URLS.API_FULL_PATH + CONTRACT.URLS.EVENTS_PATH + CONTRACT.URLS.FAVORITES_PART,
					data: {event_id: event.id},
					error: function() {
						fw7App.alert(CONTRACT.ALERTS.NO_INTERNET);
					},
					complete: function() {
						var favorites_scope = angular.element($$('#favorites')).scope();
						favorites_scope.$apply(function() {
							favorites_scope.startBinding();
						});
					}
				};
				if (event.is_favorite) {
					opts = {
						type: 'DELETE',
						url: CONTRACT.URLS.API_FULL_PATH + CONTRACT.URLS.EVENTS_PATH +
						CONTRACT.URLS.FAVORITES_PART + '/' + event.id,
						data: {event_id: event.id},
						error: function() {
							fw7App.alert(CONTRACT.ALERTS.NO_INTERNET);
						},
						complete: function() {
							var favorites_scope = angular.element($$('#favorites')).scope();
							favorites_scope.$apply(function() {
								favorites_scope.startBinding();
							});
						}
					};
				}
				if (isOnline()) {
					$$.ajax(opts);
				} else {
					fw7App.alert(CONTRACT.ALERTS.NO_INTERNET);
				}

				event.is_favorite = !event.is_favorite;
				event.updateFavoriteTexts();

				if ($event) {
					fw7App.swipeoutClose($$($event.target).parents('.swipeout')[0])
				}

			};

			event.openOrganization = function() {

				fw7App.showIndicator();
				__api.organizations.get([
					{id: event.organization_id}
				], function(res) {
					res[0].open();
					fw7App.hideIndicator();
				});
			};

			event.openLikedFriends = function() {
				var _event = this;
				if (callbackObjects['likedFriendsPageBeforeAnimation']) {
					callbackObjects['likedFriendsPageBeforeAnimation'].remove();
				}
				callbackObjects['likedFriendsPageBeforeAnimation'] = fw7App.onPageBeforeAnimation('friends_liked', function(page) {

					var $$container = $$(page.container);
					if ($$container.data('opened') == true) {
						var $scope = angular.element($$container[0]).scope();
						//console.log(_event);
						$scope.setInfo({
							background_img_url: _event.image_horizontal_url,
							logo_url: null,
							name: _event.title,
							friends: _event.favorite_friends
						});
					} else {
						var rootElement = angular.element(document);
						rootElement.ready(function() {
							rootElement.injector().invoke(["$compile", function($compile) {
								var scope = angular.element(page.container).scope();
								$compile(page.container)(scope);
								var $scope = angular.element($$container[0]).scope();
								//console.log(_event);
								$scope.setInfo({
									background_img_url: _event.image_horizontal_url,
									logo_url: null,
									name: _event.title,
									friends: _event.favorite_friends
								});
								$$container.data('opened', true);
							}]);
						});
					}
				});
				fw7App.getCurrentView().router.loadPage({
					url: 'pages/friends_liked.html',
					query: {id: _event.id},
					pushState: true,
					animatePages: true
				});
			};

			event.updateFavoriteTexts = function() {
				event.favorite_text = event.is_favorite ? 'Убрать из избранного' : 'В избранное';
				event.favorite_short_text = event.is_favorite ? 'В избранном' : 'В избранное';
			};

			//КОСТЫЛЬ для iPhone 4
			if (window.innerHeight == IPHONE_4_HEIGHT) {
				event.image_vertical_url = event.image_square_url;
			}

			event.updateFavoriteTexts();
			_items.push(event);
		});
		return _items;
	}

	return {
		'get': function(filters, cb) {
			var _f = prepareFilterQuery(filters),
				_r,
				url = CONTRACT.URLS.API_FULL_PATH + CONTRACT.URLS.EVENTS_PATH;
			if (_f.data.hasOwnProperty('timeline') && _f.data.timeline == true) {
				url += '/' + CONTRACT.URLS.MY_PART
			} else if (_f.data.hasOwnProperty('favorites') && _f.data.favorites == true) {
				url += '/' + CONTRACT.URLS.FAVORITES_PART
			} else if (_f.data.hasOwnProperty('id')) {
				url += '/' + _f.data.id;
			} else if (_f.data.hasOwnProperty('my')) {
				url += '/my';
			}

			L.log(url);
			L.log(_f.data);

			$$.ajax({
				url: url,
				data: _f.data,
				success: function(res) {
					res.data = [].concat(res.data);
					_r = normalize(res.data);
					cb(_r);
				}
			});

		},
		'dates': {
			'get': function(filters, cb) {
				var _f = prepareFilterQuery(filters),
					url = CONTRACT.URLS.API_FULL_PATH + CONTRACT.URLS.EVENTS_PATH + '/' + CONTRACT.URLS.DATES_PATH + '';
				$$.ajax({
					url: url,
					data: _f.data,
					success: function(res) {
						cb(res.data);
					}
				});
			}
		}
	}
}