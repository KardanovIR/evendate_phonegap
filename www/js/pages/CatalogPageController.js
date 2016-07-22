/*jslint browser: true*/
/*global console, Dom7, $, angular, angularApp*/

MyApp.ns('MyApp.pages');

MyApp.pages.CatalogPageController = function ($scope) {
    'use strict';

    $scope.selected_organization = null;
    $scope.organization_categories = [];
    $scope.data_loaded = false;

    $scope.getOrganizationsCatalog = function () {
        fw7App.showIndicator();

        __organizations.getList(function (categories_array) {
            $scope.organization_categories = categories_array;

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
        })
    };

};