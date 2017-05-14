MyApp.ns('MyApp.pages');

MyApp.pages.ApproveController = function ($scope) {
    'use strict';

    $scope.setTicket = function (ticket) {
        $scope.ticket = ticket;
        if (!$scope.$$phase) {
            $scope.$apply();
        } else {
            setTimeout(function () {
                if (!$scope.$$phase) {
                    $scope.$apply();
                }
            }, 500);
        }
        fw7App.pickerModal('.checkin-modal');
    };

    $scope.toggleCkeckout = function(){
        $scope.ticket.toggleCheckout();
    }
};