MyApp.ns('MyApp.pages');

MyApp.pages.TicketsController = function ($scope) {
    'use strict';
    $scope.tickets = [];
    $scope.swiper = null;

    var setTicketNumber = function (number) {
        var _number = [number.slice(0, 3), number.slice(3, 6), number.slice(6, 9)].join(' ');
        $$('.popup-ticket-number').text('№ ' + _number)
    };

    $scope.setTickets = function (tickets) {
        $scope.tickets = tickets;
        $$('.popup-tickets').off('popup:opened').on('popup:opened', function () {

            setTicketNumber(tickets[0].number);
            if ($scope.swiper) {
                $scope.swiper.update();
                $scope.swiper.slideTo(0, 0);
            } else {
                $scope.swiper =
                    fw7App.swiper($$('#tickets-swiper'), {
                        centeredSlides: true,
                        nextButton: '.tickets-swiper-button-next',
                        prevButton: '.tickets-swiper-button-prev',
                        onSlideChangeEnd: function (swiper) {
                            setTicketNumber($scope.tickets[swiper.activeIndex].number);
                        }
                    });
            }
            $$('.popup-tickets-close').off('click')
                .on('click', function () {
                    fw7App.closeModal($$('.popup-tickets'));
                })
        });
        if (!$scope.$$phase) {
            $scope.$apply();
        } else {
            setTimeout(function () {
                if (!$scope.$$phase) {
                    $scope.$apply();
                }
            }, 500);
        }
        fw7App.popup('.popup-tickets');
    };

};