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
            }
        }
    },
    __db,
    __os = navigator.appVersion.indexOf("Win") != -1 ? 'win': 'hz',
    myapp = myapp || {};

myapp.init = (function () {
    'use strict';

    var exports = {};

    (function () {
        // Initialize app
        var fw7App = new Framework7({
                modalTitle: 'Evendate',
                modalButtonCancel: 'Отмена',
                modalPreloaderTitle: 'Загрузка...'
            }),
            fw7ViewOptions = {
                dynamicNavbar: true,
                domCache: true
            },
            main_view = fw7App.addView('.view-main', fw7ViewOptions),
            profile_view = fw7App.addView('.view-profile', fw7ViewOptions),
            events_view = fw7App.addView('.view-events', fw7ViewOptions),
            favorites_view = fw7App.addView('.view-favorites', fw7ViewOptions),
            ipc,
            $$ = Dom7;
        ipc = new myapp.pages.IndexPageController(fw7App, $$);
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
}

function initAPI(route, method){
    route = route.replace(/^\//, '');
    var module = route.split('/')[0];

    switch(method){
        case 'post': {

            break;
        }
        default: case 'get': {

    }
    }
    /*parse route*/
}

function Users(){
    return {

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