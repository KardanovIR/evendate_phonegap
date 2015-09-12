/*jslint browser: true*/
/*global console, Framework7, angular, Dom7*/


var CONTRACT = {
        URLS:{
            BASE_NAME: 'http://evendate.ru',
            API_FULL_PATH: 'http://evendate.ru/api',
            USERS_PATH: '/users'
        },
        DB:{
            NAME: 'evendate.db',
            VERSION: -1,
            TABLES: {
                USERS: 'users',
                ORGANIZATIONS: 'organizations',
                EVENTS: 'events',
                FAVORITE_EVENTS: 'favorite_events',
                EVENTS_TAGS: 'events_tags',
                TAGS: 'tags',
                EVENTS_USERS: 'events_users',
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
    __user,
    $$,
    myapp = myapp || {},
    fw7App;


window.socket = io.connect('http://evendate.ru:8080');

window.L = {
    log: function(data){
        socket.emit('log', data);
    }
};
String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

myapp.init = (function () {
    'use strict';

    var exports = {};

    (function () {
        // Initialize app
        fw7App = new Framework7({
            modalTitle: 'Evendate',
            modalButtonCancel: 'Отмена',
            modalPreloaderTitle: 'Загрузка ...'
        });
        $$ = Dom7;
        var fw7ViewOptions = {
                dynamicNavbar: true,
                domCache: true
            },
            main_view = fw7App.addView('.view-main', fw7ViewOptions),
            profile_view = fw7App.addView('.view-profile', fw7ViewOptions),
            events_view = fw7App.addView('.view-events', fw7ViewOptions),
            favorites_view = fw7App.addView('.view-favorites', fw7ViewOptions);
        new myapp.pages.IndexPageController(fw7App, $$);
        new myapp.pages.CalendarPageController(fw7App, $$);
    }());

    return exports;

}());

document.addEventListener("deviceready", onDeviceReady, false);

if (__os == 'win'){
    (function() {
        onDeviceReady();
    })();
}

function onDeviceReady(){
    L.log(CONTRACT.DB.VERSION);

    var db_version = window.localStorage.getItem('db_version');
    if (__os == 'win'){
        __db = window.openDatabase(CONTRACT.DB.NAME, '1', '1', 500, function(){
            if (db_version != CONTRACT.DB.VERSION || CONTRACT.DB.VERSION == -1){
                updateDBScheme();
                window.localStorage.setItem('db_version', CONTRACT.DB.VERSION);
            }
        });
    }else{
        __db = window.sqlitePlugin.openDatabase({name: CONTRACT.DB.NAME, location: 2});
        if (db_version != CONTRACT.DB.VERSION || CONTRACT.DB.VERSION == -1){
            updateDBScheme();
            window.localStorage.setItem('db_version', CONTRACT.DB.VERSION);
        }
    }
}

function dropTables(table_names, callback){

    L.log('DROP TABLES');
    L.log(table_names == null);
    L.log(table_names.length);
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

function createTables(){
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

    L.log(q_create_tags);
    __db.transaction(function(tx){
        L.log(q_create_tags);
        tx.executeSql(q_create_tags, [], function(tx, res){
            L.log(JSON.stringify(res));
            L.log(q_create_users);
            tx.executeSql(q_create_users, [], function(tx, res){
                L.log(JSON.stringify(res));
                L.log(q_create_organizations);
                tx.executeSql(q_create_organizations, [], function(tx, res){
                    L.log(JSON.stringify(res));
                    L.log(q_create_events);
                    tx.executeSql(q_create_events, [], function(tx, res){
                        L.log(JSON.stringify(res));
                        L.log(q_create_events_tags);
                        tx.executeSql(q_create_events_tags, [], function(tx, res){
                            L.log(JSON.stringify(res));
                            L.log(q_create_events_users);
                            tx.executeSql(q_create_events_users, [], function(tx, res){
                                L.log(JSON.stringify(res));
                                L.log(q_create_favorite_events);
                                tx.executeSql(q_create_favorite_events, [], function(tx, res){
                                    L.log(JSON.stringify(res));
                                    L.log(q_create_organizations_users);
                                    tx.executeSql(q_create_organizations_users, [], function(tx, res){
                                        L.log(JSON.stringify(res));
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

function updateDBScheme() {
    dropTables(['USERS', 'ORGANIZATIONS', 'EVENTS', 'FAVORITE_EVENTS',
        'TAGS', 'EVENTS_TAGS', 'EVENTS_USERS', 'ORGANIZATIONS_USERS'], createTables);

}

function initAPI(route, method){
    route = route.replace(/^\//, '');
    var module = route.split('/')[0],
        module_instance = new window[module.capitalize()];

    switch(method){
        case 'post': {

            break;
        }
        default:
        case 'get': {
            module_instance.get(route);
            break;
        }
    }
}

function Users(){
    return {
        getById: function(){

        },
        getAll: function(){

        }
    }
}

function Organizations(){
    return {
        getById: function(){

        },
        getAll: function(){

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

function Subscriptions(){
    return {
        getAll: function(){

        },
        getById: function(){

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