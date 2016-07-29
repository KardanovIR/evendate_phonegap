/*jslint browser: true*/
/*global console, Framework7, angular, Dom7*/

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

var child_browser_opened = false,
    CONTRACT = {
        DATE_FORMAT: 'YYYY-MM-DD',
        ACTION_NAMES: {
            fave: {male: 'добавил в избранное', female: 'добавила в избранное', default: 'добавил(а) в избранное'},
            unfave: {male: 'удалил из избранного', female: 'удалила из избранного', default: 'удалил(а) из избранного'},
            subscribe: {male: 'добавил подписки', female: 'добавила подписки', default: 'добавил(а) подписки'},
            unsubscribe: {male: 'добавил в избранное', female: 'добавила в избранное', default: 'удалил(а) подписки'}
        },
        URLS: {
            BASE_NAME: 'http://evendate.ru',
            API_FULL_PATH: 'http://evendate.ru/api/v1',
            USERS_PATH: '/users',
            SUBSCRIPTIONS_PATH: '/subscriptions',
            ORGANIZATIONS_PATH: '/organizations',
            EVENTS_PATH: '/events',
            DATES_PATH: '/dates',
            TAGS_PATH: '/tags',
            MY_PART: '/my',
            FAVORITES_PART: '/favorites',
            RECOMMENDATIONS_PART: '/recommendations',
            FEED_PART: '/feed',
            FRIENDS_PART: '/friends',
            ACTIONS_PART: '/actions',
            SUBSCRIPTIONS_PART: '/subscriptions'
        },
        FRIEND_TYPE_NAMES: {
            'vk.com': 'ВКонтакте',
            google: 'Google',
            facebook: 'Facebook'
        },
        ALERTS: {
            NO_INTERNET: 'Отсутствует соединение с сервером',
            REQUEST_ERROR: 'Ошибка получения данных с сервера. Попробуйте еще раз.'
        },
        ENTITIES: {
            EVENT: 'event',
            ORGANIZATION: 'organization',
            FRIEND: 'friend'
        },
        TEXTS: {
            EVENTS: {
                NOM: ' событие',
                GEN: ' события',
                PLU: ' событий'
            },
            FAVORITES: {
                NOM: ' избранное',
                GEN: ' избранных',
                PLU: ' избранных'
            },
            SUBSCRIBED: {
                NOM: ' подписчик',
                GEN: ' подписчика',
                PLU: ' подписчиков'
            }
        },
        SOCIAL_LINK_TYPES: {
            VK: 'vk',
            FACEBOOK: 'facebook',
            GOOGLE: 'google'
        },
        STATISTICS: {
            EVENT_OPEN_SITE: 'open_site',
            ORGANIZATION_OPEN_SITE: 'open_site',
            SHARE_FACEBOOK: 'share_fb',
            SHARE_VK: 'share_vk',
            SHARE_TWITTER: 'share_tw',
            OPEN_MAP: 'open_map',
            OPEN_NOTIFICATION: 'open_notification',
            FRIEND_VIEW_EVENT_FROM_USER: 'view_event_from_user'
        },
        DEMO_TOKEN: 'CAAYDHIPuIBYBAM26ZBTlCN1k08K7iZCKTrQ1JjFxNdWoGyFkgZAymhrmn5W92aL7XtPD6m2CYu9sSS1a30HA6TjkNyPkvChyyt1wCu7vleuMHbtpro6lJsJDNbAZBfUZCna1bXMULPv4igyZAEz9qvJxeHiUTgOghmklhlQAgAvvrjqi8sEOSWiJn5DbZAwNcUZDundefinedjrR7TyjWPIN3NjfazLy3hdtYOqnmd11tHWR1F0hoznPPpdaV1FNFlb47pfr4W26i',
    },
    __os = navigator.platform == 'Win32' ? 'win' : 'hz',
    permanentStorage = window.localStorage,
    tempStorage = window.sessionStorage,
    URLs,
    __device_id = null,
    __user,
    __api,
    __app,
    __to_open_event,
    __organizations = {
        getList: function (callback) {
            if (this.list.length != 0) {
                callback(this.list);
                return;
            }
            var _this = this;
            __api.organizations.get([{
                fields: 'description,is_subscribed,default_address,background_medium_img_url,img_medium_url,subscribed_count,'
            }], function (data) {

                _this.list = [];

                data.forEach(function (org) {
                    var key = '_' + org.type_id;
                    if (!_this.list_with_keys.hasOwnProperty(key)) {
                        _this.list_with_keys[key] = {
                            name: org.type_name,
                            organizations: []
                        };
                    }
                    _this.list_with_keys[key].organizations.push(org);
                });
                _this.updateListByKeys();
                if (callback) {
                    callback(_this.list);
                }
            });
        },
        updateListByKeys: function () {
            this.list = [];
            for (var key in this.list_with_keys) {
                if (this.list_with_keys.hasOwnProperty(key)) {
                    this.list.push(this.list_with_keys[key]);
                }
            }
        },
        list: [],
        list_with_keys: {},
        update: function (organization) {
            if (this.list.length == 0) return;
            var key = '_' + organization.type_id,
                _this = this;
            this.list_with_keys[key].organizations.forEach(function (org, index) {
                if (org.id == organization.id) {
                    _this.list_with_keys[key].organizations[index] = organization;
                }
            });
            this.updateListByKeys();
            angular.element($$('#catalog')).scope().getOrganizationsCatalog();
        }
    },
    ONE_SIGNAL_APP_ID = '7471a586-01f3-4eef-b989-c809700a8658',
    __is_ready = false,
    $$,
    MyApp = MyApp || {},
    fw7App,
    subscriptions_updated = false,
    callbackObjects = {};

