/*jslint browser: true*/
/*global console, Framework7, angular, Dom7*/


var child_browser_opened = false,
    CONTRACT = {
        DATE_FORMAT: 'YYYY-MM-DD',
        URLS:{
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
            FRIENDS_PART: '/friends'
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
            VERSION: 1,
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
        DEMO_TOKEN: '1b2f4977fdbc59bbcc8053795cb2a027f4a67cdb52e9387a5c5e23a681567577b85f074057c20b0f721bbc5d0deba417a9c1bdelC8BqCBzrba9ksH8sbw5ynESYabHsttMTaaDZihY3e8CqM1AIZrs0IwH9FmFf0Fb',
    },
    __db,
    __os = navigator.platform == 'Win32' ? 'win': 'hz',
    permanentStorage = window.localStorage,
    URLs = {
        VK: 'https://oauth.vk.com/authorize?client_id=5029623&scope=friends,email,offline,nohttps&redirect_uri=http://evendate.ru/vkOauthDone.php?mobile=true&response_type=code',
        FACEBOOK: 'https://www.facebook.com/dialog/oauth?client_id=1692270867652630&response_type=code&scope=public_profile,email,user_friends&display=popup&redirect_uri=http://evendate.ru/fbOauthDone.php?mobile=true',
        GOOGLE: 'https://accounts.google.com/o/oauth2/auth?scope=email profile https://www.googleapis.com/auth/plus.login &redirect_uri=http://evendate.ru/googleOauthDone.php?mobile=true&response_type=token&client_id=403640417782-lfkpm73j5gqqnq4d3d97vkgfjcoebucv.apps.googleusercontent.com'
    },
    __device_id,
    __user,
    __api,
    __app,
    $$,
    MyApp = MyApp || {},
    fw7App,
    callbackObjects = {};


window.socket = io.connect('http://evendate.ru:443');
window.L = {
    log: function(data){
        socket.emit('log', data);
    }
};
String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};


MyApp.init = (function () {
    'use strict';


    // Initialize app
    fw7App = new Framework7({
        modalTitle: 'Evendate',
        modalButtonOk: 'OK',
        modalButtonCancel: 'Отмена',
        modalPreloaderTitle: 'Загрузка ...',
        imagesLazyLoadThreshold: 50,
        animateNavBackIcon: true,
        swipeBackPage: true,
        dynamicNavbar: true,
        onAjaxStart: function () {
            fw7App.showIndicator();
        },
        onAjaxComplete: function () {
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


    __api = initAPI();
    __app.controller('SubscriptionsPageController', ['$scope', '$http', MyApp.pages.SubscriptionsPageController]);
    __app.controller('CalendarPageController', ['$scope', '$http', MyApp.pages.CalendarPageController]);
    __app.controller('FavoritesPageController', ['$scope', MyApp.pages.FavoritesPageController]);

    __app.controller('EventPageController', ['$scope', MyApp.pages.EventPageController]);
    __app.controller('OrganizationPageController', ['$scope', MyApp.pages.OrganizationPageController]);
    __app.controller('FriendsPageController', ['$scope', MyApp.pages.FriendsPageController]);
    __app.controller('FriendsTabController', ['$scope', MyApp.pages.FriendsTabController]);
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
        onDeviceReady();
    })();
}

function onNotificationAPN (event) {
    if (event.alert){
        navigator.notification.alert(event.alert);
    }
}

function registerPushService(){
    if (__os == 'win'){
        socket.on('connect', function(){
            registerSuccessHandler(socket.id);
        });
    }else{
        var pushNotification = window.plugins.pushNotification;
        pushNotification.register(
            registerSuccessHandler,
            registerErrorHandler,
            {
                "badge":"false",
                "sound":"false",
                "alert":"true",
                "ecb":"onNotificationAPN"
            });
    }
    checkToken();
}

function onDeviceReady(){

    moment.locale("ru");

    var db_version = window.localStorage.getItem('db_version');
    if (__os == 'win'){
        __db = window.openDatabase(CONTRACT.DB.NAME + '-' + makeid(), CONTRACT.DB.NAME, CONTRACT.DB.NAME, 5000, function(){
            if (db_version != CONTRACT.DB.VERSION || CONTRACT.DB.VERSION == -1){
                window.localStorage.setItem('db_version', CONTRACT.DB.VERSION);
                updateDBScheme();
            }else{
                registerPushService();
            }
        });
    }else{
        StatusBar.styleBlackTranslucent();
        __db = window.sqlitePlugin.openDatabase({name: CONTRACT.DB.NAME, location: 2});
        if (db_version != CONTRACT.DB.VERSION || CONTRACT.DB.VERSION == -1){ // schema updated
            window.localStorage.setItem('db_version', CONTRACT.DB.VERSION);
            updateDBScheme();
        }else{
            registerPushService();
        }
    }
}

function dropTables(table_names, callback){

    L.log('DROP TABLES');
    if (table_names == null || table_names.length == 0) return true;

    var tables_dropped = 0;
    function dropDone(){
        tables_dropped++;
        if (tables_dropped == table_names.length){
            L.log('TABLES DROPPED');
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
                                    tx.executeSql(q_create_organizations_users, [], function(){
                                        fillWithInitialData();
                                    }, L.log);
                                }, L.log);
                            }, L.log);
                        }, L.log);
                    }, L.log);
                }, L.log);
            }, L.log)
        }, L.log);
    });
}

