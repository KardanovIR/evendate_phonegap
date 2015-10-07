/*jslint browser: true*/
/*global console, Dom7, $, angular, angularApp*/

MyApp.ns('MyApp.pages');

MyApp.pages.OrganizationPageController = function ($scope, $http) {
	'use strict';

	$scope.organization = {};

	$scope.setOrganization = function(organization){
		$scope.organization = organization;
	}

};