if (window.hasOwnProperty('io')) {
    window.socket = io.connect('http://evendate.ru:443');
}
window.L = {
    log: function (data) {
        if (window.hasOwnProperty('socket')) {
            socket.emit('log', data);
        } else if (__os == 'win') {
            console.log(data)
        }
    }
};


function getUnitsText(num, cases) {
    num = Math.abs(num);

    var word = '';

    if (num.toString().indexOf('.') > -1) {
        word = cases.GEN;
    } else {
        word = (
            num % 10 == 1 && num % 100 != 11
                ? cases.NOM
                : num % 10 >= 2 && num % 10 <= 4 && (num % 100 < 10 || num % 100 >= 20)
                ? cases.GEN
                : cases.PLU
        );
    }

    return word;
}

MyApp.init = (function () {
    'use strict';


    // Initialize app
    fw7App = new Framework7({
        modalTitle: 'Evendate',
        modalButtonOk: 'OK',
        modalButtonCancel: 'Отмена',
        modalPreloaderTitle: 'Загрузка...',
        imagesLazyLoadThreshold: 50,
        animateNavBackIcon: true,
        swipeBackPage: true,
        dynamicNavbar: true,
        scrollTopOnStatusbarClick: true,
        statusbarOverlay: true,
        onAjaxStart: function () {
            fw7App.showIndicator();
        },
        onAjaxComplete: function () {
            fw7App.hideIndicator();
        },
        onAjaxError: function (e) {
            if (e.status != 200 && e.requestUrl.indexOf(CONTRACT.URLS.BASE_NAME) != -1) {
                fw7App.alert(CONTRACT.ALERTS.NO_INTERNET);
            }
        }
    });
    $$ = Dom7;

    fw7App.getViewByName = function (name) {
        var _view = null;
        fw7App.views.forEach(function (view) {
            if (view.selector == '.view-' + name) {
                _view = view;
            }
        });
        return _view;
    };

    fw7App.setView = function (name) {
        var viewInstance = fw7App.getViewByName(name);
        $$('.view').removeClass('active');
        $$(viewInstance.container).addClass('active');
    };


    var fw7ViewOptions = {
        dynamicNavbar: true,
        domCache: true
    };

    __app = angular.module('MyApp', []);

    fw7App.addView('.view-main', fw7ViewOptions);
    fw7App.addView('.view-catalog', fw7ViewOptions);
    fw7App.addView('.view-calendar', fw7ViewOptions);
    fw7App.addView('.view-events', fw7ViewOptions);
    fw7App.addView('.view-friends', fw7ViewOptions);
    fw7App.addView('.view-profile', fw7ViewOptions);


    __app.controller('CalendarPageController', ['$scope', MyApp.pages.CalendarPageController]);
    __app.controller('ProfilePageController', ['$scope', MyApp.pages.ProfilePageController]);
    __app.controller('CatalogPageController', ['$scope', MyApp.pages.CatalogPageController]);
    __app.controller('FeedsPageController', ['$scope', '$timeout', MyApp.pages.FeedsPageController]);
    __app.controller('FriendsTabController', ['$scope', MyApp.pages.FriendsTabController]);


    __app.controller('EventPageController', ['$scope', MyApp.pages.EventPageController]);
    __app.controller('OrganizationPageController', ['$scope', '$element', MyApp.pages.OrganizationPageController]);
    __app.controller('FriendPageController', ['$scope', MyApp.pages.FriendPageController]);
    __app.controller('EventsInDayController', ['$scope', '$element', MyApp.pages.EventsInDayController]);
    __app.controller('UsersPageController', ['$scope', '$element', MyApp.pages.UsersPageController]);
    __app.controller('OnboardingPageController', ['$scope', '$element', MyApp.pages.OnboardingPageController]);


    __app.directive('loader', function () {
        return {
            template: '<div class="mask-loading">' +
            '<div class="spinner">' +
            '<div class="double-bounce1"></div>' +
            '<div class="double-bounce2"></div>' +
            '</div>' +
            '</div>',
            replace: true
        };
    })
        .directive('pullToRefresh', function () {
            return {
                template: '<div class="pull-to-refresh-layer">' +
                '<div class="mask-loading">' +
                '<div class="spinner">' +
                '<div class="double-bounce1"></div>' +
                '<div class="double-bounce2"></div>' +
                '</div>' +
                '</div>' +
                '<div class="pull-to-refresh-arrow"></div>' +
                '</div>',
                replace: true
            };
        })
        .directive('infiniteScroll', function () {
            return {
                restrict: 'AE',
                template: '<div class="infinite-scroll-preloader">' +
                '<div class="mask-loading">' +
                '<div class="spinner">' +
                '<div class="double-bounce1"></div>' +
                '<div class="double-bounce2"></div>' +
                '</div>' +
                '</div>' +
                '</div>',
                replace: true
            };
        })
        .directive('eventCard', function () {
            return {
                templateUrl: './templates/tmplEventCard.html',
                replace: true
            }
        })
        .directive('eventCardSmall', function () {
            return {
                templateUrl: './templates/tmplEventCardSmall.html',
                replace: true
            }
        })
        .directive('organizationItem', function () {
            return {
                templateUrl: './templates/tmplOrganizationListItem.html',
                replace: false
            }
        });
}());

