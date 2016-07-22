/*jslint browser: true*/
/*global console, Dom7, $, angular, angularApp*/

MyApp.ns('MyApp.pages');

MyApp.pages.EventsInDayController = function ($scope, $element) {
	'use strict';

	var $$element = $$($element);

	$scope.day_events = [];
	$scope.date = null;
	$scope.no_events = false;
	$scope.is_downloading = false;
    $scope.all_downloaded = false;
	$scope.page_counter = 1;

	function getEventsPortion(date, cb){
        if ($scope.all_downloaded) return cb();
		var is_first_page = $scope.page_counter == 0,
            send_data = [
			{date: date},
			{fields: 'dates{length:500,fields:"start_time,end_time"},image_horizontal_large_url,is_favorite,is_same_time'},
			{length: 10},
			{offset: $scope.page_counter++ * 10},
			{order_by: '-is_favorite'},
			{my: true}
		];
        $scope.is_downloading = true;
		__api.events.get(send_data, function(data){
            if (data.length < 10){
                $scope.all_downloaded = true;
            }
			$scope.setEvents(data, is_first_page);
            $scope.is_downloading = false;
            cb();
		});
	}

	function changeDate(direction){
        fw7App.showIndicator();
		$scope.no_events = false;
        $scope.all_downloaded = false;
		$scope.page_counter = 0;
		$scope.$apply();

		var $$loader = $$element.find('.calendar-loader').show();
		$scope.day_events = [];
		$scope.setDate($scope.date.add(direction, 'days'));

		getEventsPortion($scope.date.format(CONTRACT.DATE_FORMAT), function(){
			$$loader.hide();
            fw7App.hideIndicator();
		});
	}

	$scope.setEvents = function(data, is_first_page){
        data.forEach(function(item){
            item.moment_dates.forEach(function(m_date){
                if (m_date.start_date.format(CONTRACT.DATE_FORMAT) == $scope.date.format(CONTRACT.DATE_FORMAT)){
                    item.display_time = {
                        start:  m_date.start_date.format('HH:ss'),
                        end:  m_date.end_date.format('HH:ss')
                    }
                }
            })
        });
		if (is_first_page){
			$scope.day_events = data;
			$scope.no_events = data.length == 0;
		}else{
			$scope.day_events = $scope.day_events.concat(data);
		}
		$scope.$digest();
	};

	$scope.setDate = function(date){
		$scope.date = date;
		$scope.date_text = date.format('DD MMMM');

		var __today = moment();
		if (__today.format(CONTRACT.DATE_FORMAT) == date.format(CONTRACT.DATE_FORMAT)){
			$scope.date_text = 'Сегодня';
		}else if (__today.add('days', 1).format(CONTRACT.DATE_FORMAT) == date.format(CONTRACT.DATE_FORMAT)){
			$scope.date_text = 'Завтра';
		}
		$scope.$digest();
	};


	$$element.find('.left').on('click', function(){
		changeDate(-1);
	});


	$$element.find('.right').on('click', function(){
		changeDate(1);
	});


    $$('.events_in_day.page-content').on('infinite', function (){
        if ($scope.is_downloading) return;
        getEventsPortion($scope.date.format(CONTRACT.DATE_FORMAT), function(){});
    });
};