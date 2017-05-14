MyApp.ns('MyApp.pages');

MyApp.pages.TicketsController = function ($scope) {
    'use strict';
    $scope.tickets = [];

    var setTicketNumber = function(number){
        var _number = [number.slice(0, 3), number.slice(3, 6), number.slice(6, 9)].join(' ');
        $$('.popup-ticket-number').text('№ ' + _number)
    };

    $scope.setTickets = function (tickets) {
        $scope.tickets = tickets;
        $$('.popup-tickets').on('popup:opened', function () {
            setTicketNumber(tickets[0].number);
            fw7App.swiper($$('#tickets-swiper'),{
                centeredSlides: true,
                nextButton: '.tickets-swiper-button-next',
                prevButton: '.tickets-swiper-button-prev',
                onSlideChangeEnd: function(swiper){
                    setTicketNumber(tickets[swiper.activeIndex].number);
                }
            });
            $$('.popup-tickets-close').off('click')
                .on('click', function(){
                    fw7App.closeModal($$('.popup-tickets'));
                })
        });
        fw7App.popup('.popup-tickets');
    };

};