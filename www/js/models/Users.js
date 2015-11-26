function Users(){
	function insert(user, cb){
		var q_ins = '',
			placeholders = [],
			_fields = [
				CONTRACT.DB.FIELDS.USERS._ID,
				CONTRACT.DB.FIELDS.USERS.AVATAR_URL,
				CONTRACT.DB.FIELDS.USERS.FIRST_NAME,
				CONTRACT.DB.FIELDS.USERS.LAST_NAME,
				CONTRACT.DB.FIELDS.USERS.MIDDLE_NAME,
				CONTRACT.DB.FIELDS.USERS.TYPE,
				CONTRACT.DB.FIELDS.USERS.FRIEND_UID,
				CONTRACT.DB.FIELDS.USERS.LINK,
				CONTRACT.DB.FIELDS.USERS.CREATED_AT,
				CONTRACT.DB.FIELDS.USERS.UPDATED_AT];
		_fields.forEach(function(){
			placeholders.push('?');
		});
		q_ins = 'REPLACE INTO ' + CONTRACT.DB.TABLES.USERS + ' (' +
			_fields.join(',') + ') ' +
			' VALUES ( ' + placeholders.join(', ') + ');';

		__db.transaction(function(tx) {
			tx.executeSql(q_ins, [
				user.id,
				user.avatar_url,
				user.first_name,
				user.last_name,
				user.middle_name,
				user.type,
				user.friend_uid,
				user.link,
				moment().unix(),
				moment().unix()
			], function(tx, res){
				cb(res);
			},function(tx, err){
				L.log(tx, err);
				cb(null);
			})
		});

	}

	function normalize(items){

		items.forEach(function(item, index){
			items[index].type_name = CONTRACT.FRIEND_TYPE_NAMES[item.type];

			items[index].blurred_image_url = CONTRACT.URLS.BASE_NAME
				+ '/user_images/blurred/'
				+ items[index].id
				+ '.jpg';

			items[index].open = function(){
				fw7App.showIndicator();

				var _user = this;
				if (callbackObjects['userPageBeforeAnimation']){
					callbackObjects['userPageBeforeAnimation'].remove();
				}

				if (callbackObjects['userPageAfterAnimation']){
					callbackObjects['userPageAfterAnimation'].remove();
				}

				callbackObjects['userPageAfterAnimation'] = fw7App.onPageAfterAnimation('friend', function(page){
					if($$(fw7App.getCurrentView().container).find('.friend-buttons.active').length == 0){
						$$(fw7App.getCurrentView().container).find('a.friend-subscriptions').click();
					}
				});
				callbackObjects['userPageBeforeAnimation'] = fw7App.onPageBeforeAnimation('friend', function(page){
					var $$container = $$(page.container);
					if ($$container.data('opened') == true){
						var $scope = angular.element($$container[0]).scope();
						$scope.setUser(_user);
					}else{
						var rootElement = angular.element(document);
						rootElement.ready(function(){
							rootElement.injector().invoke([ "$compile", function($compile) {
								var scope = angular.element(page.container).scope();
								$compile(page.container)(scope);
								var $scope = angular.element($$container[0]).scope();
								$scope.setUser(_user);
								$$container.data('opened', true);
							}]);
						});
					}
					fw7App.hideIndicator();
				});
				fw7App.getCurrentView().router.loadPage({
					url: 'pages/friend.html',
					query: {id: _user.id},
					pushState: true,
					animatePages: true
				});
			};

			items[index].openProfile = function(){
				var _link = '',
					type = '';
				switch(item.type){
					case CONTRACT.SOCIAL_LINK_TYPES.VK:{
						type = 'vk';
						_link = 'vk://vk.com/' + item.friend_uid;
						break;
					}
					case CONTRACT.SOCIAL_LINK_TYPES.FACEBOOK:{
						type = 'fb';
						_link = 'fb://profile/' + item.friend_uid;
						break;
					}
					case CONTRACT.SOCIAL_LINK_TYPES.GOOGLE:{
						type = 'gplus';
						_link = 'gplus://plus.google.com/u/0/' + item.friend_uid;
						break;
					}

				}

				openLink(type, _link, item.link);
			}
		});

		return items;
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
				_r, is_feed = false,
				url = CONTRACT.URLS.API_FULL_PATH + CONTRACT.URLS.USERS_PATH;

			if (_f.data.hasOwnProperty('feed') && _f.data.feed == true){
				url += CONTRACT.URLS.FEED_PART;
				is_feed = true;
			}else if (_f.data.hasOwnProperty('friends') && _f.data.friends == true){
				url += CONTRACT.URLS.FRIENDS_PART;
				is_feed = true;
			}else if (_f.data.hasOwnProperty('friend_id')){
				url += CONTRACT.URLS.FRIENDS_PART;
				is_feed = true;
			}

			if (isOnline()){
				$$.ajax({
					url: url,
					data: _f.data,
					success: function(res){
						_r = normalize(res.data);
						cb(_r);
						if (is_feed == false){
							_post(_r, function(){});
						}
					},
					error: function(err){
						L.log(err);
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
				insert(data, cb);
			}else{
				var to_insert = data.length,
					done = 0;
				data.forEach(function(user){
					insert(user, function(){
						done++;
						if (done == to_insert){
							cb();
						}
					});
				});
			}
		},
		normalize: normalize
	}
}