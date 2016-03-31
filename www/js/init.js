/*jslint browser: true*/
/*global console, Framework7, angular, Dom7*/


var child_browser_opened = false,
    CONTRACT = {
        DATE_FORMAT: 'YYYY-MM-DD',
        ACTION_NAMES: {
            fave:           ['добавил(а) в избранное'],
            unfave:         ['удалил(а) из избранного'],
            subscribe:      ['добавил(а) подписки'],
            unsubscribe:    ['удалил(а) подписки']
        },
        URLS: {
            BASE_NAME: 'http://dev.evendate.org',
            API_FULL_PATH: 'http://dev.evendate.org/api/v1',
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
        FRIEND_TYPE_NAMES:{
            vk: 'ВКонтакте',
            google: 'Google +',
            fb: 'Facebook'
        },
        ALERTS: {
            NO_INTERNET: 'Отсутствует соединение с сервером',

        },
        DB:{
            NAME: 'evendate.db',
            VERSION: 2,
            TABLES: {
                USERS: 'users',
                ORGANIZATIONS: 'organizations',
                EVENTS: 'events',
                FAVORITE_EVENTS: 'favorite_events',
                TAGS: 'tags',
                EVENTS_USERS: 'events_users',
                EVENTS_TAGS: 'events_tags',
                ORGANIZATIONS_USERS: 'organizations_users'
            },
            FIELDS: {
                USERS: {
                    _ID: 'id',
                    FIRST_NAME: 'first_name',
                    LAST_NAME: 'last_name',
                    MIDDLE_NAME: 'middle_name',
                    AVATAR_URL: 'avatar_url',
                    TYPE: 'type',
                    FRIEND_UID: 'friend_uid',
                    LINK: 'link',
                    CREATED_AT: 'created_at',
                    UPDATED_AT: 'updated_at'
                },
                ORGANIZATIONS: {
                    _ID: 'id',
                    NAME: 'name',
                    IMG_URL: 'img_url',
                    IMG: 'img',
                    SHORT_NAME: 'short_name',
                    BACKGROUND_IMG_URL: 'background_img_url',
                    DESCRIPTION: 'description',
                    TYPE_NAME: 'type_name',
                    TYPE_ID: 'type_id',
                    SUBSCRIPTION_ID: 'subscription_id',
                    SUBSCRIBED_COUNT: 'subscribed_count',
                    BACKGROUND_MEDIUM_IMG_URL: 'background_medium_img_url',
                    BACKGROUND_SMALL_IMG_URL: 'background_small_img_url',
                    IMG_MEDIUM_URL: 'img_medium_url',
                    IMG_SMALL_URL: 'img_small_url',
                    CREATED_AT: 'created_at',
                    UPDATED_AT: 'updated_at'
                },
                EVENTS_DATES:{
                    _ID: 'id',
                    EVENT_ID: 'event_id',
                    EVENT_DATE: 'event_date',
                    STATUS: 'status',
                    CREATED_AT: 'created_at',
                    UPDATED_AT: 'updated_at'
                },
                FAVORITE_EVENTS: {
                    _ID: 'id',
                    EVENT_ID: 'event_id',
                    CREATED_AT: 'created_at',
                    UPDATED_AT: 'updated_at'
                },
                TAGS: {
                    _ID: 'id',
                    NAME: 'name',
                    CREATED_AT: 'created_at',
                    UPDATED_AT: 'updated_at'
                },
                EVENTS: {
                    _ID: 'id',
                    TITLE: 'title',
                    DESCRIPTION: 'description',
                    LOCATION_TEXT: 'location',
                    LOCATION_URI: 'location_uri',
                    LOCATION_JSON: 'location_object',
                    LATITUDE: 'latitude',
                    LONGITUDE: 'longitude',
                    START_DATE: 'event_start_date',
                    END_DATE: 'event_end_date',
                    NOTIFICATIONS: 'notifications_schema_json',
                    ORGANIZATION_ID: 'organization_id',
                    IMAGE_VERTICAL_URL: 'image_vertical_url',
                    IMAGE_HORIZONTAL_URL: 'image_horizontal_url',
                    DETAIL_INFO_URL: 'detail_info_url',
                    BEGIN_TIME: 'begin_time',
                    END_TIME: 'end_time',
                    CREATED_AT: 'created_at',
                    UPDATED_AT: 'updated_at'
                },
                EVENTS_TAGS: {
                    _ID: 'id',
                    EVENT_ID: 'event_id',
                    TAG_ID: 'tag_id',
                    CREATED_AT: 'created_at',
                    UPDATED_AT: 'updated_at'
                },
                EVENTS_USERS: {
                    _ID: 'id',
                    EVENT_ID: 'event_id',
                    USER_ID: 'user_id',
                    CREATED_AT: 'created_at',
                    UPDATED_AT: 'updated_at'
                },
                ORGANIZATIONS_USERS: {
                    _ID: 'id',
                    ORGANIZATION_ID: 'event_id',
                    USER_ID: 'user_id',
                    CREATED_AT: 'created_at',
                    UPDATED_AT: 'updated_at'
                }
            }
        },
        ENTITIES: {
            EVENT: 'event',
            ORGANIZATION: 'organization'
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
        DEMO_TOKEN: 'CAAYDHIPuIBYBAM26ZBTlCN1k08K7iZCKTrQ1JjFxNdWoGyFkgZAymhrmn5W92aL7XtPD6m2CYu9sSS1a30HA6TjkNyPkvChyyt1wCu7vleuMHbtpro6lJsJDNbAZBfUZCna1bXMULPv4igyZAEz9qvJxeHiUTgOghmklhlQAgAvvrjqi8sEOSWiJn5DbZAwNcUZDundefinedjrR7TyjWPIN3NjfazLy3hdtYOqnmd11tHWR1F0hoznPPpdaV1FNFlb47pfr4W26i',
    },
    __db,
    __os = navigator.platform == 'Win32' ? 'win': 'hz',
    permanentStorage = window.localStorage,
    tempStorage = window.sessionStorage,
    URLs = {
        VK: 'https://oauth.vk.com/authorize?client_id=5029623&scope=friends,email,offline,nohttps&redirect_uri=http://evendate.ru/vkOauthDone.php?mobile=true&response_type=code',
        FACEBOOK: 'https://www.facebook.com/dialog/oauth?client_id=1692270867652630&response_type=code&scope=public_profile,email,user_friends&display=popup&redirect_uri=http://evendate.ru/fbOauthDone.php?mobile=true',
        GOOGLE: 'https://accounts.google.com/o/oauth2/auth?scope=email%20profile%20https://www.googleapis.com/auth/plus.login%20&redirect_uri=http://evendate.ru/googleOauthDone.php?mobile=true&response_type=token&client_id=403640417782-lfkpm73j5gqqnq4d3d97vkgfjcoebucv.apps.googleusercontent.com'
    },
    __device_id = null,
    __user,
    __api,
    __app,
    __to_open_event,
    ONE_SIGNAL_APP_ID = '585c1542-9dd7-432b-b033-f541b3192ec6',
    __run_after_init = function(){},
    __is_ready = false,
    $$,
    MyApp = MyApp || {},
    fw7App,
    subscriptions_updated = false,
    callbackObjects = {};

if (window.hasOwnProperty('io')){
    window.socket = io.connect('http://evendate.ru:443');
}
window.L = {
    log: function(data){
        if (window.hasOwnProperty('socket')){
            socket.emit('log', data);
        }else if (__os == 'win'){
            console.log(data)
        }
    }
};
String.prototype.capitalize = function() {
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
        onAjaxStart: function(){
            fw7App.showIndicator();
        },
        onAjaxComplete: function(){
            fw7App.hideIndicator();
        }
    });
    $$ = Dom7;

    fw7App.getViewByName = function(name){
        var _view = null;
        fw7App.views.forEach(function(view){
            if (view.selector == '.view-' + name){
                _view = view;
            }
        });
        return _view;
    };

    fw7App.setView = function(name){
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
    __app.controller('EventsInDayController', ['$scope', '$element',  MyApp.pages.EventsInDayController]);
    __app.controller('UsersPageController', ['$scope', '$element',  MyApp.pages.UsersPageController]);
}());

