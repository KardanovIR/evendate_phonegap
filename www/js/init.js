/*jslint browser: true*/
/*global console, Framework7, angular, Dom7*/


var child_browser_opened = false,
    CONTRACT = {
        DATE_FORMAT: 'YYYY-MM-DD',
        ACTION_NAMES: {
            fave: ['добавил(а) в избранное'],
            unfave: ['удалил(а) из избранного'],
            subscribe: ['добавил(а) подписки'],
            unsubscribe: ['удалил(а) подписки']
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
            REQUEST_ERROR: 'Ошибка получения данных с сервера. Попробуйте еще раз.',
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
            GOOGLE: 'vk'
        },
        STATISTICS: {
            EVENT_OPEN_SITE: 'open_site',
            SHARE_FACEBOOK: 'share_fb',
            SHARE_VK: 'share_vk',
            SHARE_TWITTER: 'share_tw',
            FRIEND_VIEW_EVENT_FROM_USER: 'view_event_from_user'
        },
        DEMO_TOKEN: 'CAAYDHIPuIBYBAM26ZBTlCN1k08K7iZCKTrQ1JjFxNdWoGyFkgZAymhrmn5W92aL7XtPD6m2CYu9sSS1a30HA6TjkNyPkvChyyt1wCu7vleuMHbtpro6lJsJDNbAZBfUZCna1bXMULPv4igyZAEz9qvJxeHiUTgOghmklhlQAgAvvrjqi8sEOSWiJn5DbZAwNcUZDundefinedjrR7TyjWPIN3NjfazLy3hdtYOqnmd11tHWR1F0hoznPPpdaV1FNFlb47pfr4W26i',
    },
    __os = navigator.platform == 'Win32' ? 'win' : 'hz',
    permanentStorage = window.localStorage,
    tempStorage = window.sessionStorage,
    URLs = {
        VK: 'https://oauth.vk.com/authorize?client_id=5029623&scope=groups,friends,email,wall,offline,pages,photos,groups&redirect_uri=http://evendate.ru/vkOauthDone.php?mobile=true&response_type=token',
        FACEBOOK: 'https://www.facebook.com/dialog/oauth?client_id=1692270867652630&response_type=token&scope=public_profile,email,user_friends&display=popup&redirect_uri=http://evendate.ru/fbOauthDone.php?mobile=true',
        GOOGLE: 'https://accounts.google.com/o/oauth2/auth?scope=email profile https://www.googleapis.com/auth/plus.login &redirect_uri=http://evendate.ru/googleOauthDone.php?mobile=true&response_type=token&client_id=403640417782-lfkpm73j5gqqnq4d3d97vkgfjcoebucv.apps.googleusercontent.com'
    },
    __device_id = null,
    __user,
    __api,
    __app,
    __to_open_event,
    ONE_SIGNAL_APP_ID = '7471a586-01f3-4eef-b989-c809700a8658',
    __run_after_init = function () {
    },
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
String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
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
    fw7App.addView('.view-profile', fw7ViewOptions);
    fw7App.addView('.view-events', fw7ViewOptions);
    fw7App.addView('.view-favorites', fw7ViewOptions);
    fw7App.addView('.view-friends', fw7ViewOptions);


    __app.controller('CalendarPageController', ['$scope', MyApp.pages.CalendarPageController]);

    __app.controller('SubscriptionsPageController', ['$scope', MyApp.pages.SubscriptionsPageController]);
    __app.controller('FavoritesPageController', ['$scope', MyApp.pages.FavoritesPageController]);
    __app.controller('FriendsTabController', ['$scope', MyApp.pages.FriendsTabController]);


    __app.controller('EventPageController', ['$scope', MyApp.pages.EventPageController]);
    __app.controller('OrganizationPageController', ['$scope', MyApp.pages.OrganizationPageController]);
    __app.controller('FriendPageController', ['$scope', MyApp.pages.FriendPageController]);
    __app.controller('EventsInDayController', ['$scope', '$element', MyApp.pages.EventsInDayController]);
    __app.controller('UsersPageController', ['$scope', '$element', MyApp.pages.UsersPageController]);
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
        if (window.hasOwnProperty('socket')) {
            socket.on('connect', function () {
                registerSuccessHandler(socket.id);
            });
        } else {
            registerSuccessHandler(null);
        }
    } else {
        //
        // function initPushwoosh() {
        //     try{
        //         var pushNotification = cordova.require("com.pushwoosh.plugins.pushwoosh.PushNotification");
        //         //set push notification callback before we initialize the plugin
        //         document.addEventListener('push-notification', function(event) {
        //             //get the notification payload
        //             var notification = event.notification;
        //             //display alert to the user for example
        //             if (notification.onStart == false){
        //                 fw7App.addNotification({
        //                     title: notification.aps.alert,
        //                     hold: 5000,
        //                     closeIcon: true,
        //                     subtitle: '',
        //                     message: notification.userdata.body,
        //                     media: '<img width="44" height="44" src="' + notification.userdata.icon + '">',
        //                     onClick: function(){
        //                         __api.events.get([
        //                             {id: notification.userdata.event_id}
        //                         ], function(res){
        //                             res[0].open();
        //                         })
        //                     }
        //                 });
        //             }else{
        //                 __api.events.get([
        //                     {id: notification.userdata.event_id}
        //                 ], function(res){
        //                     res[0].open();
        //                 })
        //             }
        //         });
        //     }catch(e){
        //         registerSuccessHandler(null);
        //     }
        //
        //     try{
        //         pushNotification.getLaunchNotification(function(payload){
        //             __to_open_event = payload;
        //             openNotification();
        //         });
        //         //initialize the plugin
        //         pushNotification.onDeviceReady({pw_appid: "3874F-0C5E5"});
        //
        //         //register for pushes
        //         pushNotification.registerDevice(
        //             function(status) {
        //                 registerSuccessHandler(status['deviceToken']);
        //             },
        //             function(status) {
        //                 registerSuccessHandler(null);
        //             }
        //         );
        //     }catch(e){
        //         registerSuccessHandler(null);
        //     }
        // }
        //

        // window.plugins.OneSignal.setLogLevel({logLevel: 4, visualLevel: 4});

        var notificationOpenedCallback = function (json_data) {
            L.log(json_data);
            var id;
            switch (json_data.additionalData.type) {
                case 'events':
                {
                    id = json_data.additionalData.event_id;
                    break;
                }
                case 'organizations':
                {
                    id = json_data.additionalData.organization_id;
                    break;
                }
                case 'users':
                {
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
                    }
                });
            } else {
                __to_open_event = (function(type, id){
                    __api[type].get([
                        {id: id}
                    ], function (items) {
                        items[0].open();
                    });
                    __to_open_event = null;
                })(json_data.additionalData.type, id);
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
    StatusBar.styleBlackTranslucent();
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
    __app = angular.module('Evendate', []);
    $$('.main-tabbar').removeClass('hidden');
    var viewInstance = fw7App.getViewByName('events');
    viewInstance.showNavbar();
    viewInstance.showToolbar();
    fw7App.setView('events');
    $$('.view-main').addClass('tab');

    var scope = angular.element($$('#profile')).scope();
    scope.$apply(function () {
        scope.setUser();
    });

    var calendar_scope = angular.element($$('#calendar')).scope();
    calendar_scope.$apply(function () {
        calendar_scope.startBinding();
        calendar_scope.getMyTimeline(true);
    });

    var favorites_scope = angular.element($$('#favorites')).scope();
    favorites_scope.$apply(function () {
        favorites_scope.startBinding();
    });

    var friends_scope = angular.element($$('#friends')).scope();
    friends_scope.$apply(function () {
        friends_scope.showFeed(true);
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

        $toolbar.removeClass('toolbar-item-0 toolbar-item-1 toolbar-item-2 toolbar-item-3');

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

    $$('#view-events-tab-link').addClass('active')
        .on('click', function () {
            if (subscriptions_updated) {
                var calendar_scope = angular.element($$('#calendar')).scope();
                subscriptions_updated = false;
                calendar_scope.$apply(function () {
                    calendar_scope.startBinding();
                });
            }
        });

    __is_ready = true;
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
    })
};

function showSlides(to_reset) {
    $$('.splash-icon').addClass('hidden');
    $$('.swiper-container').removeClass('hidden');
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

    var mySwiper = fw7App.swiper('.swiper-container', {
        pagination: '.swiper-pagination',
        preloadImages: true,
        parallax: true,
        paginationHide: false,
        onReachEnd: function (swiper) {
            $$('.swiper-pagination').hide();
        }
    });

    if (to_reset) mySwiper.slideTo(5, 0);

    $$('.vk-btn, .facebook-btn, .google-btn')
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
        tags: new Tags(),
        organizations_users: new OrganizationsUsers()
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