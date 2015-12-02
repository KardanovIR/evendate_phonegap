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
            BASE_NAME: 'http://evendate.ru',
            API_FULL_PATH: 'http://evendate.ru/api',
            USERS_PATH: '/users',
            SUBSCRIPTIONS_PATH: '/subscriptions',
            ORGANIZATIONS_PATH: '/organizations',
            EVENTS_PATH: '/events',
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
        DEMO_TOKEN: 'ya29.PAJ7pMBnNhvLGvrTQXzOmUQl_n3WpXyBYFj8R42zTCN97RUfhryEQrR921NqobUR02__ALqlcRMmTQo6aFftS8bM7MZLBXeQpRAtClABTvhmJN7szd2gJVwg0FLsc0889waOrXJMZFKeyx',
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
    __device_id,
    __user,
    __api,
    __app,
    __to_open_event,
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
        }else{
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


            pushNotification.getLaunchNotification(function(payload){
                __to_open_event = payload;
                openNotification();
            });

            //initialize the plugin
            pushNotification.onDeviceReady({pw_appid: "3874F-0C5E5"});

            //register for pushes
            pushNotification.registerDevice(
                function(status) {
                    var deviceToken = status['deviceToken'];
                    L.log('registerDevice: ' + deviceToken);
                    registerSuccessHandler(deviceToken);
                },
                function(status) {
                    L.log('failed to register : ' + JSON.stringify(status));
                    L.log(JSON.stringify(['failed to register ', status]));
                }
            );
        }
        initPushwoosh();

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
    __api = initAPI();
    moment.locale("ru");
    //window.open = cordova.InAppBrowser.open;
    if (window.analytics){
        window.analytics.startTrackerWithId('UA-69300084-1');
    }
    var db_version = window.localStorage.getItem('db_version');
    if (__os == 'win'){
        __db = window.openDatabase(CONTRACT.DB.NAME + '-' + makeid(), CONTRACT.DB.NAME, CONTRACT.DB.NAME, 5000, function(){
            if (db_version != CONTRACT.DB.VERSION){
                window.localStorage.setItem('db_version', CONTRACT.DB.VERSION);
                updateDBScheme();
            }else{
                registerPushService();
            }
        });
    }else{
        StatusBar.styleBlackTranslucent();
        __db = window.sqlitePlugin.openDatabase({name: CONTRACT.DB.NAME, location: 2});
        if (db_version != CONTRACT.DB.VERSION){ // schema updated
            window.localStorage.setItem('db_version', CONTRACT.DB.VERSION);
            updateDBScheme();
        }else{
            registerPushService();
        }
    }
}

function dropTables(table_names, callback){

    if (table_names == null || table_names.length == 0) return true;

    var tables_dropped = 0;
    function dropDone(){
        tables_dropped++;
        if (tables_dropped == table_names.length){
            if (callback instanceof Function){
                callback();
            }
        }
    }

    __db.transaction(function(tx){
        table_names.forEach(function(tbl_name){
            if (CONTRACT.DB.TABLES.hasOwnProperty(tbl_name)){
                tx.executeSql('DROP TABLE IF EXISTS ' + CONTRACT.DB.TABLES[tbl_name], [], dropDone);
            }else{
                dropDone();
            }
        });
    });
}

function fillWithInitialData(){
    registerPushService();
}