document.addEventListener("deviceready", onDeviceReady, false);

function makeid(){
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}

if (__os == 'win'){
    (function() {
        tempStorage.clear();
        onDeviceReady();
    })();
}

function openLink(prefix, link, http_link){
    appAvailability.check(
        prefix + '://',
        function(){
            window.open(link, '_system');
        },
        function(){
            window.open(http_link, '_system');

        }
    );
}

function onNotificationAPN (data) {
    cordova.plugins.notification.local.schedule({
        id: data.event_id,
        title: data.title,
        text: data.alert,
        data: data
    });

    cordova.plugins.notification.local.on("click", function(notification) {
        try{
            var _data = JSON.parse(notification.data);
        }catch(e){
            L.log(e);
            return;
        }

        if (__is_ready){
            __api.events.get([{
                id: _data.event_id
            }], function(res){
                res[0].open();
            });
        }else{
        }


    }, this);

    cordova.plugins.notification.local.on("trigger", function(notification) {
        try{
            var _data = JSON.parse(notification.data);
        }catch(e){
            L.log(e);
            return;
        }

        if (__is_ready){
            __api.events.get([{
                id: _data.event_id
            }], function(res){
                res[0].open();
            });
        }else{
            __run_after_init = function(){
                __api.events.get([{
                    id: _data.event_id
                }], function(res){
                    res[0].open();
                });
                __run_after_init = function(){};
            }
        }


    }, this);
}