document.addEventListener("deviceready", onDeviceReady, false);

function onImgErrorSmall(source) {
    source.src = "img/icon_500.png";
    source.onerror = "";
    return true;
}

function onImgErrorPattern(source) {
    source.src = "img/port_pattern.png";
    source.onerror = "";
    return true;
}

if (__os == 'win') {
    (function () {
        tempStorage.clear();
        onDeviceReady();
    })();
}


function openLink(prefix, link, http_link) {
    if (appAvailability) {
        appAvailability.check(
            prefix + '://',
            function () {
                window.open(link, '_system');
            },
            function () {
                window.open(http_link, '_system');
            }
        );
    } else {
        window.open(http_link, '_system');
    }
}

function registerPushService() {
    if (__os == 'win') {

        $$.ajax({
            url: CONTRACT.URLS.BASE_NAME + '/auth.php?action=get_urls&mobile=true',
            dataType: 'JSON',
            success: function (res) {
                var urls = JSON.parse(res).data;
                URLs = {
                    VK: urls.vk,
                    GOOGLE: urls.google,
                    FACEBOOK: urls.facebook
                };
            },
            error: function () {
                fw7App.alert('Отсутствует интернет соединение');
            }
        });


        if (window.hasOwnProperty('socket')) {
            socket.on('connect', function () {
                registerSuccessHandler(socket.id);
            });
        } else {
            registerSuccessHandler(null);
        }
    } else {
        fw7App.hidePreloader();
        $$.ajax({
            url: CONTRACT.URLS.BASE_NAME + '/auth.php?action=get_urls&mobile=true',
            dataType: 'JSON',
            success: function (res) {

                var urls = JSON.parse(res).data;
                URLs = {
                    VK: urls.vk,
                    GOOGLE: urls.google,
                    FACEBOOK: urls.facebook
                };

                var notificationOpenedCallback = function (json_data) {
                    L.log(json_data);
                    var id;
                    switch (json_data.additionalData.type) {
                        case 'events': {
                            id = json_data.additionalData.event_id;
                            break;
                        }
                        case 'organizations': {
                            id = json_data.additionalData.organization_id;
                            break;
                        }
                        case 'users': {
                            id = json_data.additionalData.user_id;
                            break;
                        }
                    }

                    if (json_data.isActive) {
                        fw7App.addNotification({
                            title: json_data.message,
                            hold: 5000,
                            closeIcon: true,
                            subtitle: '',
                            message: json_data.additionalData.title,
                            media: '<img width="44" height="44" src="' + json_data.additionalData.organization_logo + '">',
                            onClick: function () {
                                __api[json_data.additionalData.type].get([
                                    {id: id}
                                ], function (items) {
                                    items[0].open();
                                });
                                storeStat(id, json_data.additionalData.type, CONTRACT.STATISTICS.OPEN_NOTIFICATION);
                            }
                        });
                    } else {
                        (function (type, id) {
                            __to_open_event = function () {
                                __api[type].get([
                                    {id: id}
                                ], function (items) {
                                    L.log(items);
                                    items[0].open();
                                });
                                storeStat(id, type, CONTRACT.STATISTICS.OPEN_NOTIFICATION);
                                __to_open_event = null;
                            };
                        })(json_data.additionalData.type, id);
                        L.log('saving_to_open_event');
                        openNotification();
                    }
                };

                window.plugins.OneSignal.init(ONE_SIGNAL_APP_ID,
                    {googleProjectNumber: '', autoRegister: true},
                    notificationOpenedCallback);


                // window.plugins.OneSignal.enableInAppAlertNotification(true);

                window.plugins.OneSignal.getIds(function (ids) {
                    L.log(ids);
                    if (ids.hasOwnProperty('userId')) {
                        registerSuccessHandler(ids.userId);
                    } else {
                        registerSuccessHandler(null);
                    }
                });
            },
            error: function () {
                fw7App.alert('Отсутствует интернет соединение');
            }
        });
    }
}

