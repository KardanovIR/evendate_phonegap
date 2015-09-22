/*jslint browser: true*/
/*global console, Framework7, angular, Dom7*/


var CONTRACT = {
        URLS:{
            BASE_NAME: 'http://evendate.ru',
            API_FULL_PATH: 'http://evendate.ru/api',
            USERS_PATH: '/users',
            SUBSCRIPTIONS_PATH: '/subscriptions',
            ORGANIZATIONS_PATH: '/organizations',
            EVENTS_PATH: '/events',
            TAGS_PATH: '/tags',
            MY_PART: '/my'
        },
        DB:{
            NAME: 'evendate.db',
            VERSION: -1,
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
                    USER_ID: 'tag_id',
                    CREATED_AT: 'created_at',
                    UPDATED_AT: 'updated_at'
                }
            }
        }
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
    fw7App;


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

    var fw7ViewOptions = {
        dynamicNavbar: true,
        domCache: true
    };

    __app = angular.module('MyApp', []);

    MyApp = MyApp || { views: [] };

    fw7App.addView('.view-main', fw7ViewOptions);
    fw7App.addView('.view-profile', fw7ViewOptions);
    fw7App.addView('.view-events', fw7ViewOptions);
    fw7App.addView('.view-favorites', fw7ViewOptions);


//    new myapp.pages.CalendarPageController(fw7App, $$);

    __api = initAPI();
    __app.controller('SubscriptionsPageController', ['$scope', '$http', MyApp.pages.SubscriptionsPageController]);
    __app.controller('CalendarPageController', ['$scope', '$http', MyApp.pages.CalendarPageController]);

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
                'FOREIGN KEY(' + CONTRACT.DB.FIELDS.EVENTS_TAGS.TAG_ID + ') REFERENCES ' + CONTRACT.DB.TABLES.TAGS + '(' + CONTRACT.DB.FIELDS.TAGS._ID + ')'
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
                'FOREIGN KEY(' + CONTRACT.DB.FIELDS.ORGANIZATIONS_USERS.USER_ID + ') REFERENCES ' + CONTRACT.DB.TABLES.USERS + '(' + CONTRACT.DB.FIELDS.USERS._ID + ')'
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
                                    });
                                });
                            });
                        });
                    });
                });
            })
        });
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
    var url_parts = url.split('?'),
        search_object = url_parts.length > 1 ? getSearchAsObject(url_parts[1]) : null;
    permanentStorage.setItem('token', search_object['token']);
    checkToken();
}



function openApplication(){
    __app = angular.module('Evendate', []);
    $$('.main-tabbar').removeClass('hidden');
    var viewsElement = $$('.view-events')[0],
        viewInstance = viewsElement.f7View;
    viewInstance.showNavbar();
    viewInstance.showToolbar();
    $$('.view').removeClass('active');
    $$(viewsElement).addClass('active');
    $$('.view-main').addClass('tab');

    var scope = angular.element($$('#profile')).scope();
    scope.$apply(function () {
        scope.setUser();
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
}

function showSlides(){

    fw7App.swiper('.swiper-container', {
        pagination:'.swiper-pagination'
    });


    $$('.vk-btn').off('click').on('click',function() {
        L.log('Btn clicked');

        var win = window.open(URLs.VK, '_blank', 'menubar=no,location=no,resizable=no,scrollbars=no,status=no');
        setInterval(function(){
            console.log(win);
        }, 20000);
        if (__os == 'win'){
        }else{
            window.plugins.ChildBrowser.showWebPage(URLs.VK, {
                showLocationBar: false,
                showAddress: true,
                showNavigationBar: true
            });
            L.log('showWebPageCaaled');
            window.plugins.ChildBrowser.onLocationChange = function(url) {
                if (/mobileAuthDone/.test(url)) {
                    saveTokenInLocalStorage(url);
                    window.plugins.ChildBrowser.close();
                }
            };
        }

    });
}

function checkToken(){
    if (__os == 'win'){
       // permanentStorage.setItem('token', '859cb46b98a25834865a9a9f17ce005429da9b6d16295426d0e79f458e989ff7424b394e0dbbdf9e9cf8eb95668f93447413809SZtIHWnHnXx6gb42L2VXpk7IncMC1NBLpOSGJl7vBjCS57Vm49pv8DGDIS98023G');
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
                        dataType: "json"
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
        subscriptions: new Subscriptions(),
        favorite_events: new FavoriteEvents(),
        tags: new Tags()
    }
}

function prepareFilterQuery(filters){

    if (!Array.isArray(filters)){
        return {
            query: '',
            args: []
        };
    }
    var _q = [],
        args = [];

    filters.forEach(function(_value){
        if (!_value) return true;
        for (var key in _value){
            if (_value.hasOwnProperty(key)){
                var value = _value[key];
                if (value.toLowerCase().trim() == 'null' || value.toLowerCase().trim() == 'not null'){
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
        args: args
    };
}

function Users(){
    return {
        'get': function(){

        },
        'post': function(){

        }
    }
}

function Events(){
    return {
        getById: function(){

        },
        getAll: function(){

        }
    }
}


function FavoriteEvents(){
    return {
        getAll: function(){

        },
        getById: function(){

        },
        getByEventId: function(){

        }
    }
}

function Tags(){
    return {
        getAll: function(){

        },
        getById: function(){

        }
    }
}