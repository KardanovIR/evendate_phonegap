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
            VERSION: 1,
            TABLES: {
                USERS: 'users',
                ORGANIZATIONS: 'organizations',
                SUBSCRIPTIONS: 'subscriptions',
                EVENTS: 'events',
                FAVORITE_EVENTS: 'favorite_events',
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

    return exports;

}());

document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady(){
    var db_version = window.localStorage.getItem('db_version');
    __db = window.sqlitePlugin.openDatabase({name: CONTRACT.DB.NAME, location: 2});
    if (db_version != CONTRACT.DB.VERSION){
        updateDBScheme();
        window.localStorage.setItem('db_version', CONTRACT.DB.VERSION);
    }
}

function dropTables(table_names){

    if (table_names == null || table_names.length == 0) return true;

    __db.transaction(function(tx){
        table_names.forEach(function(tbl_name){
            if (CONTRACT.DB.TABLES.hasOwnProperty(tbl_name)){
                tx.executeSql('DROP TABLE IF EXISTS ' + tbl_name)
            }
        });
    });
}

function updateDBScheme() {
    dropTables(['USERS', 'ORGANIZATIONS','SUBSCRIPTIONS',
        'EVENTS', 'FAVORITE_EVENTS', 'TAGS']);
    var q_create_users_table = 'CREATE TABLE ' + CONTRACT.DB.TABLES.USERS + '(' +
        '' +
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

        }
    }
}

function Organizations(){
    return {

    }
}

function Events(){
    return {

    }
}

function Subscriptions(){
    return {
        getAll: function(){

        }
    }
}

function FavoriteEvents(){
    return {

    }
}

function Tags(){
    return {

    }
}