function setDemoAccount() {
    permanentStorage.setItem('token', CONTRACT.DEMO_TOKEN);
    permanentStorage.setItem('demo', true);
}

function resetAccount() {
    tempStorage.clear();
    checkToken(true);
}

function onDeviceReady() {
    __api = initAPI();
    moment.locale("ru");

    registerPushService();

    StatusBar.overlaysWebView(true);
    StatusBar.styleDefault();

    $$('')
        .off('click')
        .on('click', function () {
            window.plugins.googleplus.isAvailable(
                function (available) {
                    L.log('available:', available);
                }
            );

            window.plugins.googleplus.login(
                {
                    'scopes': 'email profile https://www.googleapis.com/auth/plus.login', // optional, space-separated list of scopes, If not included or empty, defaults to `profile` and `email`.
                    'webClientId': '403640417782-lfkpm73j5gqqnq4d3d97vkgfjcoebucv.apps.googleusercontent.com', // optional clientId of your Web application from Credentials settings of your project - On Android, this MUST be included to get an idToken. On iOS, it is not required.
                    'offline': true // optional, but requires the webClientId - if set to true the plugin will also return a serverAuthCode, which can be used to grant offline access to a non-Google server
                },
                function (obj) {
                    L.log(JSON.stringify(obj)); // do something useful instead of alerting
                },
                function (msg) {
                    L.log('error: ' + msg);
                }
            );
        });

    $$('.facebook-btn')
        .off('click')
        .on('click', function () {
            facebookConnectPlugin.login(['public_profile', 'email', 'user_friends'],
                function (response) {
                    L.log('success: ');
                    L.log(response);
                },
                function (response) {
                    L.log('error: ');
                    L.log(response);
                });
        });

}

