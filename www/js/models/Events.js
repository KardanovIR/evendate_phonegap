function Events() {

	var is_opening = false;

	function normalize(items) {
		if (!items) return items;
		var _items = [],
			_today = moment().format(CONTRACT.DATE_FORMAT),
			_today_unix = moment(_today + ' 00:00:00').unix();
		items.forEach(function(event) {
			event.tags_array = [];
			event.future_moment_dates = [];
			event.moment_dates = [];

			if (event.tags) {
				event.tags.forEach(function(tag) {
					event.tags_array.push(tag.name);
				});
			}


			if (event.hasOwnProperty('nearest_event_date')) {
				event.nearest_event_date_string = moment.unix(event.nearest_event_date).format('DD/MM');
			}

			event.liked_users_count = event.favored_users_count;

			if (event.dates) {
				event.dates.forEach(function(event_day) {
					var _date = moment.unix(event_day.event_date),
						day = _date.format(CONTRACT.DATE_FORMAT),
						current = {
							start_date: moment(day + ' ' + event_day.start_time),
							end_date: moment(day + ' ' + event_day.end_time)
						};
					event.moment_dates.push(current);
					if (event_day.event_date >= _today_unix) {
						event.future_moment_dates.push(current);
					}
					if (day == _today) {
						event.today = {
							moment: current,
							start_time: event_day.start_time,
							end_time: event_day.end_time
						};
					}
				});

				event.begin_time = event.moment_dates[0].start_date.format('HH:mm');

				event.one_day = event.dates.length == 1;
				event.short_dates = [];
				event.dates_text = [];
				event.every_day = true;

				event.moment_dates.forEach(function(val, index) {
					var mdate = val.start_date.clone();
					event.short_dates.push(val.start_date.format('DD/MM'));
					event.dates_text.push(val.start_date.format('DD/MM'));

					if (index == 0) return true;
					event.every_day =
						event.every_day
						&&
						mdate.add(-1, 'days').format(CONTRACT.DATE_FORMAT)
						==
						event.moment_dates[index - 1].start_date.format(CONTRACT.DATE_FORMAT)
				});

				if (event.is_same_time && event.every_day) {
					if (event.dates.length > 1) {
						event.dates_text = '' + event.moment_dates[0].start_date.format('DD/MM') + ' - ' + event.moment_dates[event.moment_dates.length - 1].start_date.format('DD/MM');
						event.dates_text += "\n" + ' c ' + event.moment_dates[0].start_date.format('HH:mm') + ' по ' + event.moment_dates[0].end_date.format('HH:mm');
						event.short_dates = event.dates_text;
					} else {
						event.dates_text = event.moment_dates[0].start_date.format('DD/MM');
						event.dates_text += "\n" + ' c ' + event.moment_dates[0].start_date.format('HH:mm') + ' по ' + event.moment_dates[0].end_date.format('HH:mm');
						event.short_dates = event.dates_text;
					}
				} else {
					event.dates_text = event.dates_text.join(', ');
					event.short_dates = event.short_dates.join(', ');
				}
				event.day_name = event.moment_dates[0].start_date.format('dddd');
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
					url: 'pages/event.html?id=' + event.id + '&t=' + new Date().getTime(),
					query: {id: event.id},
					pushState: true,
					animatePages: true
				});

			};

			event.openDetailInfoUrl = function() {
				storeStat(event.id, CONTRACT.ENTITIES.EVENT, CONTRACT.STATISTICS.EVENT_OPEN_SITE);
				window.open(event.detail_info_url, '_system', 'location=yes');
			};

			event.openMap = function() {
				var url;
				if (event.latitude == 0 || event.longitude) {
					url = 'maps://?q=' + event.location;
				} else {
					url = 'maps://?q=' + event.latitude + ' , ' + event.longitude;
				}
				storeStat(event.id, CONTRACT.ENTITIES.EVENT, CONTRACT.STATISTICS.OPEN_MAP);
				window.open(url, '_system', 'location=yes');
			};

			event.toggleFavorite = function($event) {
				var _url = CONTRACT.URLS.API_FULL_PATH + CONTRACT.URLS.EVENTS_PATH + '/' + event.id + CONTRACT.URLS.FAVORITES_PART,
					opts = {
						type: 'POST',
						url: _url,
						complete: function() {
							var favorites_scope = angular.element($$('#favorites')).scope();
							favorites_scope.$apply(function() {
								favorites_scope.startBinding();
							});
						},
						success: function() {
							event.is_favorite = !event.is_favorite;
							event.updateFavoriteTexts();
						}
					};
				if (event.is_favorite) {
					opts['type'] = 'DELETE';
				}else{
					event.addToCalendar();
				}
				$$.ajax(opts);


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

			// event.addToCalendar = function(){
			// 	// create a calendar (iOS only for now)
			// 	var create_cal_options = window.plugins.calendar.getCreateCalendarOptions();
			// 	create_cal_options.calendarName = "Evendate";
			// 	create_cal_options.calendarColor = "#E33D74"; // an optional hex color (with the # char), default is null, so the OS picks a color
            //
			// 	window.plugins.calendar.createCalendar(create_cal_options, function(param1, param2){
			// 		L.log('CREATE_CALENDAR_SUCCESS:', param1, param2);
            //
			// 		window.plugins.calendar.listCalendars(L.log,L.log);
			// 		__api.events.get([
			// 			{id: event.id},
			// 			{fields: 'dates{fields:"start_time,end_time"},description,location'}
			// 		], function(_events){
			// 			var _e = _events[0];
            //
			// 			L.log(_e);
            //
			// 			var calOptions = window.plugins.calendar.getCalendarOptions(); // grab the defaults
			// 			calOptions.firstReminderMinutes = null; // default is 60, pass in null for no reminder (alarm)
			// 			calOptions.secondReminderMinutes = null;
            //
			// 			// Added these options in version 4.2.4:
			// 			calOptions.recurrence = "daily"; // supported are: daily, weekly, monthly, yearly
			// 			calOptions.recurrenceEndDate = _e.moment_dates[_e.moment_dates.length - 1].toDate(); // leave null to add events into infinity and beyond
			// 			calOptions.calendarName = "Evendate"; // iOS only
            //
			// 			// This is new since 4.2.7:
			// 			calOptions.recurrenceInterval = 1; // once every 2 months in this case, default: 1
            //
            //
			// 			// create an event in a named calendar (iOS only for now)
			// 			window.plugins.calendar.createEventWithOptions(_e.title, _e.location, _e.description, _e.moment_dates[0].toDate(), _e.moment_dates[_e.moment_dates.length - 1].toDate(), calOptions,
			// 				function(param1, param2){
			// 					L.log('CREATE_EVENT_SUCCESS:', param1, param2);
            //
			// 				},function(param1, param2){
			// 					L.log('CREATE_EVENT_ERROR:', param1, param2);
            //
			// 				});
            //
			// 		});
            //
            //
			// 		// // find events
			// 		// window.plugins.calendar.findEvent(title,location,notes,startDate,endDate,success,error);
             //        //
			// 		// // find all events in a named calendar (iOS only for now)
			// 		// window.plugins.calendar.findAllEventsInNamedCalendar(calendarName,success,error);
             //        //
			// 		// // change an event (iOS only for now)
			// 		// var newTitle = "New title!";
			// 		// window.plugins.calendar.modifyEvent(title,location,notes,startDate,endDate,newTitle,location,notes,startDate,endDate,success,error);
             //        //
			// 		// // delete an event (you can pass nulls for irrelevant parameters, note that on Android `notes` is ignored)
			// 		// window.plugins.calendar.deleteEvent(newTitle,location,notes,startDate,endDate,success,error);
            //
			// 	}, function(param1, param2){
			// 		L.log('CREATE_CALENDAR_FAIL:', param1, param2);
			// 	});
            //
			// };

			event.openLikedFriends = function() {
				var _event = this;
				if (callbackObjects['likedFriendsPageBeforeAnimation']) {
					callbackObjects['likedFriendsPageBeforeAnimation'].remove();
				}
				callbackObjects['likedFriendsPageBeforeAnimation'] = fw7App.onPageBeforeAnimation('friends_liked', function(page) {


					if ($$(page.container).hasClass('page-on-left')) return;
					var $$container = $$(page.container);
					if ($$container.data('opened') == true) {
						var $scope = angular.element($$container[0]).scope();
						//console.log(_event);
						$scope.setInfo({
							background_img_url: _event.image_horizontal_url,
							logo_url: null,
							name: _event.title,
							event_id: _event.id
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
									event_id: _event.id
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
				event.favorite_icon = event.is_favorite ? 'ion-ios-star' : 'ion-ios-star-outline';
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
			}
			if (_f.data.hasOwnProperty('favorites') && _f.data.favorites == true) {
				url += '/' + CONTRACT.URLS.FAVORITES_PART
			}
			if (_f.data.hasOwnProperty('id')) {
				url += '/' + _f.data.id;
			}
			if (_f.data.hasOwnProperty('my')) {
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
		normalizeAll: function(items) {
			return normalize(items);
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