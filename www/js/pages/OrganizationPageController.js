/*jslint browser: true*/
/*global console, Dom7, $, angular, angularApp*/

MyApp.ns('MyApp.pages');

MyApp.pages.OrganizationPageController = function ($scope, $http) {
	'use strict';

	$scope.organization = {};

	$scope.setOrganization = function(organization){
		$scope.organization = organization;
		$$('.organization-events-loader').show();
		$$('.organization-events').hide();
		__api.events.get([{
			organization_id: organization.id,
			type: 'future'
		}], function(res){
			$scope.organization.events = res;
			$$('.organization-events-loader').hide();
			$$('.organization-events').show();
			$scope.$apply();
		});
	}

};