function registerSuccessHandler(result) {
    L.log('device token = ' + result);
    __device_id = result;
    checkToken();
}

function isOnline() {
    if (__os == 'win') {
        return true;
    }
    var networkState = navigator.connection.type;
    return networkState != Connection.NONE;
}

function saveTokenInLocalStorage(url) {
    var search_object = $$.parseUrlQuery(url);
    permanentStorage.setItem('token', search_object['token']);
    checkToken();
}

function openNotification() {
    if (__to_open_event != null && __is_ready) {
        __to_open_event();
        __to_open_event = null;
    }
}

function openApplication() {

    $$('.main-tabbar').removeClass('hidden');
    var viewInstance = fw7App.getViewByName('events');
    viewInstance.showNavbar();
    viewInstance.showToolbar();
    fw7App.setView('events');
    $$('.view-main').addClass('tab');


    angular.element($$('#profile')).scope().setUser();

    angular.element($$('#calendar')).scope().startBinding(function () {
        angular.element($$('#catalog')).scope().getOrganizationsCatalog();
    });

    angular.element($$('#feeds')).scope().startBinding(function () {
        angular.element($$('#friends')).scope().showFeed(true);
    });



    $$('.main-tabbar .toolbar-inner a').on('click', function () {

        var $toolbar = $$('.main-tabbar .toolbar-inner'),
            $$this = $$(this),
            $$i = $$this.find('i');

        if ($$this.hasClass('active')) {
            var max_pages_count = 0;
            if (fw7App.getCurrentView().history.length == 1) {
                $$(fw7App.getCurrentView().activePage.container).find('.tab.active').scrollTo(0, 0, 400);
            } else {
                while (fw7App.getCurrentView().history[0] != fw7App.getCurrentView().activePage.url && max_pages_count++ < 500) {
                    fw7App.getCurrentView().back({animatePages: fw7App.getCurrentView().history.length == 2});
                }
            }
        }

        $toolbar.removeClass('toolbar-item-0 toolbar-item-1 toolbar-item-2 toolbar-item-3 toolbar-item-4');

        $toolbar.find('i').each(function () {
            var $$this_i = $$(this);
            $$this_i
                .removeClass($$this_i.data('active-icon'))
                .addClass($$this_i.data('icon'));
        });

        $$i
            .removeClass($$i.data('icon'))
            .addClass($$i.data('active-icon'));

        $toolbar.addClass('animated');
        $toolbar.addClass('toolbar-item-' + $$this.data('number'));
    });


    __is_ready = true;
    L.log(__to_open_event);
    openNotification();

    window.__stats = [];

    window.storeStat = function (entity_id, entity_type, event_type) {
        window.__stats.push({
            entity_id: entity_id,
            entity_type: entity_type,
            event_type: event_type
        });
    };

    setInterval(function () {
        if (window.__stats.length != 0) {
            var batch = window.__stats;
            window.__stats = [];
            $$.ajax({
                url: CONTRACT.URLS.API_FULL_PATH + '/statistics/batch',
                data: JSON.stringify(batch),
                type: 'POST',
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                error: function () {
                    window.__stats.concat(batch);
                }
            });
        }
    }, 10000);
}

window.onerror = function sendCrashReport(message, url, linenumber, column, errorObj) {
    var stack = '';
    if (errorObj !== undefined) //so it won’t blow up in the rest of the browsers
        stack = errorObj.stack;
    L.log({
        message: message,
        url: url,
        linenumber: linenumber,
        column: column,
        errorObj: errorObj,
        stack: stack
    });
};