function updateDBScheme() { // drop all existing tables\
    dropTables(['USERS', 'ORGANIZATIONS', 'EVENTS', 'FAVORITE_EVENTS',
        'TAGS', 'EVENTS_TAGS', 'EVENTS_USERS', 'ORGANIZATIONS_USERS'], createTables);

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

function registerErrorHandler(result){
    L.log('device token = ' + result);
}

function getSearchAsObject(search) {
    if (search == null) return null;
    return search.replace(/(^\?)/, '').split("&").map(function(n) {
        return n = n.split("="), this[n[0]] = n[1], this
    }.bind({}))[0];
}

function saveTokenInLocalStorage(url){
    var search_object = $$.parseUrlQuery(url);
    permanentStorage.setItem('token', search_object['token']);
    checkToken();
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
    scope.$apply(function () {
        scope.setUser();
    });

    var calendar_scope = angular.element($$('#calendar')).scope();
    calendar_scope.$apply(function () {
        calendar_scope.startBinding();
    });

    var favorites_scope = angular.element($$('#favorites')).scope();
    favorites_scope.$apply(function () {
        favorites_scope.startBinding();
    });

    var friends_scope = angular.element($$('#friends')).scope();
    friends_scope.$apply(function () {
        friends_scope.showFeed(true);
    });
}

window.onerror = function sendCrashReport(message, url , linenumber, column, errorObj){
    var stack = "";
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

function showSlides(){

    var mySwiper = fw7App.swiper('.swiper-container', {
        speed: 400,
        spaceBetween: 0,
        pagination: '.swiper-pagination',
        paginationHide: true,
        paginationClickable: false,
        nextButton: '.swiper-button-next',
        prevButton: '.swiper-button-prev'
    });

    $$('.vk-btn, .facebook-btn, .google-btn')
        .off('click')
        .on('click',function() {
        var type = $$(this).data('type');
        if (child_browser_opened) return false;
        child_browser_opened = true;
        window.plugins.ChildBrowser.showWebPage(URLs[type], {
            showLocationBar: false,
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
            L.log(url);
        };
    });
}

function checkToken(){
    if (__os == 'win'){
        permanentStorage.setItem('token', CONTRACT.DEMO_TOKEN);
    }
    var token = permanentStorage.getItem('token');
    L.log('TOKEN:' + token);
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
                var json_res = JSON.parse(res);
                L.log(json_res);
                if (json_res.status == false){
                    showSlides();
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
        showSlides();
    }
}

function initAPI(){
    return {
        users: new Users(),
        organizations: new Organizations(),
        events: new Events(),
        event_tags: new EventTags(),
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
