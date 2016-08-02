MyApp.ns('MyApp.pages');

MyApp.pages.UsersPageController = function ($scope) {
    'use strict';

    $scope.info = {};
    $scope.users = [];
    $scope.page_counter = 0;
    $scope.is_downloading = false;
    $scope.all_downloaded = false;

    function getPortion(cb) {
        if ($scope.all_downloaded) return cb();
        $scope.is_downloading = true;

        if (!$scope.$$phase) {
            $scope.$apply();
        } else {
            setTimeout(function () {
                if (!$scope.$$phase) {
                    $scope.$apply();
                }
            }, 1000);
        }
        if ($scope.info.organization_id) {
            __api.organizations.get([
                {id: $scope.info.organization_id},
                {fields: 'subscribed{length:10,offset:' + 10 * $scope.page_counter++ + ',order_by:"-is_friend,random",fields:"random,type,uid,is_friend"}'}
            ], function (res) {
                var data = res[0];
                if (data.subscribed.length < 10) {
                    $scope.all_downloaded = true;
                }
                $scope.users = $scope.users.concat(__api.users.normalize(data.subscribed));
                $scope.is_downloading = false;
                cb();
            });
        } else if ($scope.info.event_id) {
            __api.events.get([
                {id: $scope.info.event_id},
                {fields: 'favored{length:10,offset:' + 10 * $scope.page_counter++ + ',order_by:"-is_friend,random",fields:"random,type,is_friend"}'}
            ], function (res) {
                var data = res[0];
                if (data.favored.length < 10) {
                    $scope.all_downloaded = true;
                }
                $scope.users = $scope.users.concat(__api.users.normalize(data.favored));
                $scope.is_downloading = false;
                cb();
            });
        }
    }

    $scope.setInfo = function (info) {
        $scope.info = info;
        getPortion(function () {
            if (!$scope.$$phase) {
                $scope.$apply();
            } else {
                setTimeout(function () {
                    if (!$scope.$$phase) {
                        $scope.$apply();
                    }
                }, 1000);
            }
        });
    };


    $$('.friends_subscribed.page-content').on('infinite', function () {
        if ($scope.is_downloading) return;
        getPortion(function () {
            $scope.$digest();
        });
    });

};