function showSlides(to_reset) {
    $$('.splash-icon').addClass('hidden');
    $$('.auth-page-content').addClass('auth-grey');
    $$('.view-main').removeClass('tab');
    $$('.main-tabbar .tab-link').removeClass('active');
    $$('.main-tabbar .toolbar-inner').removeClass('toolbar-item-0').addClass('toolbar-item-1');

    $$('.main-tabbar').addClass('hidden');
    var viewsElement = $$('.view-events')[0],
        viewInstance = viewsElement.f7View;
    viewInstance.hideNavbar();
    viewInstance.hideToolbar();
    $$('.view').removeClass('active');
    $$('.view-main').removeClass('active');

    if (window.VkSdk){
        VkSdk.init('5029623');
    }

    $$('.google-btn')
        .off('click')
        .on('click', function () {
            var type = $$(this).data('type');
            if (child_browser_opened) return false;
            child_browser_opened = true;
            window.plugins.ChildBrowser.showWebPage(URLs[type], {
                showLocationBar: true,
                showAddress: true,
                showNavigationBar: true
            });
            window.plugins.ChildBrowser.onClose = function () {
                child_browser_opened = false;
            };
            window.plugins.ChildBrowser.onLocationChange = function (url) {
                if (/mobileAuthDone/.test(url)) {
                    saveTokenInLocalStorage(url);
                    window.plugins.ChildBrowser.close();
                }
            };
        });

    $$('.vk-btn').on('click', function(){
        VkSdk.initiateLogin(['groups','friends','email','wall','offline','pages','photos']);
    });

    document.addEventListener('vkSdk.newToken', function(token) {
        L.log('New token is ' + token);
    });

    $$('.start-demo-button').on('click', function () {
        setDemoAccount();
        checkToken();
    });

}

function checkToken(to_reset) {
    fw7App.showIndicator();
    $$('.preloader-indicator-modal').addClass('with-top');
    L.log(window.device);
    if (to_reset) {
        permanentStorage.clear();
        token = null;
    } else {
        var token = permanentStorage.getItem('token');
    }
    if (token != null) {
        L.log('DOING AJAX WITH ' + __device_id);
        $$.ajax({
            url: CONTRACT.URLS.API_FULL_PATH + CONTRACT.URLS.USERS_PATH + '/me/devices',
            headers: {
                'Authorization': token
            },
            data: {
                'device_token': __device_id,
                'client_type': __os == 'win' ? 'browser' : 'ios',
                'model': window.device ? window.device.model : null,
                'os_version': window.device ? window.device.version : null
            },
            type: 'PUT',
            dataType: 'JSON',
            success: function (res) {
                try {
                    var json_res = JSON.parse(res);
                } catch (e) {
                    fw7App.hideIndicator();
                    $$('.preloader-indicator-modal').removeClass('with-top');
                    showSlides(to_reset);
                    return;
                }

                fw7App.hideIndicator();
                $$('.preloader-indicator-modal').removeClass('with-top');
                if (json_res.status == false) {
                    showSlides(to_reset);
                } else {
                    permanentStorage.setItem('user', JSON.stringify(json_res.data));
                    __user = json_res.data;
                    $$.ajaxSetup({
                        headers: {
                            'Authorization': token
                        },
                        dataType: "json",
                        contentType: 'application/x-www-form-urlencoded'
                    });

                    openApplication();
                }
            },
            error: function () {
                fw7App.hidePreloader();
                fw7App.alert('Отсутствует интернет соединение');
                showSlides();
            }
        });
    } else {
        fw7App.hideIndicator();
        $$('.preloader-indicator-modal').removeClass('with-top');
        showSlides(to_reset);
    }
}

function initAPI() {
    return {
        users: new Users(),
        organizations: new Organizations(),
        events: new Events(),
        event_tags: new EventTags(),
        event_dates: new EventDates(),
        subscriptions: new Subscriptions(),
        favorite_events: new FavoriteEvents(),
        tags: new Tags()
    }
}

function prepareFilterQuery(filters) {
    if (!Array.isArray(filters)) {
        return {
            args: [],
            data: {}
        };
    }
    var args = [],
        data = {};

    filters.forEach(function (_value) {
        if (!_value) return true;
        for (var key in _value) {
            if (_value.hasOwnProperty(key)) {
                data[key] = _value[key];
                var value = String(_value[key]);
                args.push(value.trim());
            }
        }
    });

    return {
        args: args,
        data: data
    };
}

function shareInfoAboutApp() {
    window.plugins.socialsharing.share('Я пользуюсь Evendate, чтобы не пропустить интересные события в своих любимых местах.', null, 'http://evendate.ru/app/img/logo_500.png', 'http://evendate.ru')
}