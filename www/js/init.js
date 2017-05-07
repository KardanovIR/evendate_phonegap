/*jslint browser: true*/
/*global console, Framework7, angular, Dom7*/

String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

var child_browser_opened = false,
    CONTRACT = {
        DATE_FORMAT: 'YYYY-MM-DD',
        ACTION_NAMES: {
            fave: {male: 'добавил в избранное', female: 'добавила в избранное', default: 'добавил(а) в избранное'},
            unfave: {male: 'удалил из избранного', female: 'удалила из избранного', default: 'удалил(а) из избранного'},
            subscribe: {male: 'добавил подписки', female: 'добавила подписки', default: 'добавил(а) подписки'},
            unsubscribe: {male: 'удалил подписки', female: 'удалила подписки', default: 'удалил(а) подписки'}
        },
        URLS: {
            BASE_NAME: 'https://evendate.ru',
            API_FULL_PATH: 'https://evendate.ru/api/v1',
            USERS_PATH: '/users',
            SUBSCRIPTIONS_PATH: '/subscriptions',
            ORGANIZATIONS_PATH: '/organizations',
            CITIES_PATH: '/cities',
            EVENTS_PATH: '/events',
            TICKETS_PATH: '/tickets',
            DATES_PATH: '/dates',
            TAGS_PATH: '/tags',
            MY_PART: '/my',
            FAVORITES_PART: '/favorites',
            NOTIFICATIONS_PART: '/notifications',
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
    __os = navigator.platform == 'Win32' || !window.plugins ? 'win' : 'hz',
    permanentStorage = window.localStorage,
    URLs,
    __device_id = null,
    __user,
    __api,
    __app,
    __authorized = false,
    __table_exists,
    __to_open_event,
    __addToCalendar = function () {
        var cal = window.plugins.calendar;
        var title = "New Years party";
        var loc = "The Club";
        var notes = "Bring pizza.";
        var start = new Date(2017, 0, 1, 20, 0, 0, 0, 0); // Jan 1st, 2017 20:00
        var end = new Date(2017, 0, 1, 22, 0, 0, 0, 0);   // Jan 1st, 2017 22:00
        var calendarName = "MyCal";

        var success = function (message) {
            alert("Success: " + JSON.stringify(message))
        };
        var error = function (message) {
            alert("Error: " + message)
        };

        cal.createEventInNamedCalendar(title, loc, notes, start, end, calendarName, success, error);
    },
    __setHttpsUsage = function () {
        if (permanentStorage.getItem('use-https') == 'false') {
            CONTRACT.URLS.BASE_NAME = 'http://evendate.ru';
            CONTRACT.URLS.API_FULL_PATH = 'http://evendate.ru/api/v1';
        } else {
            CONTRACT.URLS.BASE_NAME = 'https://evendate.ru';
            CONTRACT.URLS.API_FULL_PATH = 'https://evendate.ru/api/v1';
        }
    },
    __events_indicator = {
        count: 0,
        setCount: function (count) {
            this.count = count;
            this.updateView();
        },
        updateView: function () {
            var $$indicator = $$('.evendate-notification');
            if (this.count <= 0) {
                $$indicator.removeClass('new-events');
            } else {
                $$indicator.addClass('new-events');
            }
        },
        add: function (count) {
            this.count += count;
            this.updateView();
        }
    },
    __organizations = {
        city_id: null,
        city_changed: true,
        cities: {
            get: function (data, callback) {
                $$.ajax({
                    url: CONTRACT.URLS.API_FULL_PATH + CONTRACT.URLS.ORGANIZATIONS_PATH + CONTRACT.URLS.CITIES_PATH,
                    data: data,
                    success: function (res) {
                        callback(res.data);
                    }
                });
            },
            getId: function () {
                if (__organizations.city_id) return __organizations.city_id;
                return permanentStorage.getItem('city_id', __organizations.city_id);
            },
            set: function (city_id) {
                __organizations.city_id = city_id;
                __organizations.city_changed = true;
                permanentStorage.setItem('city_id', __organizations.city_id);
            }
        },
        getList: function (callback) {
            if (this.list.length != 0 && this.city_changed !== true) {
                callback(this.list);
                return;
            } else {
                this.city_changed = false;
            }
            var _this = this;
            __api.organizations.get([{
                fields: 'description,is_new,is_subscribed,default_address,background_medium_img_url,img_medium_url,subscribed_count,',
                city_id: __organizations.cities.getId()
            }], function (data) {

                _this.list = [];
                _this.list_with_keys = {
                    is_new: {
                        name: 'Новые организации',
                        organizations: [],
                        id: 'is_new'
                    }
                };

                data.forEach(function (org) {
                    var key = '_' + org.type_id;
                    if (!_this.list_with_keys.hasOwnProperty(key)) {
                        _this.list_with_keys[key] = {
                            name: org.type_name,
                            organizations: [],
                            id: key
                        };
                    }

                    if (org.hasOwnProperty('is_new') && org.is_new == true) {
                        _this.list_with_keys.is_new.organizations.push(org);
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
            angular.element($$('#catalog')).scope().updateOrganizationsList();
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
    window.socket = io.connect('http://test.evendate.ru:8443');
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

var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
var eventer = window[eventMethod];
var messageEvent = eventMethod == "attachEvent" ? "onmessage" : "message";

// Listen to message from child window
eventer(messageEvent, function (e) {
    console.log(e);
    try {
        var data = JSON.parse(e.data);
        if (data.token) {
            permanentStorage.setItem('token', data.token);
            window.location.reload();
        }
    } catch (e) {
    }
}, false);


function showAuthorizationModal() {
    fw7App.popup('.popup-authorization');
    $$('.vk-btn,.google-btn,.facebook-btn')
        .off('click')
        .on('click', function () {
            var type = $$(this).data('type');
            if (child_browser_opened) return false;
            child_browser_opened = true;
            if (window.plugins) {
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
            } else {
                window.open(URLs[type], '_blank')
            }
        });

}

function hideAuthorizationModal() {
    fw7App.closeModal('.popup-authorization');
}

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
        pushState: false,
        scrollTopOnStatusbarClick: true,
        statusbarOverlay: true,
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

    __app = angular.module('MyApp', ['gajus.swing'])
        .controller('card-stack-playground', function ($scope) {
            $scope.events = [];

        });


    // fw7App.addView('.view-main', fw7ViewOptions);
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
    __app.controller('TicketsController', ['$scope', '$element', MyApp.pages.TicketsController]);


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


    var current_page = '';
    $$('.registration-text').on('click', function () {
        var $$container = $$(current_page.container);
        var _event = angular.element($$container[0]).scope().event;
        _event.showRegistrationForm();
    });

    window.updateFavoriteBtn = function (_event) {
        var $$btn = $$('.event-bottom-bar .toggle-favorite>i');
        var updClasses = function (event) {
            if (event.is_favorite) {
                $$btn.addClass('is_favorite').removeClass('ion-ios-star-outline').addClass('ion-ios-star');
            } else {
                $$btn.removeClass('is_favorite').addClass('ion-ios-star-outline').removeClass('ion-ios-star');
            }
        };
        updClasses(_event);
        $$btn.off('click').on('click', function () {
            if (!__authorized) {
                showAuthorizationModal();
            } else {
                _event = _event.toggleFavorite();
                updClasses(_event);
            }
        });
    };

    window.updateRegistrationInfo = function (_event) {
        var reg_text = 'Открыть страницу';
        if (_event.registration_required === true) {
            if (_event.ticketing_locally === true && _event.registration_available) {
                reg_text = 'Купить билеты';
            } else if (_event.registration_locally === true && _event.registration_available) {
                reg_text = 'Зарегистрироваться';
            }
        }
        $$('.registration-text').text(reg_text);
    };

    $$('.show-notifications').on('click', function () {
        if (!__authorized) {
            showAuthorizationModal();
            return;
        }
        var $$container = $$(fw7App.getCurrentView().activePage.container);
        var $scope = angular.element($$container[0]).scope();
        $scope.showNotificationsList();
    });

    $$('#viewport').css('height', (window.innerHeight - 130) + 'px');

    fw7App.onPageAfterAnimation('*', function (page) {
        current_page = page;
        if (page.name == 'event') {
            $$('.event-bottom-bar').removeClass('hidden');
            $$('.main-tabbar').addClass('hidden');
        } else {
            $$('.event-bottom-bar').addClass('hidden');
            $$('.main-tabbar').removeClass('hidden');
        }
    });
}());


document.addEventListener("deviceready", onDeviceReady, false);
if (__os == 'win') {
    (function () {
        document.addEventListener("load", onDeviceReady, false);
        onDeviceReady();
    })();
}

function onImgErrorSmall(source) {
    source.src = "img/icon.png";
    source.onerror = "";
    return true;
}

function onImgErrorPattern(source) {
    source.src = "img/port_pattern.png";
    source.onerror = "";
    return true;
}


function openLink(prefix, link, http_link) {
    if (window.appAvailability) {
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

function resetAccount() {
    checkToken(true);
}

function onDeviceReady() {

    if (window.hasOwnProperty('SafariViewController')){
        SafariViewController.isAvailable(function (avail) {
            L.log(avail ? "YES" : "NO");
        });
        SafariViewController.show({
            url: "https://en.wikipedia.org/wiki/Safari"
        });
    }else{
        L.log('SafariViewController does not exist');
    }


    __setHttpsUsage();
    __api = initAPI();
    moment.locale("ru");


    registerPushService();

    if (window.StatusBar) {
        StatusBar.overlaysWebView(true);
        StatusBar.styleDefault();
    }

    if (window.facebookConnectPlugin) {
        $$('.facebook-btn')
            .off('click')
            .on('click', function () {
                facebookConnectPlugin.login(['public_profile', 'email', 'user_friends'],
                    function (response) {
                        if (response.status == 'connected') {
                            fw7App.showIndicator();
                            var ref = window.open('https://evendate.ru/oAuthDone.php?mobile=true&type=facebook&access_token=' + response.authResponse.accessToken, '_blank', 'hidden=yes');

                            ref.addEventListener('loadstop', function (e) {
                                L.log(e);
                                if (/mobileAuthDone/.test(e.url)) {
                                    saveTokenInLocalStorage(e.url);
                                    fw7App.hideIndicator();
                                }
                            });
                        } else {
                            fw7App.alert('Извините, мы не смогли Вас авторизовать. Попробуйте еще раз или другую соц. сеть.');
                        }
                    },
                    function (error_text) {
                        fw7App.alert('Произошла ошибка. Описание: ' + error_text);
                    });
            });
    }
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

function showNotificationsList() {
    angular.element($$('.page.event.page-on-center')).scope().showNotificationsList();
}

function hashToObject() {
    var pairs = window.location.hash.substring(1).split("&"),
        obj = {},
        pair,
        i;
    for (i in pairs) {
        if (pairs.hasOwnProperty(i)) {
            if (pairs[i] === '') continue;

            pair = pairs[i].split("=");
            obj[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
        }
    }
    return obj;
}


function openApplication() {

    angular.element($$('#profile')).scope().setUser();

    angular.element($$('#calendar')).scope().startBinding();

    angular.element($$('#catalog')).scope().getOrganizationsCatalog();

    angular.element($$('#feeds')).scope().startBinding(function () {

        $$('.main-tabbar').removeClass('hidden');
        var viewInstance = fw7App.getViewByName('events');
        viewInstance.showNavbar();
        viewInstance.showToolbar();
        fw7App.setView('events');
        $$('#timeline-tab-link').click();
        // $$('.view-main').addClass('tab');
        angular.element($$('#friends')).scope().startBinding(true);

        var _data = hashToObject(),
            _loc = window.location.hash;
        if (_loc.indexOf('event') !== -1){
            __api.events.get([
                {id: _data.event_id}
            ], function(res){
                res[0].open();
            })
        }else if (_loc.indexOf('organization') !== -1){
            __api.organizations.get([
                {id: _data.organization_id}
            ], function(res){
                res[0].open();
            })
        }
    });

    $$('.main-tabbar .toolbar-inner a').on('click', function () {

        var $toolbar = $$('.main-tabbar .toolbar-inner'),
            $$this = $$(this);

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

        if (!__authorized && ($$this.attr('id') == 'friends-tabbar-link' || $$this.attr('id') == 'profile-tabbar-link')) {
            return false;
        }

        $toolbar.find('.active-icon.active').removeClass('active').addClass('hidden');
        $toolbar.find('.muted-icon').addClass('active').removeClass('hidden');

        $$this.find('.muted-icon').removeClass('active').addClass('hidden');
        $$this.find('.active-icon').addClass('active').removeClass('hidden');

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

    if (__os == 'win') {
        $$('.statusbar-overlay').addClass('hidden');
    }

    if (!__authorized) {
        $$('#friends-tabbar-link, .tab-link.view-profile')
            .on('click', function (e) {
                showAuthorizationModal();
                e.stopPropagation();
                e.preventDefault();
                return false;
            })
    } else {
        $$('#friends-tabbar-link').on('click', function () {
            $$('#view-friends .tab-link.active').click();
        });
    }
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
    // $$('.view-main').removeClass('tab');
    $$('.main-tabbar .tab-link').removeClass('active');
    $$('.main-tabbar .toolbar-inner').removeClass('toolbar-item-0').addClass('toolbar-item-1');

    $$('.main-tabbar').addClass('hidden');
    var viewsElement = $$('.view-events')[0],
        viewInstance = viewsElement.f7View;
    viewInstance.hideNavbar();
    viewInstance.hideToolbar();
    $$('.view').removeClass('active');
    // $$('.view-main').removeClass('active');
}

function checkToken(to_reset) {

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
            complete: function (res) {
                try {
                    var json_res = JSON.parse(res);
                    __authorized = true;
                } catch (e) {
                    try{
                        json_res = JSON.parse(res.responseText);

                    }catch(e2){
                        fw7App.hideIndicator();
                        $$('.preloader-indicator-modal').removeClass('with-top');
                        $$.ajaxSetup({
                            dataType: "json",
                            contentType: 'application/x-www-form-urlencoded'
                        });
                        openApplication();
                        return;
                    }
                }

                fw7App.hideIndicator();
                $$('.preloader-indicator-modal').removeClass('with-top');
                if (!json_res || json_res.status == false) {
                    $$.ajaxSetup({
                        dataType: "json",
                        contentType: 'application/x-www-form-urlencoded'
                    });
                    openApplication();

                } else {
                    __authorized = true;
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
        $$.ajaxSetup({
            dataType: "json",
            contentType: 'application/x-www-form-urlencoded'
        });
        setTimeout(openApplication, 1);
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
        tickets: new Tickets(),
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
    window.plugins.socialsharing.share('Я пользуюсь Evendate, чтобы не пропустить интересные события в своих любимых местах.', null, 'http://evendate.ru/app/img/logo_500.png', 'http://evendate.ru');
}