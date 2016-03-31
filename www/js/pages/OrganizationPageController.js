/*jslint browser: true*/
/*global console, Dom7, $, angular, angularApp*/

MyApp.ns('MyApp.pages');

MyApp.pages.OrganizationPageController = function ($scope) {
	'use strict';

	$scope.organization = {};

	$scope.setOrganization = function(organization){
		$scope.organization = organization;
		$$('.organization-events-loader').show();
		$$('.organization-events').hide();
		__api.organizations.get([{
			id: organization.id,
			fields:'subscribed_count,is_subscribed,img_medium_url,background_medium_img_url,subscribed{order_by:"is_friend",length:5},events{filters:"future=true",length:100,fields:"dates,favored_count"}'
		}], function(res){
			$scope.organization = res[0];
			$$('.organization-events-loader').hide();
			$$('.organization-events').show();
			$scope.$apply();
		});
	}

};