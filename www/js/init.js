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
                SUBSCRIPTIONS: 'subscriptions',
                EVENTS: 'events',
                FAVORITE_EVENTS: 'favorite_events',
                EVENTS_TAGS: 'events_tags',
                TAGS: 'tags'
            },
            FIELDS: {
                USERS: {
                    FIRST_NAME: 'first_name',
                    LAST_NAME: 'last_name',
                    MIDDLE_NAME: 'middle_name',
                    AVATAR_URL: 'avatar_url',
                    _ID: 'id'
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
                    TYPE_ID: 'type_id'
                },
                SUBSCRIPTIONS: {
                    _ID: 'id',
                    ORGANIZATION_ID: 'organization_id'
                },
                FAVORITE_EVENTS: {
                    _ID: 'id',
                    EVENT_ID: 'event_id',
                    EVENT_DATE: 'event_date'
                },
                TAGS: {
                    _ID: 'id',
                    NAME: 'name'
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
                    END_TIME: 'end_time'
                },
                EVENTS_TAGS: {
                    _ID: 'id',
                    EVENT_ID: 'event_id',
                    TAG_ID: 'tag_id'
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

    window.L = {
        log: function(text){
            myapp.alert(text);
        }
    };
    L.log('STARTED');

    return exports;

}());

document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady(){

    L.log('READY');
    var db_version = window.localStorage.getItem('db_version');
    __db = window.sqlitePlugin.openDatabase({name: CONTRACT.DB.NAME, location: 2});


    L.log('VERSION: ' + CONTRACT.DB.VERSION);
    if (db_version != CONTRACT.DB.VERSION || CONTRACT.DB.VERSION == -1){
        updateDBScheme();
        window.localStorage.setItem('db_version', CONTRACT.DB.VERSION);
    }
}

function dropTables(table_names){

    L.log('DROP TABLED');
    if (table_names == null || table_names.length == 0) return true;

    __db.transaction(function(tx){
        table_names.forEach(function(tbl_name){
            if (CONTRACT.DB.TABLES.hasOwnProperty(tbl_name)){
                L.log('DROP TABLE IF EXISTS ' + tbl_name);
                tx.executeSql('DROP TABLE IF EXISTS ' + tbl_name);
            }
        });
    });
}

function updateDBScheme() {
    L.log('UPDATE SCHEMA');
    dropTables(['USERS', 'ORGANIZATIONS','SUBSCRIPTIONS',
        'EVENTS', 'FAVORITE_EVENTS', 'TAGS']);
    var q_create_users = 'CREATE TABLE ' + CONTRACT.DB.TABLES.USERS + '(' +
            [
                CONTRACT.DB.FIELDS.USERS._ID + ' INTEGER PRIMARY KEY',
                CONTRACT.DB.FIELDS.USERS.FIRST_NAME + ' TEXT',
                CONTRACT.DB.FIELDS.USERS.LAST_NAME + ' TEXT',
                CONTRACT.DB.FIELDS.USERS.MIDDLE_NAME + ' TEXT',
                CONTRACT.DB.FIELDS.USERS.AVATAR_URL + ' TEXT',
            ].join(',') +
        ')',
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
            ].join(',') +
            ')';

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