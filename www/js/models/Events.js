function Events() {

    var is_opening = false;

    function normalize(items) {
        if (!items) return items;
        var _items = [],
            _today = moment().format(CONTRACT.DATE_FORMAT),
            _today_unix = moment(_today + ' 00:00:00').unix();
        items.forEach(function (event) {
            event.tags_array = [];
            event.future_moment_dates = [];
            event.moment_dates = [];
            event.moment_dates_object = {};


            if (window.innerWidth > 320) {
                event.image_horizontal_medium_url = event.image_horizontal_url + '?width=' + window.innerWidth;
            }

            event.image_horizontal_url = event.image_horizontal_url + '?width=750';


            if (event.tags) {
                event.tags.forEach(function (tag) {
                    event.tags_array.push(tag.name);
                });
            }


            if (event.hasOwnProperty('nearest_event_date') && event.nearest_event_date !== null) {
                event.moment_nearest_event_date = moment.unix(event.nearest_event_date);
                event.nearest_event_date_string = event.moment_nearest_event_date.format('DD/MM');
            }

            if (event.hasOwnProperty('first_event_date') && event.first_event_date !== null) {
                event.moment_first_event_date = moment.unix(event.first_event_date);
            }
            if (event.hasOwnProperty('last_event_date') && event.last_event_date !== null) {
                event.moment_last_event_date = moment.unix(event.last_event_date);
            }

            event.liked_users_count = event.favored_users_count;

            if (event.registration_required) {
                event.registration_till_moment = moment.unix(event.registration_till);
                event.registration_till_text = 'до ' + event.registration_till_moment.format('HH:mm DD MMMM');
            } else {
                event.registration_till_text = 'Не требуется';
            }

            if (event.dates) {
                event.dates.forEach(function (event_day) {
                    var _date = moment.unix(event_day.event_date),
                        day = _date.format(CONTRACT.DATE_FORMAT),
                        current = {
                            start_date: moment(day + ' ' + event_day.start_time),
                            end_date: moment(day + ' ' + event_day.end_time)
                        };
                    if (event.moment_dates.hasOwnProperty(day) == false) event.moment_dates_object[day] = [];
                    event.moment_dates.push(current);
                    event.moment_dates_object[day].push(current);
                    if (event_day.event_date >= _today_unix) {
                        event.future_moment_dates.push(current);
                    }
                    if (day == _today) {
                        event.today = {
                            moment: current,
                            start_time: event_day.start_time,
                            end_time: event_day.end_time
                        };
                    }
                });

                event.begin_time = event.moment_dates[0].start_date.format('HH:mm');

                event.one_day = event.dates.length == 1;
                event.short_dates = [];
                event.dates_text = [];
                event.future_dates_text = [];
                event.dates_text_obj = [];
                event.every_day = true;

                if (event.is_free == true) {
                    event.price_text = 'Бесплатно';
                } else {
                    event.price_text = event.min_price == null ? '' : 'от ' + event.min_price + ' руб.';
                }

                event.moment_dates.forEach(function (val, index) {
                    var mdate = val.start_date.clone();
                    event.short_dates.push(val.start_date.format('DD/MM'));
                    event.dates_text.push(val.start_date.format('DD/MM'));
                    if (val.end_date.unix() > _today_unix) {
                        event.future_dates_text.push(val.start_date.format('DD/MM'));
                    }


                    event.dates_text_obj.push(val.start_date.format('DD MMMM с HH:mm до ') + val.end_date.format('HH:mm'));

                    if (index == 0) return true;
                    event.every_day =
                        event.every_day
                        &&
                        mdate.add(-1, 'days').format(CONTRACT.DATE_FORMAT)
                        ==
                        event.moment_dates[index - 1].start_date.format(CONTRACT.DATE_FORMAT)
                });

                if (event.is_same_time && event.every_day) {
                    if (event.dates.length > 1) {
                        event.dates_text = '' + event.moment_dates[0].start_date.format('DD/MM') + ' - ' + event.moment_dates[event.moment_dates.length - 1].start_date.format('DD/MM');
                        event.dates_text += "\n" + ' c ' + event.moment_dates[0].start_date.format('HH:mm') + ' по ' + event.moment_dates[0].end_date.format('HH:mm');
                        event.short_dates = event.dates_text;
                    } else {
                        event.dates_text = event.moment_dates[0].start_date.format('DD/MM');
                        event.dates_text += "\n" + ' c ' + event.moment_dates[0].start_date.format('HH:mm') + ' по ' + event.moment_dates[0].end_date.format('HH:mm');
                        event.short_dates = event.dates_text;
                    }
                } else {
                    event.dates_text = event.dates_text.join(', ');
                    event.short_dates = null;
                }
                event.future_dates_text = event.future_dates_text.join(', ');

                event.day_name = event.moment_dates[0].start_date.format('dddd');
            }

            event.first_dates = event.moment_dates[0];
            event.last_dates = event.moment_dates[event.moment_dates.length - 1];

            if (event.registration_fields) {
                event.form_fields = [];
                event.registration_fields.forEach(function (field) {
                    var _type = 'text';
                    switch (event.type) {
                        case 'email': {
                            _type = 'email';
                            break;
                        }
                    }
                    event.form_fields.push({
                        name: field.uuid,
                        required: field.required,
                        label: field.label,
                        original_type: field.type,
                        type: _type,
                        uuid: field.uuid,
                        values: field.values
                    });
                })
            }

            var _a = document.createElement('a'),
                _url = event.detail_info_url,
                params_array = ['utm_source=Evendate', 'utm_campaign=' + encodeURIComponent(event.title), 'utm_medium=affiliated'];

            _a.href = event.detail_info_url;

            if (_a.search !== '') {
                _url += '&' + params_array.join('&')
            } else {
                _url += '?' + params_array.join('&')
            }

            event.detail_info_url = _url;
            event.tags_text = event.tags_array.join(', ');
            event.hide_text = 'Не показывать';


            event.map_url = '"https://maps.googleapis.com/maps/api/staticmap?center=' + encodeURI(event.location) + '&zoom=14&size=100x120&maptype=roadmap&key=AIzaSyDTMfxuwhYa6sLEQ0Pib78RH0C_GzwPHAY"';

            if (event.notifications) {
                event.notifications_by_types = {};
                event.notifications.forEach(function (notification) {
                    event.notifications_by_types[notification.notification_type] = notification;
                })
            }

            function updateNotification(type, status, uuid) {
                if (!__authorized) {
                    showAuthorizationModal();
                    return;
                }

                if (event.notifications_by_types.hasOwnProperty(type) == false) {
                    event.notifications_by_types[type] = {
                        status: false,
                        done: false,

                    }
                }
                if (status != null) {
                    event.notifications_by_types[type].status = status;
                }
                if (uuid !== undefined) {
                    event.notifications_by_types[type].uuid = uuid;
                }
            }

            event.showTickets = function () {

                var processEvent = function(_event){
                    var _tickets = [];
                    _event.tickets.forEach(function (item) {
                        item.event_title = _event.title;
                        item.event_location = _event.location;

                        item.status_text = item.checkout == true ? 'Билет использован' : item.order.status_name;

                        if (_event.nearest_event_date != null) {
                            item.event_date_time = _event.future_moment_dates[0].start_date.format('DD MMM') + ', ' + _event.future_moment_dates[0].start_date.format('HH:mm') + ' - ' + _event.future_moment_dates[0].end_date.format('HH:mm');
                        } else {
                            item.event_date_time = _event.moment_dates[0].start_date.format('DD MMM') + ', ' + _event.moment_dates[0].start_date.format('HH:mm') + ' - ' + _event.moment_dates[0].end_date.format('HH:mm');
                        }
                        _tickets.push(item);
                    });
                    return _tickets;
                };

                if (event.tickets) {
                    var $scope = angular.element($$('.popup-tickets')[0]).scope();
                    $scope.setTickets(processEvent(event));
                } else {
                    __api.events.get([
                        {id: event.id},
                        {fields: 'created_at,location,tickets{fields:"order,ticket_type,checkout"},nearest_event_date,dates'},
                        {order_by: '-created_at'}
                    ], function(res){
                        var $scope = angular.element($$('.popup-tickets')[0]).scope();
                        $scope.setTickets(processEvent(res[0]));
                    })
                }
            };

            event.not_default_inputs = ['extended_custom', 'select', 'select_multi'];

            event.getUser = function () {
                return __user;
            };

            event.toggleHidden = function () {
                if (!__authorized) {
                    showAuthorizationModal();
                    return;
                }

                $$.ajax({
                    url: CONTRACT.URLS.API_FULL_PATH + CONTRACT.URLS.EVENTS_PATH + '/' + event.id + '/status',
                    data: {
                        hidden: 1
                    },
                    type: 'PUT'
                })
            };

            event.showRegistrationForm = function () {
                if (event.registration_required !== true
                    || event.registration_locally !== true
                    || event.registration_available !== true) {
                    event.openDetailInfoUrl();
                    return
                }
                if ($$('.picker-modal.modal-in').length > 0) {
                    fw7App.closeModal('.picker-modal.modal-in');
                }
                var selector = '.page.event.page-on-center .registration-form',
                    $picker_el = $$(selector),
                    $overlay_el = $$('.registration-form-overlay'),
                    $$reg_text = $$('.registration-text'),
                    $$bottom_bar_main_btn = $$('.clickable-icon.main'),
                    $$close_registration_modal_btn = $$('.close-registration-modal');

                $overlay_el.removeClass('hidden');
                $picker_el.removeClass('hidden').on('closed', function (e) {
                    $picker_el.addClass('hidden');
                    $overlay_el.addClass('hidden');
                    $$reg_text.removeClass('muted');
                    $$bottom_bar_main_btn.removeClass('hidden');
                    $$close_registration_modal_btn.addClass('hidden');
                });

                $$('.close-registration-modal').off('click').on('click', function () {
                    fw7App.closeModal(selector);
                });
                fw7App.pickerModal(selector);
                $$reg_text.addClass('muted');
                $$bottom_bar_main_btn.addClass('hidden');
                $$close_registration_modal_btn.removeClass('hidden');
            };

            event.smallCardFavorite = function ($event) {
                var $$this = $$($event.target),
                    $$event_card = $$this.parents('.event-card-small');
                if ($$event_card.hasClass('favored')) {
                    $$event_card.removeClass('favored');
                } else {
                    $$event_card.addClass('favored');
                }
                event.toggleFavorite();
            };

            event.open = function () {
                if (is_opening) return;
                is_opening = true;
                fw7App.showIndicator();

                var _event = this;
                if (callbackObjects['eventPageBeforeAnimation']) {
                    callbackObjects['eventPageBeforeAnimation'].remove();
                }
                if (callbackObjects['eventPageAfterAnimation']) {
                    callbackObjects['eventPageAfterAnimation'].remove();
                }

                callbackObjects['eventPageBeforeAnimation'] = fw7App.onPageBeforeAnimation('event', function (page) {
                    var $$container = $$(page.container),
                        $$page = $$container.parents('.page.event');
                    if ($$container.data('opened') == true) {
                        var $scope = angular.element($$container[0]).scope();
                        $scope.setEvent(_event);
                        $$page.find('.heading-name').text(_event.title);
                    } else {
                        var rootElement = angular.element(document);
                        rootElement.ready(function () {
                            rootElement.injector().invoke(["$compile", function ($compile) {
                                var scope = angular.element(page.container).scope();
                                $compile(page.container)(scope);
                                var $scope = angular.element($$container[0]).scope();
                                $scope.setEvent(_event);
                                $$page.find('.heading-name').text(_event.title);
                                $$container.data('opened', true);
                            }]);
                        });
                    }
                    fw7App.hideIndicator();
                });
                callbackObjects['eventPageAfterAnimation'] = fw7App.onPageAfterAnimation('event', function () {
                    is_opening = false;
                });

                fw7App.getCurrentView().router.loadPage({
                    url: 'pages/event.html?id=' + event.id + '&t=' + new Date().getTime() + '&event_id=' + event.id,
                    query: {id: event.id, event: event},
                    pushState: true,
                    animatePages: true
                });
            };

            event.share = function () {
                window.plugins.socialsharing.shareWithOptions({
                    message: 'Мне понравилось событие ' + event.title + ' в ' + event.organization_name, // not supported on some apps (Facebook, Instagram)
                    subject: event.title, // fi. for email
                    files: [event.image_horizontal_url], // an array of filenames either locally or remotely
                    url: 'http://evendate.io/event/' + event.id
                }, function () {
                }, function () {
                });
            };

            event.openDetailInfoUrl = function () {
                storeStat(event.id, CONTRACT.ENTITIES.EVENT, CONTRACT.STATISTICS.EVENT_OPEN_SITE);
                window.open(event.detail_info_url, '_system', 'location=yes');
            };

            event.openMap = function () {
                var url;
                if (event.latitude == 0 || event.longitude) {
                    url = 'maps://?q=' + event.location;
                } else {
                    url = 'maps://?q=' + event.latitude + ' , ' + event.longitude;
                }
                storeStat(event.id, CONTRACT.ENTITIES.EVENT, CONTRACT.STATISTICS.OPEN_MAP);
                window.open(url, '_system', 'location=yes');
            };

            event.toggleFavorite = function ($event) {
                if (!__authorized) {
                    showAuthorizationModal();
                    return;
                }
                var _url = CONTRACT.URLS.API_FULL_PATH + CONTRACT.URLS.EVENTS_PATH + '/' + event.id + CONTRACT.URLS.FAVORITES_PART,
                    opts = {
                        type: 'POST',
                        url: _url,
                        complete: function () {
                            var favorites_scope = angular.element($$('#favorites')).scope();
                            if (favorites_scope) {

                                if (!favorites_scope.$$phase) {
                                    favorites_scope.$apply();
                                    favorites_scope.getTimeline('favorites', true, function () {
                                    });
                                } else {
                                    setTimeout(function () {
                                        if (!favorites_scope.$$phase) {
                                            favorites_scope.$apply();
                                        }
                                        favorites_scope.getTimeline('favorites', true, function () {
                                        });
                                    }, 1000);
                                }
                            }
                        }
                    };
                if (event.is_favorite) {
                    opts['type'] = 'DELETE';
                }

                event.is_favorite = !event.is_favorite;
                event.updateFavoriteTexts();
                $$.ajax(opts);


                if ($event) {
                    fw7App.swipeoutClose($$($event.target).parents('.swipeout')[0])
                }

                if (permanentStorage.getItem('add-to-calendar') == 'true') {
                    if (event.is_favorite) {
                        event.addToCalendar();
                    } else {
                        event.removeFromCalendar();
                    }
                }
                return event;
            };

            event.toggleNotification = function (type) {

                if (!__authorized) {
                    showAuthorizationModal();
                    return;
                }
                if (event.notifications) {
                    var _url = CONTRACT.URLS.API_FULL_PATH + CONTRACT.URLS.EVENTS_PATH + '/' + event.id + CONTRACT.URLS.NOTIFICATIONS_PART,
                        opts;

                    if (event.notifications_by_types[type] && event.notifications_by_types[type].status === true) {
                        opts = {
                            type: 'DELETE',
                            url: _url + '/' + event.notifications_by_types[type].uuid,
                            success: function (res) {
                                updateNotification(type, false, null);
                            }
                        };
                        updateNotification(type, false);
                    } else {
                        opts = {
                            type: 'POST',
                            data: {
                                'notification_type': type
                            },
                            url: _url,
                            success: function (res) {
                                updateNotification(type, true, res.data.uuid);
                            }
                        };
                        updateNotification(type, true)
                    }
                    $$.ajax(opts);
                } else {
                    console.error('CANT_FIND_NOTIFICATIONS');
                }
            };

            event.openOrganization = function () {

                fw7App.showIndicator();
                __api.organizations.get([
                    {id: event.organization_id}
                ], function (res) {
                    res[0].open();
                    fw7App.hideIndicator();
                });
            };

            event.removeFromCalendar = function () {
                if (!window.plugins || !window.plugins.calendar) return;
                window.plugins.calendar.deleteEvent(
                    event.title,
                    null,
                    null,
                    event.moment_dates[0].start_date.toDate(),
                    event.moment_dates[event.moment_dates.length - 1].end_date.toDate(),
                    function (message) {
                        L.log("Success: " + JSON.stringify(message));
                    },
                    function (message) {
                        L.log("error: " + message);
                    });
            };

            event.sendRegistrationForm = function (e, callback) {
                var $$form = $$(e.target).parents('.popup-registration').find('form'),
                    form_data = fw7App.formToData($$form),
                    send_data = [];

                $$.each(form_data, function (key, value) {
                    send_data.push({uuid: key, value: value});
                });

                send_data = {registration_fields: send_data};

                fw7App.showIndicator();
                event.form_fields.forEach(function (field, index) {
                    event.form_fields[index].error = null;
                });
                $$.ajax({
                    url: CONTRACT.URLS.API_FULL_PATH + CONTRACT.URLS.EVENTS_PATH + '/' + event.id + CONTRACT.URLS.ORDERS_PATH,
                    data: JSON.stringify(send_data),
                    type: 'POST',
                    contentType: 'application/json; charset=utf-8',
                    dataType: 'json',
                    success: function (res) {
                        if (res.status == false) {
                            fw7App.alert(res.text);
                            var with_errors = {};
                            res.data.registration_fields.forEach(function (field) {
                                with_errors[field.uuid] = field;
                            });
                            event.form_fields.forEach(function (field, index) {
                                event.form_fields[index].error = with_errors[field.uuid].error;
                            });
                            if (callback) {
                                callback(res);
                            }
                        } else {
                            if (callback) {
                                callback(res);
                            }
                        }

                    },
                    complete: function () {
                        fw7App.hideIndicator();
                    }
                });
            };

            event.addToCalendar = function () {

                __api.events.get([
                        {id: event.id},
                        {fields: 'dates{fields:"start_time,end_time",length:500},description,is_same_time,location,link'}
                    ],
                    function (_events) {
                        if (!window.plugins || !window.plugins.calendar) return;
                        var cal = window.plugins.calendar;
                        var _e = _events[0];
                        _e.note = _e.description + ' \n ' + _e.link;

                        var success = function (message) {
                            L.log("Success: " + JSON.stringify(message));
                        };
                        var error = function (message) {
                            L.log("Error: " + message);
                        };

                        function addDatesToCalendar() {
                            if (_e.every_day && _e.is_same_time) {
                                var calOptions = cal.getCalendarOptions(); // grab the defaults
                                calOptions.calendarName = "Evendate";
                                calOptions.recurrence = "daily"; // supported are: daily, weekly, monthly, yearly
                                calOptions.recurrenceEndDate = _e.moment_dates[_e.moment_dates.length - 1].end_date.toDate(); // leave empty to recur forever
                                calOptions.recurrenceInterval = 1;
                                cal.createEventWithOptions(
                                    _e.title,
                                    _e.location,
                                    _e.description,
                                    _e.moment_dates[0].start_date.toDate(),
                                    _e.moment_dates[_e.moment_dates.length - 1].end_date.toDate(),
                                    calOptions,
                                    success,
                                    error
                                );
                            } else {
                                (function addNextDate(date, index) {
                                    var calOptions = cal.getCalendarOptions(); // grab the defaults
                                    calOptions.calendarName = "Evendate";
                                    cal.createEventWithOptions(
                                        _e.title,
                                        _e.location,
                                        _e.description,
                                        date.start_date.toDate(),
                                        date.end_date.toDate(),
                                        calOptions,
                                        function (message) {
                                            if (++index < _e.moment_dates.length) {
                                                L.log('Added: ' + message + '... Adding next');
                                                addNextDate(_e.moment_dates[index], index);
                                            } else {
                                                L.log('Done.');
                                            }
                                        },
                                        error
                                    );
                                })(_e.moment_dates[0], 0);
                            }
                        }

                        cal.listCalendars(function (calendars) {
                            var calendar_exists = false;
                            calendars.forEach(function (calendar) {
                                if (calendar.name == 'Evendate' && calendar.id == permanentStorage.getItem('calendar-id')) {
                                    calendar_exists = true;
                                }
                            });

                            if (calendar_exists == false) {
                                var createCalOptions = cal.getCreateCalendarOptions();
                                createCalOptions.calendarName = "Evendate";
                                createCalOptions.calendarColor = "#f82969"; // an optional hex color (with the # char), default is null, so the OS picks a color
                                cal.createCalendar(createCalOptions, function (id) {
                                    permanentStorage.setItem('calendar-id', id);
                                    addDatesToCalendar();
                                }, function (message) {
                                    alert("Error: " + message);
                                });
                            } else {
                                addDatesToCalendar();
                            }
                        }, error);
                    });
            };

            event.openLikedFriends = function () {
                var _event = this;
                if (callbackObjects['likedFriendsPageBeforeAnimation']) {
                    callbackObjects['likedFriendsPageBeforeAnimation'].remove();
                }
                callbackObjects['likedFriendsPageBeforeAnimation'] = fw7App.onPageBeforeAnimation('friends_liked', function (page) {


                    if ($$(page.container).hasClass('page-on-left')) return;
                    var $$container = $$(page.container);
                    if ($$container.data('opened') == true) {
                        var $scope = angular.element($$container[0]).scope();
                        //console.log(_event);
                        $scope.setInfo({
                            background_img_url: _event.image_horizontal_url,
                            logo_url: null,
                            name: _event.title,
                            event_id: _event.id
                        });
                    } else {
                        var rootElement = angular.element(document);
                        rootElement.ready(function () {
                            rootElement.injector().invoke(["$compile", function ($compile) {
                                var scope = angular.element(page.container).scope();
                                $compile(page.container)(scope);
                                var $scope = angular.element($$container[0]).scope();
                                //console.log(_event);
                                $scope.setInfo({
                                    background_img_url: _event.image_horizontal_url,
                                    logo_url: null,
                                    name: _event.title,
                                    event_id: _event.id
                                });
                                $$container.data('opened', true);
                            }]);
                        });
                    }
                });
                fw7App.getCurrentView().router.loadPage({
                    url: 'pages/friends_liked.html',
                    query: {id: _event.id},
                    pushState: true,
                    animatePages: true
                });
            };

            event.updateFavoriteTexts = function () {
                event.favorite_text = event.is_favorite ? 'Убрать из избранного' : 'В избранное';
                event.favorite_short_text = event.is_favorite ? 'В избранном' : 'В избранное';
                event.favorite_icon = event.is_favorite ? 'ion-ios-star' : 'ion-ios-star-outline';
            };

            event.updateFavoriteTexts();
            _items.push(event);
        });
        return _items;
    }

    return {
        'get': function (filters, cb) {
            var _f = prepareFilterQuery(filters),
                _r,
                url = CONTRACT.URLS.API_FULL_PATH + CONTRACT.URLS.EVENTS_PATH;
            if (_f.data.hasOwnProperty('timeline') && _f.data.timeline == true) {
                url += '/' + CONTRACT.URLS.MY_PART
            }
            if (_f.data.hasOwnProperty('favorites') && _f.data.favorites == true) {
                url += '/' + CONTRACT.URLS.FAVORITES_PART
            }
            if (_f.data.hasOwnProperty('recommendations') && _f.data.favorites == true) {
                url += '/' + CONTRACT.URLS.RECOMMENDATIONS_PART
            }
            if (_f.data.hasOwnProperty('type')) {
                switch (_f.data.type) {
                    case 'timeline': {
                        url += '/' + CONTRACT.URLS.MY_PART;
                        break;
                    }
                    case 'favorites': {
                        url += '/' + CONTRACT.URLS.FAVORITES_PART;
                        break;
                    }
                    case 'recommendations': {
                        url += '/' + CONTRACT.URLS.RECOMMENDATIONS_PART;
                        break;
                    }
                }
            }
            if (_f.data.hasOwnProperty('id')) {
                url += '/' + _f.data.id;
            }
            if (_f.data.hasOwnProperty('my')) {
                url += '/my';
            }

            L.log(url);
            L.log(_f.data);

            $$.ajax({
                url: url,
                data: _f.data,
                success: function (res) {
                    res.data = [].concat(res.data);
                    _r = normalize(res.data);
                    cb(_r);
                }
            });

        },
        normalizeAll: function (items) {
            return normalize(items);
        },
        'dates': {
            'get': function (filters, cb) {
                var _f = prepareFilterQuery(filters),
                    url = CONTRACT.URLS.API_FULL_PATH + CONTRACT.URLS.EVENTS_PATH + '/' + CONTRACT.URLS.DATES_PATH + '';
                $$.ajax({
                    url: url,
                    data: _f.data,
                    success: function (res) {
                        cb(res.data);
                    }
                });
            }
        }
    }
}