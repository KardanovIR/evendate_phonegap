

function Organizations(){
	function insert(organization, cb){
		var q_ins = '',
			_fields = [
				CONTRACT.DB.FIELDS.ORGANIZATIONS._ID,
				CONTRACT.DB.FIELDS.ORGANIZATIONS.BACKGROUND_IMG_URL,
				CONTRACT.DB.FIELDS.ORGANIZATIONS.SUBSCRIBED_COUNT,
				CONTRACT.DB.FIELDS.ORGANIZATIONS.CREATED_AT,
				CONTRACT.DB.FIELDS.ORGANIZATIONS.DESCRIPTION,
				CONTRACT.DB.FIELDS.ORGANIZATIONS.IMG_URL,
				CONTRACT.DB.FIELDS.ORGANIZATIONS.NAME,
				CONTRACT.DB.FIELDS.ORGANIZATIONS.SHORT_NAME,
				CONTRACT.DB.FIELDS.ORGANIZATIONS.SUBSCRIPTION_ID,
				CONTRACT.DB.FIELDS.ORGANIZATIONS.TYPE_ID,
				CONTRACT.DB.FIELDS.ORGANIZATIONS.TYPE_NAME,
				CONTRACT.DB.FIELDS.ORGANIZATIONS.BACKGROUND_MEDIUM_IMG_URL,
				CONTRACT.DB.FIELDS.ORGANIZATIONS.BACKGROUND_SMALL_IMG_URL,
				CONTRACT.DB.FIELDS.ORGANIZATIONS.IMG_MEDIUM_URL,
				CONTRACT.DB.FIELDS.ORGANIZATIONS.IMG_SMALL_URL,
				CONTRACT.DB.FIELDS.ORGANIZATIONS.UPDATED_AT];
		q_ins = 'INSERT INTO ' + CONTRACT.DB.TABLES.ORGANIZATIONS + ' (' +
			_fields.join(',') + ') ' +
			' VALUES ( ' + ['?', '?', '?', '?', '?', '?', '?', '?', '?', '?', '?', '?'].join(',') + ');';
		__db.transaction(function(tx) {
			tx.executeSql(q_ins, [
				organization.id,
				organization.background_img_url,
				organization.subscribed_count,
				moment().unix(),
				organization.description,
				organization.img_url,
				organization.name,
				organization.short_name,
				organization.subscription_id ? organization.subscription_id : null,
				organization.type_id,
				organization.type_name,
				organization.background_medium_img_url,
				organization.background_small_img_url,
				organization.img_medium_url,
				organization.img_small_url,
				moment().unix()
			], function(tx, res){
				cb(res);
				if (organization.hasOwnProperty('subscribed_friends')){
					organization.subscribed_friends.forEach(function(user){
						__api.users.post(user, function(res){
							__api.organizations_users.post({
								user_id: res.insertId,
								organization_id: organization.id
							}, function(){})
						})
					});
				}
			},function(tx, err){
				//L.log(tx, err);
				cb(null);
			})
		})

	}

	function normalize(items){

		var _ret = [];
		items.forEach(function(value){
			value.toggleSubscriptionStatus = function($event){
				var opts = {
					type: 'POST',
					url: CONTRACT.URLS.API_FULL_PATH + CONTRACT.URLS.SUBSCRIPTIONS_PATH,
					data: {organization_id: value.id},
					error: function(){
						fw7App.alert(CONTRACT.ALERTS.NO_INTERNET);
					},
					complete: function(){
						subscriptions_updated = true;
					}
				};
				if (value.is_subscribed){
					opts = {
						type: 'DELETE',
						url: CONTRACT.URLS.API_FULL_PATH + CONTRACT.URLS.SUBSCRIPTIONS_PATH + '/' + value.subscription_id,
						data: {subscription_id: value.subscription_id},
						error: function(){
							fw7App.alert(CONTRACT.ALERTS.NO_INTERNET);
						},
						complete: function(){
							subscriptions_updated = true;
						}
					};
				}
				if (isOnline()){
					$$.ajax(opts);
				}else{
					fw7App.alert(CONTRACT.ALERTS.NO_INTERNET);
				}

				value.is_subscribed = !value.is_subscribed;
				value.updateSubscriptionText();
				if ($event){
					$event.stopPropagation();
				}
			};

			value.updateSubscriptionText = function(){
				value.subscription_text = value.is_subscribed ? 'Отписаться' : 'Подписаться';
			};

			value.open = function(){
				fw7App.showIndicator();
				var _organization = this;
				if (callbackObjects['organizationPageBeforeAnimation']){
					callbackObjects['organizationPageBeforeAnimation'].remove();
				}
				callbackObjects['organizationPageBeforeAnimation'] = fw7App.onPageBeforeAnimation('organization', function(page){

					var $$container = $$(page.container),
						$$page = $$container.parents('.page.organization');
					if ($$container.data('opened') == true){
						var $scope = angular.element($$container[0]).scope();
						$scope.setOrganization(_organization);
					}else{
						var rootElement = angular.element(document);
						rootElement.ready(function(){
							rootElement.injector().invoke([ "$compile", function($compile) {
								var scope = angular.element(page.container).scope();
								$compile(page.container)(scope);
								var $scope = angular.element($$container[0]).scope();
								$scope.setOrganization(_organization);
								$$container.data('opened', true);
							}]);
						});
					}


					fw7App.hideIndicator();
				});
				fw7App.getCurrentView().router.loadPage({
					url: 'pages/organization.html',
					query: {id: value.id},
					pushState: true,
					animatePages: true
				});
			};

			value.openSite = function(){
				window.open(value.site_url, '_system');
			};

			value.openSubscribedFriends = function(){
				fw7App.showIndicator();
				var _organization = this;
				if (callbackObjects['subscribedFriendsPageBeforeAnimation']){
					callbackObjects['subscribedFriendsPageBeforeAnimation'].remove();
				}
				callbackObjects['subscribedFriendsPageBeforeAnimation'] = fw7App.onPageBeforeAnimation('friends_subscribed', function(page){

					var $$container = $$(page.container);
					if ($$container.data('opened') == true){
						var $scope = angular.element($$container[0]).scope();
						$scope.setInfo({
							background_img_url: _organization.background_img_url,
							logo_url: _organization.img_url,
							name: _organization.name,
							friends: _organization.subscribed_friends
						});
					}else{
						var rootElement = angular.element(document);
						rootElement.ready(function(){
							rootElement.injector().invoke([ "$compile", function($compile) {
								var scope = angular.element(page.container).scope();
								$compile(page.container)(scope);
								var $scope = angular.element($$container[0]).scope();
								$scope.setInfo({
									background_img_url: _organization.background_img_url,
									logo_url: _organization.img_url,
									name: _organization.name,
									friends: _organization.subscribed_friends
								});
								$$container.data('opened', true);
							}]);
						});
					}
					fw7App.hideIndicator();
				});

				fw7App.getCurrentView().router.loadPage({
					url: 'pages/friends_subscribed.html',
					query: {id: value.id},
					pushState: true,
					animatePages: true
				});
			};

			value.updateSubscriptionText();

			value.subscribed_count_text = getUnitsText(value.subscribed_count, CONTRACT.TEXTS.SUBSCRIBED);

			_ret.push(value);
		});

		return _ret;
	}

	function filterData(filters, data){
		var _res = [],
			name,
			params = prepareFilterQuery(filters).data;

		if (Array.isArray(data) == false){
			var arr = [];
			arr.push(data);
			data = arr;
		}

		data.forEach(function(item){
			for(name in params){
				if (!params.hasOwnProperty(name)) continue;
				if (!item.hasOwnProperty(name)) continue;

				if (item[name] != params[name]){
					item.to_exclude = true;
				}
			}
			_res.push(item);
		});

		data = [];
		_res.forEach(function(item){
			if (item.hasOwnProperty('to_exclude') && item.to_exclude == true){
				return true;
			}else{
				delete item.to_exclude;
				data.push(item);
			}
		});
		return data;
	}

	function getOffline(filters, cb){
		var _f = prepareFilterQuery(filters),
			q_get_items = 'SELECT * FROM ' + CONTRACT.DB.TABLES.ORGANIZATIONS +
				' ' + _f.query;

		__db.transaction(function(tx) {
			tx.executeSql(q_get_items, _f.args, function(tx, res){
				cb(res.rows);
			})
		})
	}

	return {
		'get': function(filters, cb){
			var _post = this.post,
				_r,
				_filters_data = prepareFilterQuery(filters).data,
				url = CONTRACT.URLS.API_FULL_PATH + CONTRACT.URLS.ORGANIZATIONS_PATH;

			if (_filters_data.hasOwnProperty('id')){
				url += '/' + _filters_data.id;
			}
			if (isOnline()){
				$$.ajax({
					url: url,
					data: angular.extend({
						with_subscriptions: true
					}, _filters_data),
					success: function(res){
						_r = filterData(filters, res.data);
						_r = normalize(_r);
						cb(_r);
						_post(res.data, function(){});
					},
					error: function(err){
						//L.log(err);
						getOffline(filters, cb);
					}
				});
			}else{
				getOffline(filters, cb);
			}
		},
		'post': function(data, cb){
			if (!data) throw Error('Data is empty');
			if (!Array.isArray(data)){
				insert(data, cb);
			}else{
				var to_insert = data.length,
					done = 0;
				data.forEach(function(organization){
					insert(organization, function(){
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