function createTables(){ // create new schema
    var q_create_users = 'CREATE TABLE ' + CONTRACT.DB.TABLES.USERS + '(' +
            [
                CONTRACT.DB.FIELDS.USERS._ID + ' INTEGER PRIMARY KEY',
                CONTRACT.DB.FIELDS.USERS.FIRST_NAME + ' TEXT',
                CONTRACT.DB.FIELDS.USERS.LAST_NAME + ' TEXT',
                CONTRACT.DB.FIELDS.USERS.MIDDLE_NAME + ' TEXT',
                CONTRACT.DB.FIELDS.USERS.AVATAR_URL + ' TEXT',
                CONTRACT.DB.FIELDS.USERS.LINK + ' TEXT',
                CONTRACT.DB.FIELDS.USERS.TYPE + ' TEXT',
                CONTRACT.DB.FIELDS.USERS.FRIEND_UID + ' TEXT',
                CONTRACT.DB.FIELDS.USERS.CREATED_AT + ' INTEGER',
                CONTRACT.DB.FIELDS.USERS.UPDATED_AT + ' INTEGER'
            ].join(' , ') + ')',
        q_create_organizations = 'CREATE TABLE ' + CONTRACT.DB.TABLES.ORGANIZATIONS + '(' +
            [
                CONTRACT.DB.FIELDS.ORGANIZATIONS._ID + ' INTEGER PRIMARY KEY',
                CONTRACT.DB.FIELDS.ORGANIZATIONS.BACKGROUND_IMG_URL + ' TEXT',
                CONTRACT.DB.FIELDS.ORGANIZATIONS.IMG_URL + ' TEXT',
                CONTRACT.DB.FIELDS.ORGANIZATIONS.DESCRIPTION + ' TEXT',
                CONTRACT.DB.FIELDS.ORGANIZATIONS.NAME + ' TEXT',
                CONTRACT.DB.FIELDS.ORGANIZATIONS.SHORT_NAME + ' TEXT',
                CONTRACT.DB.FIELDS.ORGANIZATIONS.TYPE_NAME + ' TEXT',
                CONTRACT.DB.FIELDS.ORGANIZATIONS.TYPE_ID + ' INTEGER ',
                CONTRACT.DB.FIELDS.ORGANIZATIONS.SUBSCRIPTION_ID + ' INTEGER ',
                CONTRACT.DB.FIELDS.ORGANIZATIONS.SUBSCRIBED_COUNT + ' INTEGER ',
                CONTRACT.DB.FIELDS.ORGANIZATIONS.CREATED_AT + ' INTEGER',
                CONTRACT.DB.FIELDS.ORGANIZATIONS.UPDATED_AT + ' INTEGER'
            ].join(' , ') + ')',
        q_create_favorite_events = 'CREATE TABLE ' + CONTRACT.DB.TABLES.FAVORITE_EVENTS + '(' +
            [
                CONTRACT.DB.FIELDS.FAVORITE_EVENTS._ID + ' INTEGER PRIMARY KEY',
                CONTRACT.DB.FIELDS.FAVORITE_EVENTS.EVENT_ID + ' TEXT',
                CONTRACT.DB.FIELDS.FAVORITE_EVENTS.CREATED_AT + ' INTEGER',
                CONTRACT.DB.FIELDS.TAGS.UPDATED_AT + ' INTEGER',
                'FOREIGN KEY(' + CONTRACT.DB.FIELDS.FAVORITE_EVENTS.EVENT_ID + ') REFERENCES ' + CONTRACT.DB.TABLES.EVENTS + '(' + CONTRACT.DB.FIELDS.EVENTS._ID + ')'
            ].join(',') + ')',
        q_create_tags = 'CREATE TABLE ' + CONTRACT.DB.TABLES.TAGS + '(' +
            [
                CONTRACT.DB.FIELDS.TAGS._ID + ' INTEGER PRIMARY KEY',
                CONTRACT.DB.FIELDS.TAGS.NAME + ' TEXT',
                CONTRACT.DB.FIELDS.TAGS.CREATED_AT + ' INTEGER',
                CONTRACT.DB.FIELDS.TAGS.UPDATED_AT + ' INTEGER'
            ].join(',') + ')',
        q_create_events_tags = 'CREATE TABLE ' + CONTRACT.DB.TABLES.EVENTS_TAGS + '(' +
            [
                CONTRACT.DB.FIELDS.EVENTS_TAGS._ID + ' INTEGER PRIMARY KEY',
                CONTRACT.DB.FIELDS.EVENTS_TAGS.EVENT_ID + ' INTEGER',
                CONTRACT.DB.FIELDS.EVENTS_TAGS.TAG_ID + ' INTEGER',
                CONTRACT.DB.FIELDS.EVENTS_TAGS.CREATED_AT + ' INTEGER',
                CONTRACT.DB.FIELDS.EVENTS_TAGS.UPDATED_AT + ' INTEGER',
                'FOREIGN KEY(' + CONTRACT.DB.FIELDS.EVENTS_TAGS.EVENT_ID + ') REFERENCES ' + CONTRACT.DB.TABLES.EVENTS + '(' + CONTRACT.DB.FIELDS.EVENTS._ID + ')',
                'FOREIGN KEY(' + CONTRACT.DB.FIELDS.EVENTS_TAGS.TAG_ID + ') REFERENCES ' + CONTRACT.DB.TABLES.TAGS + '(' + CONTRACT.DB.FIELDS.TAGS._ID + '), ' +
                'UNIQUE (' + CONTRACT.DB.FIELDS.EVENTS_TAGS.EVENT_ID + ', ' + CONTRACT.DB.FIELDS.EVENTS_TAGS.TAG_ID + ') ON CONFLICT REPLACE '
            ].join(',') + ')',
        q_create_events_users = 'CREATE TABLE ' + CONTRACT.DB.TABLES.EVENTS_USERS + '(' +
            [
                CONTRACT.DB.FIELDS.EVENTS_USERS._ID + ' INTEGER PRIMARY KEY',
                CONTRACT.DB.FIELDS.EVENTS_USERS.EVENT_ID + ' INTEGER',
                CONTRACT.DB.FIELDS.EVENTS_USERS.USER_ID + ' INTEGER',
                CONTRACT.DB.FIELDS.EVENTS_USERS.CREATED_AT + ' INTEGER',
                CONTRACT.DB.FIELDS.EVENTS_USERS.UPDATED_AT + ' INTEGER',
                'FOREIGN KEY(' + CONTRACT.DB.FIELDS.EVENTS_USERS.EVENT_ID + ') REFERENCES ' + CONTRACT.DB.TABLES.EVENTS + '(' + CONTRACT.DB.FIELDS.EVENTS._ID + ')',
                'FOREIGN KEY(' + CONTRACT.DB.FIELDS.EVENTS_USERS.USER_ID + ') REFERENCES ' + CONTRACT.DB.TABLES.USERS + '(' + CONTRACT.DB.FIELDS.USERS._ID + ')'
            ].join(',') + ')',
        q_create_organizations_users = 'CREATE TABLE ' + CONTRACT.DB.TABLES.ORGANIZATIONS_USERS + '(' +
            [
                CONTRACT.DB.FIELDS.ORGANIZATIONS_USERS._ID + ' INTEGER PRIMARY KEY',
                CONTRACT.DB.FIELDS.ORGANIZATIONS_USERS.ORGANIZATION_ID + ' INTEGER',
                CONTRACT.DB.FIELDS.ORGANIZATIONS_USERS.USER_ID + ' INTEGER',
                CONTRACT.DB.FIELDS.ORGANIZATIONS_USERS.CREATED_AT + ' INTEGER',
                CONTRACT.DB.FIELDS.ORGANIZATIONS_USERS.UPDATED_AT + ' INTEGER',
                'FOREIGN KEY(' + CONTRACT.DB.FIELDS.ORGANIZATIONS_USERS.ORGANIZATION_ID + ') REFERENCES ' + CONTRACT.DB.TABLES.ORGANIZATIONS + '(' + CONTRACT.DB.FIELDS.ORGANIZATIONS._ID + ')',
                'FOREIGN KEY(' + CONTRACT.DB.FIELDS.ORGANIZATIONS_USERS.USER_ID + ') REFERENCES ' + CONTRACT.DB.TABLES.USERS + '(' + CONTRACT.DB.FIELDS.USERS._ID + '), ' +
                ' UNIQUE (' + CONTRACT.DB.FIELDS.ORGANIZATIONS_USERS.ORGANIZATION_ID + ', ' + CONTRACT.DB.FIELDS.ORGANIZATIONS_USERS.USER_ID + ') ON CONFLICT REPLACE '
            ].join(',') + ')',
        q_create_events = 'CREATE TABLE ' + CONTRACT.DB.TABLES.EVENTS + '(' +
            [
                CONTRACT.DB.FIELDS.EVENTS._ID + ' INTEGER PRIMARY KEY',
                CONTRACT.DB.FIELDS.EVENTS.TITLE + ' TEXT',
                CONTRACT.DB.FIELDS.EVENTS.DETAIL_INFO_URL + ' TEXT',
                CONTRACT.DB.FIELDS.EVENTS.BEGIN_TIME + ' TEXT',
                CONTRACT.DB.FIELDS.EVENTS.END_TIME + ' TEXT',
                CONTRACT.DB.FIELDS.EVENTS.DESCRIPTION + ' TEXT',
                CONTRACT.DB.FIELDS.EVENTS.START_DATE + ' TEXT',
                CONTRACT.DB.FIELDS.EVENTS.END_DATE + ' TEXT',
                CONTRACT.DB.FIELDS.EVENTS.IMAGE_HORIZONTAL_URL + ' TEXT',
                CONTRACT.DB.FIELDS.EVENTS.IMAGE_VERTICAL_URL + ' TEXT',
                CONTRACT.DB.FIELDS.EVENTS.LATITUDE + ' REAL',
                CONTRACT.DB.FIELDS.EVENTS.LONGITUDE + ' REAL',
                CONTRACT.DB.FIELDS.EVENTS.LOCATION_TEXT + ' TEXT',
                CONTRACT.DB.FIELDS.EVENTS.LOCATION_JSON + ' TEXT',
                CONTRACT.DB.FIELDS.EVENTS.LOCATION_URI + ' TEXT',
                CONTRACT.DB.FIELDS.EVENTS.NOTIFICATIONS + ' TEXT',
                CONTRACT.DB.FIELDS.EVENTS.ORGANIZATION_ID + ' INTEGER',
                CONTRACT.DB.FIELDS.EVENTS.CREATED_AT + ' INTEGER',
                CONTRACT.DB.FIELDS.EVENTS.UPDATED_AT + ' INTEGER'
            ].join(' , ') + ')';

    __db.transaction(function(tx){
        tx.executeSql(q_create_tags, [], function(tx){
            tx.executeSql(q_create_users, [], function(tx){
                tx.executeSql(q_create_organizations, [], function(tx){
                    tx.executeSql(q_create_events, [], function(tx){
                        tx.executeSql(q_create_events_tags, [], function(tx){
                            tx.executeSql(q_create_events_users, [], function(tx){
                                tx.executeSql(q_create_favorite_events, [], function(tx){
                                    tx.executeSql(q_create_organizations_users, [], function(){});
                                });
                            });
                        });
                    });
                });
            })
        });
    });
    registerPushService();
}