function registerPushService(){
    if (__os == 'win'){
        if (window.hasOwnProperty('socket')){
            socket.on('connect', function(){
                registerSuccessHandler(socket.id);
            });
        }else{
            registerSuccessHandler(null);
        }
    }else{

        function initPushwoosh() {
            try{
                var pushNotification = cordova.require("com.pushwoosh.plugins.pushwoosh.PushNotification");
                //set push notification callback before we initialize the plugin
                document.addEventListener('push-notification', function(event) {
                    //get the notification payload
                    var notification = event.notification;
                    //display alert to the user for example
                    if (notification.onStart == false){
                        fw7App.addNotification({
                            title: notification.aps.alert,
                            hold: 5000,
                            closeIcon: true,
                            subtitle: '',
                            message: notification.userdata.body,
                            media: '<img width="44" height="44" src="' + notification.userdata.icon + '">',
                            onClick: function(){
                                __api.events.get([
                                    {id: notification.userdata.event_id}
                                ], function(res){
                                    res[0].open();
                                })
                            }
                        });
                    }else{
                        __api.events.get([
                            {id: notification.userdata.event_id}
                        ], function(res){
                            res[0].open();
                        })
                    }
                });
            }catch(e){
                registerSuccessHandler(null);
            }

            try{
                pushNotification.getLaunchNotification(function(payload){
                    __to_open_event = payload;
                    openNotification();
                });
                //initialize the plugin
                pushNotification.onDeviceReady({pw_appid: "3874F-0C5E5"});

                //register for pushes
                pushNotification.registerDevice(
                    function(status) {
                        registerSuccessHandler(status['deviceToken']);
                    },
                    function(status) {
                        registerSuccessHandler(null);
                    }
                );
            }catch(e){
                registerSuccessHandler(null);
            }
        }
        // initPushwoosh();
        window.plugins.OneSignal.setLogLevel({logLevel: 4, visualLevel: 4});
        var notificationOpenedCallback = function(jsonData) {
            L.log('didReceiveRemoteNotificationCallBack: ' + JSON.stringify(jsonData));
            L.log(jsonData);
            onNotificationAPN(jsonData);
        };

        window.plugins.OneSignal.init(ONE_SIGNAL_APP_ID,
            {googleProjectNumber: ""},
            notificationOpenedCallback);
    }
}

function setDemoAccount(){
    permanentStorage.setItem('token', CONTRACT.DEMO_TOKEN);
    permanentStorage.setItem('demo', true);
}

function resetAccount(){
    tempStorage.clear();
    checkToken(true);
}

function onDeviceReady(){

    $$(document).on('ajaxError', function (){
        fw7App.alert(CONTRACT.ALERTS.NO_INTERNET);
    });
    __api = initAPI();
    moment.locale("ru");

    if (window.analytics){
        window.analytics.startTrackerWithId('UA-69300084-1');
    }
    registerPushService();
    StatusBar.styleBlackTranslucent();
}

function registerSuccessHandler(result){
    L.log('device token = ' + result);
    __device_id = result;
    checkToken();
}

function isOnline() {
    if (__os == 'win'){
        return true;
    }
    var networkState = navigator.connection.type;
    return networkState != Connection.NONE;
}

function saveTokenInLocalStorage(url){
    var search_object = $$.parseUrlQuery(url);
    permanentStorage.setItem('token', search_object['token']);
    checkToken();
}

function openNotification(){
    if (__to_open_event != null && __is_ready){
        L.log("launchedNotification");
        if (__to_open_event && __to_open_event.onStart){
            __api.events.get([
                {id: __to_open_event.userdata.event_id}
            ], function(res){
                res[0].open();
            })
        }
    }
}

