function Tickets() {

    function getOrder(ticket, callback) {
        $$.ajax({
            url: CONTRACT.URLS.API_FULL_PATH + CONTRACT.URLS.EVENTS_PATH + '/' + ticket.event_id + CONTRACT.URLS.ORDERS_PATH + '/' + ticket.ticket_order_uuid,
            data: {fields: 'registration_fields'},
            success: function (res) {
                callback(res.data);
            }
        });
    }

    function normalize(ticket) {
        ticket.number = [ticket.number.slice(0, 3), ticket.number.slice(3, 6), ticket.number.slice(6, 9)].join(' ');

        ticket.updateCheckoutText = function(){
            ticket.approve_btn_text = ticket.checkout ? 'Отменить подтверждение' : 'Подтвердить'
        };

        ticket.toggleCheckout = function () {
            ticket.checkout = !ticket.checkout;
            var _url = CONTRACT.URLS.API_FULL_PATH + CONTRACT.URLS.STATISTICS_PATH +  CONTRACT.URLS.EVENTS_PATH + '/' + ticket.event_id + CONTRACT.URLS.TICKETS_PATH  + '/' + ticket.uuid,
                opts = {
                    type: 'PUT',
                    url: _url,
                    data: {checkout: ticket.checkout}
                };
            ticket.updateCheckoutText();
            $$.ajax(opts);

            return ticket;
        };

        ticket.showConfirmationBar = function () {
            fw7App.showIndicator();
            getOrder(ticket, function (order) {
                ticket.fields = order.registration_fields;
                ticket.updateCheckoutText();
                var $scope = angular.element($$('.checkin-modal')[0]).scope();
                $scope.setTicket(ticket);

                fw7App.hideIndicator();
            });
        };

        return ticket;
    }

    return {
        'get': function (filters, cb) {
            var _f = prepareFilterQuery(filters);
            var _url_part = CONTRACT.URLS.EVENTS_PATH;
            if (_f.data.event_id && _f.data.stats === true) {
                _url_part = CONTRACT.URLS.STATISTICS_PATH + CONTRACT.URLS.EVENTS_PATH + '/' + _f.data.event_id;
                delete _f.data.event_id;
            }
            $$.ajax({
                url: CONTRACT.URLS.API_FULL_PATH + _url_part + CONTRACT.URLS.TICKETS_PATH,
                data: _f.data,
                success: function (res) {
                    res.data.forEach(function (value, index) {
                        res.data[index] = normalize(value);
                    });
                    cb(res.data);
                }
            });
        }
    }
}