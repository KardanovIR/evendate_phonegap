function Events(){

	var NAVBAR_HEIGHT = 44;

	function insert(event, cb){
		var q_ins = '',
			placeholders = [],
			_fields = [
				CONTRACT.DB.FIELDS.EVENTS._ID,
				CONTRACT.DB.FIELDS.EVENTS.BEGIN_TIME,
				CONTRACT.DB.FIELDS.EVENTS.CREATED_AT,
				CONTRACT.DB.FIELDS.EVENTS.DESCRIPTION,
				CONTRACT.DB.FIELDS.EVENTS.DETAIL_INFO_URL,
				CONTRACT.DB.FIELDS.EVENTS.END_DATE,
				CONTRACT.DB.FIELDS.EVENTS.END_TIME,
				CONTRACT.DB.FIELDS.EVENTS.IMAGE_HORIZONTAL_URL,
				CONTRACT.DB.FIELDS.EVENTS.IMAGE_VERTICAL_URL,
				CONTRACT.DB.FIELDS.EVENTS.LATITUDE,
				CONTRACT.DB.FIELDS.EVENTS.LONGITUDE,
				CONTRACT.DB.FIELDS.EVENTS.LOCATION_JSON,
				CONTRACT.DB.FIELDS.EVENTS.LOCATION_TEXT,
				CONTRACT.DB.FIELDS.EVENTS.LOCATION_URI,
				CONTRACT.DB.FIELDS.EVENTS.NOTIFICATIONS,
				CONTRACT.DB.FIELDS.EVENTS.ORGANIZATION_ID,
				CONTRACT.DB.FIELDS.EVENTS.START_DATE,
				CONTRACT.DB.FIELDS.EVENTS.TITLE,
				CONTRACT.DB.FIELDS.EVENTS.UPDATED_AT],
			q_ins_dates = '',
			dates_fields = [
				CONTRACT.DB.FIELDS.EVENTS_DATES._ID,
				CONTRACT.DB.FIELDS.EVENTS_DATES.EVENT_ID,
				CONTRACT.DB.FIELDS.EVENTS_DATES.EVENT_DATE,
				CONTRACT.DB.FIELDS.EVENTS_DATES.STATUS,
				CONTRACT.DB.FIELDS.EVENTS_DATES.CREATED_AT,
				CONTRACT.DB.FIELDS.EVENTS_DATES.UPDATED_AT
			];
		_fields.forEach(function(){
			placeholders.push('?');
		});
		q_ins = 'REPLACE INTO ' + CONTRACT.DB.TABLES.EVENTS + ' (' +
			_fields.join(',') + ') ' +
			' VALUES ( ' + placeholders.join(', ') + ');';

		__db.transaction(function(tx) {
			tx.executeSql(q_ins, [
				event.id,
				event.begin_time,
				moment().unix(),
				event.description,
				event.detail_info_url,
				event.timestamp_event_end_date,
				event.end_time,
				event.image_horizontal_url,
				event.image_vertical_url,
				event.latitude,
				event.longitude,
				event.location_object,
				event.location,
				event.location_uri,
				event.notifications_schema_json,
				event.organization_id,
				event.timestamp_event_start_date,
				event.title,
				moment().unix()
			], function(tx, res){
				event.tags.forEach(function(tag){
					__api.tags.post(tag, function(tag_res){
						__api.event_tags.post({
							event_id: res.insertId,
							tag_id: tag_res.insertId
						}, function(){});
					});
				});
				event.favorite_friends.forEach(function(user){
					__api.users.post(user, function(user_res){});
				});
				cb(res);
			},function(tx, err){
				cb(null);
			})
		})

	}



	function normalize(items){
		if (!items) return items;
		var _items = [];
		items.forEach(function(event){
			event.tags_array = [];
			event.tags.forEach(function(tag){
				event.tags_array.push(tag.name);
			});

			var st_date = event.event_start_date == null ? moment(event.dates_range[0]) : moment(event.event_start_date),
				end_date = moment(event.event_end_date);

			event.date =  event.event_start_date != null
				? moment(event.event_start_date).format(CONTRACT.DATE_FORMAT)
				: moment(event.dates_range[0]).format(CONTRACT.DATE_FORMAT);

			event.begin_time = moment(event.begin_time, 'HH:mm:ss').format('HH:mm');

			if (event.end_time == null){
				event.time = event.begin_time;
			}else{
				event.end_time = moment(event.end_time, 'HH:mm:ss').format('HH:mm');
				if (event.begin_time == '00:00' && event.end_time == '00:00'){
					event.time = ' Весь день';
				}else{
					event.time = event.begin_time + ' - ' + event.end_time;
				}
			}



			event.begin_time_for_timeline = event.begin_time == '00:00' && event.end_time == '00:00' ? '': event.begin_time;
			if (event.event_start_date == null || event.event_end_date == null){
				event.one_day = event.dates_range.length == 1;
				event.dates = st_date.format('DD MMMM') ;
				event.short_dates = [];
				event.dates = [];
				event.dates_range.forEach(function(val){
					event.dates.push(moment(val).format('DD.MM'));
					event.short_dates.push(moment(val).format('DD.MM'));
				});
				event.dates = event.dates.join(', ') ;
				event.short_dates = event.short_dates.join(', ') ;
				event.day_name = st_date.format('dddd');
			}else{
				event.dates = end_date.format('DD MMMM') ;
				event.short_dates = end_date.format('DD.MM') ;
				event.day_name = end_date.format('dddd');
				if (end_date.format(CONTRACT.DATE_FORMAT) != st_date.format(CONTRACT.DATE_FORMAT)){
					event.one_day = false;
					if (end_date.format('MM') == st_date.format('MM')){
						event.dates = st_date.format('DD') + ' - ' + end_date.format('DD MMMM');
					}else{
						event.dates = st_date.format('DD MMMM') + ' - ' + end_date.format('DD MMMM')
					}
					event.short_dates = st_date.format('DD.MM') + ' - ' + end_date.format('DD.MM')
				}else{
					event.one_day = true;
				}
			}



			var _a = document.createElement('a'),
				_url = event.detail_info_url,
				params_array = ['utm_source=Evendate', 'utm_campaign=' + encodeURIComponent(event.title), 'utm_medium=affiliated'];

			_a.href = event.detail_info_url;

			if (_a.search != ''){
				_url += '&' + params_array.join('&')
			}else{
				_url += '?' + params_array.join('&')
			}

			event.detail_info_url = _url;

			event.tags_text = event.tags_array.join(', ');

			event.hide_text = 'Не показывать';

			event.toggleHidden = function(){
				$$.ajax({
					url: CONTRACT.URLS.API_FULL_PATH + CONTRACT.URLS.EVENTS_PATH  + '/' + event.id + '/status',
					data: {
						hidden: 1
					},
					type: 'PUT'
				})
			};

			event.open = function(){
				fw7App.showIndicator();
				var _event = this;
				if (callbackObjects['eventPageBeforeAnimation']){
					callbackObjects['eventPageBeforeAnimation'].remove();
				}
				callbackObjects['eventPageBeforeAnimation'] = fw7App.onPageBeforeAnimation('event', function(page){
					var $$container = $$(page.container),
						$$event_wrapper = $$container.find('.event-wrapper'),
						$bcg_img_wrapper = $$container.find('.background-img-wrapper'),
						$$page = $$container.parents('.page.event');
					if ($$container.data('opened') == true){
						var $scope = angular.element($$container[0]).scope();
						$scope.setEvent(_event);
						$$page.find('.heading-name').text(_event.title);
					}else{
						var rootElement = angular.element(document);
						rootElement.ready(function(){
							rootElement.injector().invoke([ "$compile", function($compile) {
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
				fw7App.getCurrentView().router.loadPage({
					url: 'pages/event.html',
					query: {id: event.id},
					pushState: true,
					animatePages: true
				});
			};

			event.openDetailInfoUrl = function(){
				window.open(event.detail_info_url, '_system', 'location=yes');
				//window.plugins.ChildBrowser.showWebPage(, {
				//	showLocationBar: true,
				//	showAddress: true,
				//	showNavigationBar: true
				//});
			};

			event.openMap= function(){
				var url;

				if (event.latitude == 0 || event.longitude){
					url = 'maps://?q=' + event.location;
				}else{
					url = 'maps://?q=' + event.latitude + ' , ' + event.longitude;
				}

				window.open(url, '_system', 'location=yes');
				//window.plugins.ChildBrowser.showWebPage(, {
				//	showLocationBar: true,
				//	showAddress: true,
				//	showNavigationBar: true
				//});
			};

			event.toggleFavorite = function($event){
				var opts = {
					type: 'POST',
					url: CONTRACT.URLS.API_FULL_PATH + CONTRACT.URLS.EVENTS_PATH + CONTRACT.URLS.FAVORITES_PART,
					data: {event_id: event.id},
					error: function(){
						fw7App.alert(CONTRACT.ALERTS.NO_INTERNET);
					},
					complete: function(){
						var favorites_scope = angular.element($$('#favorites')).scope();
						favorites_scope.$apply(function(){
							favorites_scope.startBinding();
						});
					}
				};
				if (event.is_favorite){
					opts = {
						type: 'DELETE',
						url: CONTRACT.URLS.API_FULL_PATH + CONTRACT.URLS.EVENTS_PATH +
							CONTRACT.URLS.FAVORITES_PART + '/' + event.id,
						data: {event_id: event.id},
						error: function(){
							fw7App.alert(CONTRACT.ALERTS.NO_INTERNET);
						},
						complete: function(){
							var favorites_scope = angular.element($$('#favorites')).scope();
							favorites_scope.$apply(function(){
								favorites_scope.startBinding();
							});
						}
					};
				}
				if (isOnline()){
					$$.ajax(opts);
				}else{
					fw7App.alert(CONTRACT.ALERTS.NO_INTERNET);
				}

				event.is_favorite = !event.is_favorite;
				event.updateFavoriteTexts();

				if ($event){
					fw7App.swipeoutClose($$($event.target).parents('.swipeout')[0])
				}

			};

			event.openOrganization = function(){

				fw7App.showIndicator();
				__api.organizations.get([
					{id: event.organization_id}
				], function(res){
					res[0].open();

					fw7App.hideIndicator();
				});
			};

			event.openLikedFriends = function(){

				var _event = this;
				if (callbackObjects['likedFriendsPageBeforeAnimation']){
					callbackObjects['likedFriendsPageBeforeAnimation'].remove();
				}
				callbackObjects['likedFriendsPageBeforeAnimation'] = fw7App.onPageBeforeAnimation('friends_liked', function(page){

					var $$container = $$(page.container);
					if ($$container.data('opened') == true){
						var $scope = angular.element($$container[0]).scope();
						console.log(_event);
						$scope.setInfo({
							background_img_url: _event.image_horizontal_url,
							logo_url: null,
							name: _event.title,
							friends: _event.favorite_friends
						});
					}else{
						var rootElement = angular.element(document);
						rootElement.ready(function(){
							rootElement.injector().invoke([ "$compile", function($compile) {
								var scope = angular.element(page.container).scope();
								$compile(page.container)(scope);
								var $scope = angular.element($$container[0]).scope();
								console.log(_event);
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

			event.updateFavoriteTexts = function(){
				event.favorite_text = event.is_favorite ? 'Убрать из избранного' : 'В избранное';
				event.favorite_short_text = event.is_favorite ? 'В избранном' : 'В избранное';
			};

			event.updateFavoriteTexts();
			_items.push(event);
		});
		return _items;
	}

	function getOffline(filters, cb){
		var _f = prepareFilterQuery(filters),
			q_get_items = 'SELECT * FROM ' + CONTRACT.DB.TABLES.EVENTS +
				' ' + _f.query;
		__db.transaction(function(tx) {
			tx.executeSql(q_get_items, _f.args, function(tx, res){
				cb(res.rows);
			})
		})
	}

	return {
		'get': function(filters, cb){
			var _f = prepareFilterQuery(filters),
				_post = this.post,
				_r,
				url = CONTRACT.URLS.API_FULL_PATH + CONTRACT.URLS.EVENTS_PATH;
			if (_f.data.hasOwnProperty('timeline') && _f.data.timeline == true){
				url += '/' + CONTRACT.URLS.MY_PART
			}else if (_f.data.hasOwnProperty('favorites') && _f.data.favorites == true){
				url += '/' + CONTRACT.URLS.FAVORITES_PART
			}else if (_f.data.hasOwnProperty('id')){
				url += '/' + _f.data.id;
			}
			if (isOnline()){
				$$.ajax({
					url: url,
					data: _f.data,
					success: function(res){
						res.data = [].concat(res.data);
						_r = normalize(res.data);
						cb(_r);
						if (_f.data.hasOwnProperty('type') && _f.data.type == 'short'){
							//DON'T SAVE SHORT EVENTS
						}else{
							try{
								_post(res.data, function(){});
							}catch(e){
								fw7App.alert('Error');
							}

						}
					},
					error: function(err){
						getOffline(filters, cb);
					}
				});
			}else{
				getOffline(cb);
			}
		},
		'post': function(data, cb){
			if (!data) throw Error('Data is empty');
			if (!Array.isArray(data)){
				insert(data);
			}else{
				var to_insert = data.length,
					done = 0;
				data.forEach(function(event){
					insert(event, function(){
						done++;
						if (done == to_insert){
							cb();
						}
					});
				});
			}
		}
	}
}