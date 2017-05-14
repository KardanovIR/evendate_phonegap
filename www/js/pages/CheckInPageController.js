MyApp.ns('MyApp.pages');

MyApp.pages.CheckInPageController = function ($scope, $timeout) {
    'use strict';


    var tab_names = ['waiting', 'used'];
    var active_tab = tab_names[0];
    var _event;
    var search_term = null;
    var _number_check = new RegExp('^[\\d\\s]+$', 'igm');

    $scope.tabs = {
        waiting: {
            items: [],
            page: 0,
            scroll: 0,
            is_downloading: false,
            all_loaded: false,
            no_items: null
        },
        used: {
            items: [],
            page: 0,
            scroll: 0,
            is_downloading: false,
            all_loaded: false,
            no_items: null
        }
    };

    $scope.getTickets = function (type, first_page, cb) {
        if ($scope.tabs[type].is_downloading) return;
        if ($scope.tabs[type].all_loaded && !first_page) return;
        if (first_page === true) {
            $scope.tabs[type].page = 0;
            $scope.tabs[type].all_loaded = false;
        }

        $scope.tabs[type].is_downloading = true;
        $scope.tabs[type].no_items = null;
        $scope.$apply();


        var fields_string = 'number,user,ticket_type,ticket_order_uuid',
            data = [
                {fields: fields_string},
                {stats: true},
                {page: $scope.tabs[type].page++},
                {length: 10},
                {event_id: _event.id}
            ];

        if (type === 'waiting') {
            data.push({checkout: false});
        } else {
            data.push({checkout: true});
        }
        if (search_term !== null && search_term.trim().length !== 0) {
            if (_number_check.test(search_term)) {
                data.push({number: search_term});
            } else {
                data.push({user_name: search_term});
            }
        }

        __api.tickets.get(data, function (data) {
            if (data.length === 0) {
                if (first_page) {
                    $scope.tabs[type].no_timeline_events = true;
                } else {
                    $scope.tabs[type].all_loaded = true;
                }
            }

            if (first_page) {
                $scope.tabs[type].items = [];
            }

            data.forEach(function (ticket) {
                $scope.tabs[type].items.push(ticket);
            });

            $scope.tabs[type].is_downloading = false;
            fw7App.pullToRefreshDone($$('#checkin-content'));
            if (cb) {
                cb();
            }
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

    $scope.setEvent = function (event, cb) {
        fw7App.showIndicator();
        _event = event;
        $scope.getTickets('waiting', true, function () {
            if (cb) {
                cb();
            }
            fw7App.hideIndicator();
            $scope.getTickets('used', true);
        });

        $$('#checkin-page').on('infinite', function () {
            var $$this = $$(this),
                $$tab = $$this.find('.tab.active');

            var name = $$tab.data('name');
            $scope.getTickets(name, false)
        });

        $$('#checkin-page').on('refresh', function () {
            var $$this = $$(this),
                $$tab = $$this.find('.tab.active');
            var name = $$tab.data('name');
            $scope.getTickets(name, true, function () {
                $scope.tabs[name].is_downloading = false;
                fw7App.pullToRefreshDone($$('#checkin-page > .checkn-page'));
            });
        });

        $$('.view.active .scan-qr-btn')
            .off('click')
            .on('click', function () {
                _event.scanQR(function (data) {
                    L.log(data);
                    if (data.cancelled !== 0) return;
                    try {
                        var _data = JSON.parse(data.text);
                        if (_event.id != _data.event_id){
                            fw7App.alert('QR не соответствует событию');
                            return;
                        }
                        L.log('Parsed:', _data);
                        __api.tickets.get([
                            {event_id: _data.event_id},
                            {uuid: _data.uuid}
                        ], function (data) {
                            data[0].showConfirmationBar();
                        });
                    } catch (e) {
                        L.log(e);
                    }
                }, function () {
                    fw7App.alert('Произошла ошибка. Попробуйте еще раз!')
                });
            });

        fw7App.searchbar('.view.active .searchbar');

        $$('.view.active .searchbar')
            .on('searchbar:disable', function () {
                var $$navbar = $$(this).parents('.navbar');
                $$navbar.find('.main-nav').removeClass('hidden');
                $$navbar.find('.searchbar').addClass('hidden');
                search_term = null;
                $scope.getTickets('waiting', true);
                $scope.getTickets('used', true);
            });

        $$('.view.active .searchbar .searchbar-input > input')
            .on('input', function (e) {
                search_term = e.target.value;
                $scope.getTickets('waiting', true);
                $scope.getTickets('used', true);
            });

        $$('.view.active .search-btn')
            .off('click')
            .on('click', function () {
                var $$navbar = $$(this).parents('.navbar'),
                    $$searchbar = $$navbar.find('.searchbar');
                $$navbar.find('.main-nav').toggleClass('hidden');
                $$searchbar.toggleClass('hidden');
                if ($$searchbar.hasClass('hidden') === false) {
                    $$searchbar.find('.searchbar-input > input').focus();
                }
            })
    };


    $$('#waiting').on('show', function () {
        $$('#checkin-content').scrollTop($scope.tabs['waiting'].scroll, 0);
    });

    $$('#used').on('show', function () {
        $$('#checkin-content').scrollTop($scope.tabs['used'].scroll, 0);
    });
};