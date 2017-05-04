/*jslint browser: true*/
/*global console, Dom7, $, angular, angularApp*/

MyApp.ns('MyApp.pages');

MyApp.pages.CatalogPageController = function ($scope) {
    'use strict';

    $scope.selected_organization = null;
    $scope.organization_categories = [];
    $scope.is_downloading = true;
    $scope.cities = [];
    $scope.city = {};


    $scope.selectCity = function(city){
        __organizations.cities.set(city.id);
        $scope.city = city;
        $scope.is_downloading = true;
        $scope.organization_categories = [];
        fw7App.accordionClose('.select-city.accordion-item');
        $scope.updateOrganizationsList();
    };


    $scope.updateOrganizationsList = function(){
        __organizations.getList(function (categories_array) {
            $scope.organization_categories = categories_array;
            $scope.is_downloading = false;
            fw7App.hideIndicator();
            $$('.organizations-list button')
                .off('touchend click')
                .on('touchend', function (e) {
                    $$(this).parents('.item-link').removeClass('disable-active-state');
                    e.stopPropagation();
                })
                .on('click', function (e) {
                    $$(this).parents('.item-link').addClass('disable-active-state');
                    e.stopPropagation();
                });
            $$('.organizations-list .item-link').on('touchstart', function (e) {
                if ($$(e.target).is('button')) {
                    $$(this).addClass('disable-active-state');
                    e.stopPropagation();
                } else {
                    $$(this).removeClass('disable-active-state');
                }
            });
            try{
                $scope.$digest();
            }catch (e){}

        });
    };

    $scope.getOrganizationsCatalog = function () {
        __organizations.cities.get({fields: 'distance', order_by: 'distance'}, function(cities){
            var city_index = 0;
            if (cities){
                $scope.cities = cities;
                cities.forEach(function(city, index){
                    if (city.id == __organizations.cities.getId()){
                        city_index = index;
                    }
                });
            }
            $scope.selectCity(cities[city_index]);
        });


    };

};