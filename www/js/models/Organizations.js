

function Organizations(){

	var is_opening;

	function normalize(items){

		var _ret = [];
		items.forEach(function(value){
			value.toggleSubscriptionStatus = function($event){
				var opts = {
					type: 'POST',
					url: CONTRACT.URLS.API_FULL_PATH + CONTRACT.URLS.ORGANIZATIONS_PATH + '/' + value.id + '/' + CONTRACT.URLS.SUBSCRIPTIONS_PATH,
					data: {organization_id: value.id},
					complete: function(){
						subscriptions_updated = true;
					}
				};
				if (value.is_subscribed){
					opts = {
						type: 'DELETE',
						url: CONTRACT.URLS.API_FULL_PATH + CONTRACT.URLS.ORGANIZATIONS_PATH + '/' + value.id + '/' + CONTRACT.URLS.SUBSCRIPTIONS_PATH,
						data: {subscription_id: value.subscription_id},
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
				if (is_opening) return;
				value.new_events_count = 0;
				is_opening = true;
				fw7App.showIndicator();
				var _organization = this;
				if (callbackObjects['organizationPageBeforeAnimation']){
					callbackObjects['organizationPageBeforeAnimation'].remove();
				}
				if (callbackObjects['organizationPageAfterAnimation']){
					callbackObjects['organizationPageAfterAnimation'].remove();
				}
				callbackObjects['organizationPageBeforeAnimation'] = fw7App.onPageBeforeAnimation('organization', function(page){

					$$(page.navbarInnerContainer).find('.organization-heading-name').text(_organization.short_name);

					if ($$(page.container).hasClass('page-on-left')) return;

					var $$container = $$(page.container);
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

				callbackObjects['organizationPageAfterAnimation'] = fw7App.onPageAfterAnimation('organization', function(page) {
					is_opening = false;
				});

				fw7App.getCurrentView().router.loadPage({
					url: 'pages/organization.html',
					query: {id: value.id},
					pushState: true,
					animatePages: true
				});

			};

			value.openSite = function(){
				storeStat(value.id, 'organization', 'open_site');
				window.open(value.site_url, '_system');
			};

			value.openSubscribedFriends = function(){
				if (is_opening) return;
				is_opening = true;
				fw7App.showIndicator();
				var _organization = this;
				if (callbackObjects['subscribedFriendsPageBeforeAnimation']){
					callbackObjects['subscribedFriendsPageBeforeAnimation'].remove();
				}
				if (callbackObjects['subscribedFriendsPageAfterAnimation']){
					callbackObjects['subscribedFriendsPageAfterAnimation'].remove();
				}
				callbackObjects['subscribedFriendsPageBeforeAnimation'] = fw7App.onPageBeforeAnimation('friends_subscribed', function(page){
					var $$container = $$(page.container);
					if ($$container.data('opened') == true){
						var $scope = angular.element($$container[0]).scope();
						$scope.setInfo({
							background_img_url: _organization.background_img_url,
							logo_url: _organization.img_url,
							name: _organization.name,
							organization_id: _organization.id
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
									organization_id: _organization.id
								});
								$$container.data('opened', true);
							}]);
						});
					}
					fw7App.hideIndicator();
				});


				callbackObjects['subscribedFriendsPageAfterAnimation'] = fw7App.onPageAfterAnimation('friends_subscribed', function(page){
					is_opening = false;
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

	return {
		'get': function(filters, cb){
			var _filters_data = prepareFilterQuery(filters).data,
				url = CONTRACT.URLS.API_FULL_PATH + CONTRACT.URLS.ORGANIZATIONS_PATH;

			if (_filters_data.hasOwnProperty('id')){
				url += '/' + _filters_data.id;
			}
			if (_filters_data.hasOwnProperty('subscriptions')){
				url += CONTRACT.URLS.SUBSCRIPTIONS_PART;
			}
			$$.ajax({
				url: url,
				data: _filters_data,
				success: function(res){
					cb(normalize(res.data));
				}
			});
		},
		'normalize': normalize
	}
}