function updateDBScheme() { // drop all existing tables\
    dropTables(['USERS', 'ORGANIZATIONS', 'EVENTS', 'FAVORITE_EVENTS',
        'TAGS', 'EVENTS_TAGS', 'EVENTS_USERS', 'ORGANIZATIONS_USERS'], createTables);

}

function registerSuccessHandler(result){
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
            while(fw7App.getCurrentView().history[0] != fw7App.getCurrentView().activePage.url && max_pages_count++ < 500){
                fw7App.getCurrentView().back({animatePages: fw7App.getCurrentView().history.length == 2});
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
            url: CONTRACT.URLS.API_FULL_PATH + CONTRACT.URLS.USERS_PATH + '/device',
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
            query: '',
            args: [],
            data: {}
        };
    }
    var _q = [],
        args = [],
        data = {};

    filters.forEach(function(_value){
        if (!_value) return true;
        for (var key in _value){
            if (_value.hasOwnProperty(key)){
                data[key] = _value[key];
                var value = String(_value[key]);
                if (value.toLowerCase().trim() === 'null' || value.toLowerCase().trim() === 'not null'){
                    _q.push(key + ' IS ' + value.toUpperCase().trim());
                }else{
                    _q.push(key + ' = ?');
                    args.push(value.trim());
                }
            }
        }

    });

    return {
        query: 'WHERE ' + _q.join(' AND '),
        args: args,
        data: data
    };
}

function shareInfoAboutApp(){
    window.plugins.socialsharing.share('Evendate помогает мне быть в курсе событий ', null, null, 'http://evendate.ru')
}