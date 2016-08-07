function Users() {

    var is_opening;

    function normalize(items) {
        if (!items) return;
        items.forEach(function (item, index) {
            items[index].type_name = CONTRACT.FRIEND_TYPE_NAMES[item.type];

            items[index].open = function () {
                if (is_opening) return;
                is_opening = true;
                fw7App.showIndicator();

                var _user = this;
                if (callbackObjects['userPageBeforeAnimation']) {
                    callbackObjects['userPageBeforeAnimation'].remove();
                }

                if (callbackObjects['userPageAfterAnimation']) {
                    callbackObjects['userPageAfterAnimation'].remove();
                }

                callbackObjects['userPageBeforeAnimation'] = fw7App.onPageBeforeAnimation('friend', function (page) {
                    if ($$(page.container).hasClass('page-on-left')) return;
                    var $$container = $$(page.container);
                    $$(page.navbarInnerContainer).find('.user-name').text(_user.first_name + ' ' + _user.last_name);
                    if ($$container.data('opened') == true) {
                        var $scope = angular.element($$container[0]).scope();
                        $scope.setUser(_user);
                    } else {
                        var rootElement = angular.element(document);
                        rootElement.ready(function () {
                            rootElement.injector().invoke(["$compile", function ($compile) {
                                var scope = angular.element(page.container).scope();
                                $compile(page.container)(scope);
                                var $scope = angular.element($$container[0]).scope();
                                $scope.setUser(_user);
                                $$container.data('opened', true);
                            }]);
                        });
                    }
                    is_opening = false;
                    fw7App.hideIndicator();
                });
                fw7App.getCurrentView().router.loadPage({
                    url: 'pages/friend.html',
                    query: {id: _user.id},
                    pushState: true,
                    animatePages: true
                });
            };

            items[index].openProfile = function () {
                var _link = '',
                    type = '';
                switch (item.type) {
                    case CONTRACT.SOCIAL_LINK_TYPES.VK: {
                        type = 'vk';
                        _link = 'vk://vk.com/id' + item.uid;
                        items[index].link = 'https://vk.com/id' + item.uid;
                        break;
                    }
                    case CONTRACT.SOCIAL_LINK_TYPES.FACEBOOK: {
                        type = 'fb';
                        _link = 'fb://profile/' + item.uid;
                        items[index].link = 'https://facebook.com/' + item.uid;
                        break;
                    }
                    case CONTRACT.SOCIAL_LINK_TYPES.GOOGLE: {
                        type = 'gplus';
                        _link = 'gplus://plus.google.com/u/0/' + item.uid;
                        items[index].link = 'https://plus.google.com/' + item.uid;
                        break;
                    }
                }
                openLink(type, _link, items[index].link);
            }
        });

        return items;
    }

    return {
        'get': function (filters, cb) {
            var _f = prepareFilterQuery(filters),
                _r,
                url = CONTRACT.URLS.API_FULL_PATH + CONTRACT.URLS.USERS_PATH;

            if (_f.data.hasOwnProperty('feed') && _f.data.feed == true) {
                url += CONTRACT.URLS.FEED_PART;
            }
            if (_f.data.hasOwnProperty('friends') && _f.data.friends == true) {
                url += CONTRACT.URLS.FRIENDS_PART;
            }
            if (_f.data.hasOwnProperty('friend_id')) {
                url += '/' + _f.data.friend_id;
            }
            if (_f.data.hasOwnProperty('me')) {
                url += '/me';
            }
            if (_f.data.hasOwnProperty('actions')) {
                url += '/actions';
            }

            $$.ajax({
                url: url,
                data: _f.data,
                success: function (res) {
                    _r = normalize(res.data);
                    cb(_r);
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    fw7App.hideIndicator();
                    fw7App.alert(CONTRACT.ALERTS.REQUEST_ERROR);
                }
            });
        },
        getSettings: function(cb){
            $$.ajax({
                url: CONTRACT.URLS.API_FULL_PATH + CONTRACT.URLS.USERS_PATH + '/settings',
                success: function (res) {
                    var save_in_calendar = permanentStorage.getItem('add-to-calendar');
                    res.data['add-to-calendar'] = save_in_calendar === null ? true : save_in_calendar;
                    cb(res.data);
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    fw7App.hideIndicator();
                    fw7App.alert(CONTRACT.ALERTS.REQUEST_ERROR);
                }
            });
        },
        setSettings: function(values, cb){
            if (values.hasOwnProperty('add-to-calendar')){
                permanentStorage.setItem('add-to-calendar', values['add-to-calendar']);
            }
            if (values.hasOwnProperty('show-to-friends')){
                $$.ajax({
                    url: CONTRACT.URLS.API_FULL_PATH + CONTRACT.URLS.USERS_PATH + '/me/settings',
                    type: 'PUT',
                    data:{'show-to-friends': values['show-to-friends']},
                    success: function (res) {
                        cb(res.data);
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        fw7App.hideIndicator();
                        fw7App.alert(CONTRACT.ALERTS.REQUEST_ERROR);
                    }
                });
            }
        },
        normalize: normalize
    }
}