function openApplication(){
    __app = angular.module('Evendate', []);
    $$('.main-tabbar').removeClass('hidden');
    var viewInstance = fw7App.getViewByName('events');
    viewInstance.showNavbar();
    viewInstance.showToolbar();
    fw7App.setView('events');
    $$('.view-main').addClass('tab');

    var scope = angular.element($$('#profile')).scope();
    scope.$apply(function(){
        scope.setUser();
    });

    var calendar_scope = angular.element($$('#calendar')).scope();
    calendar_scope.$apply(function(){
        calendar_scope.startBinding();
        calendar_scope.getMyTimeline(true);
    });

    var favorites_scope = angular.element($$('#favorites')).scope();
    favorites_scope.$apply(function(){
        favorites_scope.startBinding();
    });

    var friends_scope = angular.element($$('#friends')).scope();
    friends_scope.$apply(function(){
        friends_scope.showFeed(true);
    });


    $$('.main-tabbar .toolbar-inner a').on('click', function(){

        var $toolbar = $$('.main-tabbar .toolbar-inner'),
            $$this = $$(this),
            $$i = $$this.find('i');

        if ($$this.hasClass('active')){
            var max_pages_count = 0;
            if (fw7App.getCurrentView().history.length == 1){
                $$(fw7App.getCurrentView().activePage.container).find('.tab.active').scrollTo(0, 0, 400);
            }else{
                while(fw7App.getCurrentView().history[0] != fw7App.getCurrentView().activePage.url && max_pages_count++ < 500){
                    fw7App.getCurrentView().back({animatePages: fw7App.getCurrentView().history.length == 2});
                }
            }
        }

        $toolbar.removeClass('toolbar-item-0 toolbar-item-1 toolbar-item-2 toolbar-item-3');

        $toolbar.find('i').each(function(){
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
        .on('click', function(){
            if (subscriptions_updated){
                var calendar_scope = angular.element($$('#calendar')).scope();
                subscriptions_updated = false;
                calendar_scope.$apply(function(){
                    calendar_scope.startBinding();
                });
            }
        });

    __is_ready = true;
    openNotification();

}

window.onerror = function sendCrashReport(message, url , linenumber, column, errorObj){
    var stack = '';
    if(errorObj !== undefined) //so it won’t blow up in the rest of the browsers
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

function showSlides(to_reset){
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
        onReachEnd: function(swiper){
            $$('.swiper-pagination').hide();
        }
    });

    if (to_reset) mySwiper.slideTo(5, 0);

    $$('.vk-btn, .facebook-btn, .google-btn')
        .off('click')
        .on('click',function() {
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
        window.plugins.ChildBrowser.onLocationChange = function(url) {
            if (/mobileAuthDone/.test(url)) {
                saveTokenInLocalStorage(url);
                window.plugins.ChildBrowser.close();
            }
        };
    });



    $$('.start-demo-button').on('click', function(){
        setDemoAccount();
        checkToken();
    });

}

function checkToken(to_reset){
    fw7App.showIndicator();
    $$('.preloader-indicator-modal').addClass('with-top');
    if (to_reset){
        permanentStorage.clear();
        token = null;
    }else{
        var token = permanentStorage.getItem('token');
    }
    if (token != null){
        $$.ajax({
            url: CONTRACT.URLS.API_FULL_PATH + CONTRACT.URLS.USERS_PATH + '/me/status',
            headers: {
                'Authorization': token
            },
            data: {
                'device_token': __device_id,
                'client_type': __os == 'win' ? 'browser' : 'ios'
            },
            type: 'PUT',
            dataType: 'JSON',
            success: function(res){
                try{
                    var json_res = JSON.parse(res);
                }catch(e){
                    fw7App.hideIndicator();
                    $$('.preloader-indicator-modal').removeClass('with-top');
                    showSlides(to_reset);
                    return;
                }

                fw7App.hideIndicator();
                $$('.preloader-indicator-modal').removeClass('with-top');
                if (json_res.status == false){
                    showSlides(to_reset);
                }else{
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
            error: function(){
                fw7App.hidePreloader();
                fw7App.alert('Отсутствует интернет соединение');
                showSlides();
            }
        });
    }else{
        fw7App.hideIndicator();
        $$('.preloader-indicator-modal').removeClass('with-top');
        showSlides(to_reset);
    }
}

function initAPI(){
    return {
        users: new Users(),
        organizations: new Organizations(),
        events: new Events(),
        event_tags: new EventTags(),
        event_dates: new EventDates(),
        subscriptions: new Subscriptions(),
        favorite_events: new FavoriteEvents(),
        tags: new Tags(),
        organizations_users:new OrganizationsUsers()
    }
}

function prepareFilterQuery(filters){
    if (!Array.isArray(filters)){
        return {
            args: [],
            data: {}
        };
    }
    var args = [],
        data = {};

    filters.forEach(function(_value){
        if (!_value) return true;
        for (var key in _value){
            if (_value.hasOwnProperty(key)){
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

function shareInfoAboutApp(){
    window.plugins.socialsharing.share('Я пользуюсь Evendate, чтобы не пропустить интересные события в своих любимых местах.', null, 'http://evendate.ru/app/img/logo_500.png', 'http://evendate.ru')
}